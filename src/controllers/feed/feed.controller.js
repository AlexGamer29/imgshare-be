const { getFeedImages } = require('../../services/feed');

const getFeed = async (req, res) => {
  try {
    const result = await getFeedImages(req?.user?.id);
    res.json({ data: result, error: null });
  } catch (error) {
    res.status(500).send({
      data: null,
      error: error?.name + ': ' + error?.message,
    });
  }
};

module.exports = {
  getFeed,
};