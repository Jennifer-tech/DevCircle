const Joi = require('joi');

const validateCreateComment = (data) => {
    const schema = Joi.object({
        postId: Joi.string().required(),
        content: Joi.string().min(3).max(5000).required(),
    })
    return schema.validate(data);
}

const validateUpdateComment = (data) => {
    const schema = Joi.object({
        content: Joi.string().min(3).max(5000),
    })
    return schema.validate(data);
}
module.exports = { validateCreateComment, validateUpdateComment };