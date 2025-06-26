const amqp = require('amqplib');
const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');

let connection = null;
let channel = null;

const EXCHANGE_NAME = 'post_events'

async function connectToRabbitMQ(){
    try{
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();

        await channel.assertExchange(EXCHANGE_NAME, 'topic', {durable: false});
        logger.info('Connected to RabbitMQ successfully');
        return channel

    } catch(e) {
        logger.error('Error connecting to RabbitMQ:', e)
    }
}

async function publishEvent(routingKey, message) {
    if(!channel) {
        await connectToRabbitMQ()
    }

    channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(message)))
    logger.info(`Event Published: ${routingKey}`)
}

async function consumeEvent(routingKey, callback) {
    if(!channel) {
        await connectToRabbitMQ()

    }
    const q = await channel.assertQueue('', {exclusive: true});
    await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);
    channel.consume(q.queue, (msg) => {
        if(msg !== null) {
            const content = JSON.parse(msg.content.toString());
            callback(content);
            channel.ack(msg)
        }
    })
    logger.info(`Subscribe event: ${routingKey}`)
}

async function publishRpcEvent(routingKey, message) {
    if(!channel) await connectToRabbitMQ();

    const correlationId = uuidv4();

    const q = await channel.assertQueue('', { exclusive: true});

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('RPC timeout'));
        }, 5000)

        channel.consume(
            q.queue,
            (msg) => {
                if(msg.properties.correlationId === correlationId) {
                    clearTimeout(timeout);
                    const response = JSON.parse(msg.content.toString());
                    resolve(response);
                }
            },
            { noAck: true }
        );

        channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(message)), {
            replyTo: q.queue,
            correlationId
        })
    })
}

async function consumeRpc(routingKey, handler) {
    if (!channel) await connectToRabbitMQ();

    const q = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);

    channel.consume(q.queue, async (msg) => {
        const data = JSON.parse(msg.content.toString())

        try {
            const result = await handler(data);
            channel.sendToQueue(
                msg.properties.replyTo,
                Buffer.from(JSON.stringify(result)),
                { correlationId: msg.properties.correlationId }
            );
        } catch (err) {
            logger.error("RPC handler error", err);
            channel.sendToQueue(
                msg.properties.replyTo,
                Buffer.from(JSON.stringify({ error: err.message })),
                { correlationId: msg.properties.correlationId }
            )
        }
        channel.ack(msg)
    })
    logger.info(`RPC responder listening on ${routingKey}`);
}
module.exports = { connectToRabbitMQ, publishEvent, consumeEvent, publishRpcEvent, consumeRpc }