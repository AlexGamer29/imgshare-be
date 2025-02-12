const {
  countImagesByOwnerId,
  getImagesByOwnerId,
} = require('../../services/images');

const models = require('../../database/');
const { S3_BUCKET_NAME } = require('../../config/config');
const s3 = require('../../config/s3');

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

const uploadImage = async (req, res) => {
  try {
    const saveImg = await models.images.create({
      ownerId: req?.user?.id,
      originalName: req?.file?.originalname,
      key: req?.file?.key,
      location: req?.file?.location,
      mimeType: req?.file?.mimetype,
      size: req?.file?.size,
      storageClass: req?.file?.storageClass,
      etag: req?.file?.etag,
      acl: req?.file?.acl,
      bucket: req?.file?.bucket,
    });
    // console.log(req);
    return res.json({
      data: { message: 'File uploaded successfully!', ...saveImg.dataValues },
      error: null,
    });
  } catch (error) {
    res.status(500).send({
      error: 'Error uploading the file',
      details: error,
    });
  }
};

const deleteImage = async (req, res) => {
  const { key } = req.body; // The S3 key should be sent in the request body

  if (!key) {
    return res.status(400).json({ error: 'Image key is required' });
  }

  // Set the parameters for deleting the object from S3
  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: key,
  };

  try {
    // Delete the image from S3 using the promise interface
    await s3.deleteObject(params).promise();

    // Optionally, delete the image record from your database
    await models.images.destroy({ where: { key } });

    return res.json({
      data: { message: 'Image deleted successfully' },
      error: null,
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    return res.status(500).json({
      error: 'Error deleting image',
      details: error,
    });
  }
};

module.exports = {
  getAllImages,
  uploadImage,
  deleteImage,
};
