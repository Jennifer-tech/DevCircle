const Search = require("../models/searchModel");
const logger = require("../utils/logger");

const searchPostController = async (req, res) => {
  logger.info("Search endpoint hit");

  try {
    const {query} = req.query;

    const results = await Search.find(
        {
            $text: {$search: query},
        },
        {
            score: {$meta: 'textScore'},
        }
    ).sort({score: {$meta: 'textScore'}}).limit(10);

    res.json(results)
  } catch (e) {
    logger.error("Error while searching post", e);
    res.status(500).json({
      success: false,
      message: "Error while searching post",
    });
  }
};

module.exports = { searchPostController}