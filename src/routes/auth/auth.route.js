const express = require('express');

const router = express.Router();

const {
  signUpWithPassword,
  logInWithPassword,
  getAccessToken,
  deleteRefreshToken,
} = require('../../controllers/index.controller');

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: User signup
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     parameters:
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Language option
 *     responses:
 *       200:
 *         description: Signup successful
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 */
router.post('/signup', signUpWithPassword);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email_username:
 *                 type: string
 *               password:
 *                 type: string
 *     parameters:
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Language option
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized ("Invalid email or password")
 *       403:
 *         description: Forbidden Error ("User not found")
 *       500:
 *         description: Internal Server Error
 */
router.post('/login', logInWithPassword);
/**
 * @swagger
 * /auth/token:
 *   post:
 *     summary: Regenerate access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     parameters:
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Language option
 *     responses:
 *       200:
 *         description: Token regenerated successfully
 *       403:
 *         description: Invalid token
 *       500:
 *         description: Internal Server Error
 */
router.post('/token', getAccessToken);
/**
 * @swagger
 * /auth/token:
 *   delete:
 *     summary: User logout
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     parameters:
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Language option
 *     responses:
 *       200:
 *         description: Logout successful
 *       404:
 *         description: Token not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/token', deleteRefreshToken);

module.exports = router;
