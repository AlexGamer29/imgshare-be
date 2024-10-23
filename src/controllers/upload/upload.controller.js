const models = require('../../database/');

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

module.exports = {
  uploadImage,
};
