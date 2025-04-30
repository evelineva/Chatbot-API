const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const User = require("../models/User");
const { changePasswordValidator } = require("../middleware/authValidator");
const { validationResult } = require("express-validator");

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
 *       500:
 *         description: Internal server error
 */
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      npk: user.npk,
      email: user.email,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { email, password } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email) user.email = email;
    if (password) user.password = password;

    await user.save();
    res.json({ message: "Profile updated" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/change-password", verifyToken, changePasswordValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const userId = req.user.id || req.user.userId;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const bcrypt = require("bcryptjs");
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Password salah" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password berhasil diubah" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "Email tidak ditemukan" });

  const resetToken = Math.random().toString(36).substr(2, 8);

  console.log("Simulasi token:", resetToken);

  res.json({ message: "Token reset dikirim ke email (simulasi)", resetToken });
});



module.exports = router;
