    const Media = require("../models/mediaModel")
    const logger = require("../utils/logger")
    const { deleteMediaFromS3 } = require("../utils/s3")

    const handlePostDeleted = async(event) => {
        const {postId, mediaIds} = event

        try{
            const mediaToDelete = await Media.find({_id: {$in: mediaIds}})

            for(const media of mediaToDelete) {
                await deleteMediaFromS3(media.publicId)
                await Media.findByIdAndDelete(media._id)

                logger.info(`Deleted media ${media._id} associated with this deleted post ${postId}`)
            }

            logger.info(`Successfully deleted all media associated with post ${postId}`)
        } catch(e) {
            logger.error(e, "Error occured while deleting media")
        }
    }
    module.exports = { handlePostDeleted };