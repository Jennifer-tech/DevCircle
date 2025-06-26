const { uploadMediaToCloudinary } = require('../utils/cloudinary')
const logger = require('../utils/logger')
const Media = require('../models/mediaModel')

const uploadMedia = async(req, res) => {
    logger.info('Starting media upload')
    try{
        if(!req.file) {
            logger.error('No file added. Please add a file and try again')
            return res.status(400).json({
                success: false,
                message: 'No file found. Please add a file and try again'
            })
        }

        const { originalname, mimetype, buffer } = req.file
        const userId = req.user.userId

        logger.info(`File details: ${originalname}, ${mimetype}`)
        logger.info('Uploading to cloudinary starting...')

        const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file)

        logger.info(`Cloudinary upload successfully. Public ID: ${cloudinaryUploadResult.public_id}`)

        const newlyCreatedMedia = new Media({
            publicId: cloudinaryUploadResult.public_id,
            originalName: originalname,
            mimeType: mimetype,
            url: cloudinaryUploadResult.secure_url,
            userId
        })

        await newlyCreatedMedia.save()
        
        res.status(201).json({
            success: true,
            mediaId: newlyCreatedMedia._id,
            url: newlyCreatedMedia.url,
            message: 'Media uploaded successfully'
        })
    } catch (error) {
        logger.error('Error uploading media', error)
        res.status(500).json({
            success: false,
            message: "Internal Server error"
        })
    }
}

const getAllMedias = async(req, res) => {
    try {
        const results = await Media.find({})
        res.json({
            success: true,
            results: results.length,
            medias: results
        })
    } catch(e) {
        logger.error('Error fetching media', e)
        res.status(500).json({
            success: false,
            message: 'Error Fetching medias'
        })
    }
}

module.exports = {uploadMedia, getAllMedias}