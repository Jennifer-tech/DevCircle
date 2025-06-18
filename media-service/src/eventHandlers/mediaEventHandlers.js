const Media = require("../models/mediaModel")
const { deleteMediaFromCloudinary } = require("../utils/cloudinary")
const logger = require("../utils/logger")

const handlePostDeleted = async(event) => {
    console.log(event, "eventeventevent")

    const {postId, mediaIds} = event

    try{
        const mediaToDelete = await Media.find({_id: {$in: mediaIds}})

        for(const media of mediaToDelete) {
            await deleteMediaFromCloudinary(media.publicId)
            await Media.findByIdAndDelete(media._id)

            logger.info(`Deleted media ${media._id} associated with this deleted post ${postId}`)
        }

        logger.info(`Successfully deleted all media associated with post ${postId}`)
    } catch(e) {
        logger.error(e, "Error occured while deleting media")
    }
}
module.exports = { handlePostDeleted };