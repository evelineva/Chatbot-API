const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Protected user actions
 */

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get user profile (protected)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 npk:
 *                   type: string
 *                 email:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", verifyToken, (req, res) => {
  // Simulasi data user
  res.json({
    npk: "I25003-00",
    email: "angel@example.com",
  });
});

module.exports = router;
