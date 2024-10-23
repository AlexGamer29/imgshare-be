const {
  countImagesByOwnerId,
  getImagesByOwnerId,
} = require('../../services/images');

const getAllImages = async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  try {
    const start = (page - 1) * limit;
    const total = await countImagesByOwnerId(req?.user?.id);
    const next_page = start + limit < total ? page + 1 : null;
    const images = await getImagesByOwnerId(req?.user?.id, start, limit);
    return res.json({
      data: {
        total,
        per_page: limit,
        current_page: page,
        next_page,
        images,
      },
      error: null,
    });
  } catch (error) {
    res.status(500).send({
      error: 'Error uploading the file',
      details: error,
    });
  }
};

module.exports = {
  getAllImages
};
