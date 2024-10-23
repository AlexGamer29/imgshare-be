const Models = require('../database/index');

const find = async (modelDb, queryObj, include, options = {}) =>
  await Models[modelDb].findAll({ where: queryObj, include, ...options });

const findOne = async (modelDb, queryObj) =>
  await Models[modelDb].findOne({ where: queryObj });

const findOneAndSelect = async (modelDb, queryObj, selectQuery) =>
  await Models[modelDb].findOne({
    where: queryObj,
    attributes: selectQuery,
  });

const insertNewDocument = async (modelDb, storeObj) =>
  await Models[modelDb].create(storeObj);

const updateDocument = async (modelDb, updateQuery, setQuery) =>
  await Models[modelDb].update(setQuery, {
    where: updateQuery,
    returning: true,
    plain: true,
  });

const customUpdate = async (modelDb, updateQuery, setQuery) =>
  await Models[modelDb].update(setQuery, { where: updateQuery });

const deleteDocument = async (modelDb, deleteQuery) =>
  await Models[modelDb].destroy({ where: deleteQuery });

const findPopulateSortAndLimit = async (
  modelDb,
  searchQuery,
  sortedBy,
  skip,
  limit
) =>
  await Models[modelDb].findAll({
    where: searchQuery,
    order: [sortedBy],
    offset: skip,
    limit: limit,
  });

const getDataWithLimit = async (modelDb, searchQuery, sortedBy, skip, limit) =>
  await Models[modelDb].findAll({
    where: searchQuery,
    order: [sortedBy],
    offset: skip,
    limit: limit,
  });

const getDataSelectWithLimit = async (
  modelDb,
  searchQuery,
  selectQuery,
  sortedBy,
  skip,
  limit
) =>
  await Models[modelDb].findAll({
    where: searchQuery,
    attributes: selectQuery,
    order: [sortedBy],
    offset: skip,
    limit: limit,
  });

const deleteDocuments = async (modelDb, deleteQuery) =>
  await Models[modelDb].destroy({ where: deleteQuery });

const countDocuments = async (modelDb, queryObj) =>
  await Models[modelDb].count({ where: queryObj });

module.exports = {
  find,
  findOne,
  findOneAndSelect,
  insertNewDocument,
  updateDocument,
  deleteDocument,
  customUpdate,
  getDataWithLimit,
  getDataSelectWithLimit,
  findPopulateSortAndLimit,
  deleteDocuments,
  countDocuments,
};
