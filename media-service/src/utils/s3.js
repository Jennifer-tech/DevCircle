const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('dotenv').config();


const s3 = new S3Client({
    region: process.env.AWS_REGION,
})

const uploadMediaToS3 = async (file) => {
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    const key = `uploads/${uniqueId}${extension}`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        // ACL: 'public-read'
    });

    await s3.send(command);

    return {
        key,
        url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
    }
}

const deleteMediaFromS3 = async (key) => {
    try {
        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key
        });
        await s3.send(command);
    } catch (error) {
        throw new Error(`S3 deletion failed for key ${key}: ${error.message}`)
    }
}

module.exports = { uploadMediaToS3, deleteMediaFromS3 }