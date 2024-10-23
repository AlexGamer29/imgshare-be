const express = require('express');

const router = express.Router();

const {
  getUserInfo,
  getAllUsers,
  updateUser,
} = require('../../controllers/index.controller');
const {
  authenticatePasetoToken,
} = require('../../middlewares/index.middleware');

/**
 * @swagger
 * /user/info:
 *   get:
 *     summary: Get user information
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Language option
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         username:
 *                           type: string
 *                         email:
 *                           type: string
 *                         createAt:
 *                           type: string
 *                         updateAt:
 *                           type: string
 *                         exp:
 *                           type: string
 *                 error:
 *                   type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 */
router.get('/info', authenticatePasetoToken, getUserInfo);
/**
 * @swagger
 * /user/list:
 *   get:
 *     summary: Get all users
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Language option
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           username:
 *                             type: string
 *                           email:
 *                             type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 */
router.get('/list', getAllUsers);

router.post('/update', authenticatePasetoToken, updateUser);
module.exports = router;
