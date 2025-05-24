const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const express = require("express");
const router = express.Router();
const { registerValidator, loginValidator, resetPasswordValidator } = require("../middleware/authValidator");
const sendEmail = require("../utils/sendEmail");
const auth = require("../middleware/auth");
const crypto = require("crypto");


/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               npk:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully
 */
router.post("/register", registerValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { npk, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { npk }] });
    if (existingUser) return res.status(400).json({ message: "Email atau NPK sudah terdaftar" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const token = jwt.sign({ npk }, process.env.JWT_SECRET, { expiresIn: "1d" });
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    // Kirim email dulu
    await sendEmail(
      email,
      "Verifikasi Email Kamu",
      `<p>Halo ${npk},</p><p>Klik link berikut untuk verifikasi akun kamu:</p>
        <a href="${verifyUrl}">${verifyUrl}</a>`
    );

    // Baru simpan user setelah email berhasil dikirim
    const user = new User({ npk, email, password: hashedPassword, verified: false });
    await user.save();

    res.status(201).json({ message: "Pendaftaran berhasil! Silakan cek email kamu untuk verifikasi." });
  } catch (err) {
    console.error("Error saat register:", err);
    res.status(500).json({ message: "Gagal register", error: err.message });
  }
});




/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               npk:
 *                 type: string
 *                 example: I25003-00
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", loginValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { npk, password } = req.body;

  try {
    const user = await User.findOne({ npk }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "NPK atau Password salah" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "NPK atau Password salah" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, npk: user.npk },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password: _, ...userWithoutPassword } = user.toObject();

    return res.json({
      token,
      verified: user.verified,
      user: userWithoutPassword,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Gagal login", error: err.message });
  }
});

router.post("/verify-email", async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ npk: decoded.npk });

    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });
    if (user.verified) return res.status(400).json({ message: "Email sudah diverifikasi" });

    user.verified = true;
    await user.save();

    res.json({ message: "Email berhasil diverifikasi" });
  } catch (err) {
    res.status(400).json({ message: "Token tidak valid atau kadaluarsa" });
  }
});

router.post("/resend-verification", async (req, res) => {
  const { email, npk } = req.body;

  if (!email || !npk) return res.status(400).json({ message: "Email dan NPK diperlukan." });

  try {
    const user = await User.findOne({ email, npk });
    if (!user) return res.status(404).json({ message: "User tidak ditemukan." });

    if (user.verified) return res.status(400).json({ message: "Akun sudah diverifikasi." });

    const token = jwt.sign({ npk: user.npk }, process.env.JWT_SECRET, { expiresIn: "1d" });
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    await sendEmail(
      email,
      "Verifikasi Email Kamu",
      `<p>Halo ${npk},</p><p>Klik link berikut untuk verifikasi akun kamu:</p>
         <a href="${verifyUrl}">${verifyUrl}</a>`
    );

    res.json({ message: "Email verifikasi berhasil dikirim ulang." });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengirim ulang email.", error: err.message });
  }
});

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Kirim email reset password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email reset dikirim jika email ditemukan
 */
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email diperlukan." });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: "Jika email terdaftar, link reset telah dikirim." }); // prevent enumeration

    const token = crypto.randomBytes(32).toString("hex");
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendEmail(
      email,
      "Reset Password Kamu",
      `<p>Hai ${user.npk},</p>
           <p>Klik link berikut untuk mengubah password kamu (berlaku 15 menit):</p>
           <a href="${resetUrl}">${resetUrl}</a>`
    );

    res.json({ message: "Jika email terdaftar, link reset telah dikirim." });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengirim email reset", error: err.message });
  }
});


/**
* @swagger
* /api/auth/reset-password:
*   post:
*     summary: Reset password dengan token
*     tags: [Auth]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               token:
*                 type: string
*               newPassword:
*                 type: string
*     responses:
*       200:
*         description: Password berhasil diubah
*/
router.post("/reset-password", resetPasswordValidator, async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ message: "Token dan password baru diperlukan." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan." });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password berhasil diubah." });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token sudah kedaluwarsa. Silakan minta ulang reset password." });
    }

    console.error("Error mengubah password: ", err);
    res.status(500).json({ message: "Gagal mengubah password", error: err.message });
  }

});

router.post("/validate-reset-token", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ valid: false, message: "Token diperlukan." });

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true });
  } catch (err) {
    res.status(401).json({ valid: false, message: "Token tidak valid atau sudah kedaluwarsa." });
  }
});


router.get("/protected", auth, (req, res) => {
  res.json({ message: "Kamu berhasil mengakses route yang dilindungi!", user: req.user });
});


module.exports = router;
