const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const express = require("express");
const router = express.Router();
const { registerValidator, loginValidator } = require("../middleware/authValidator");
const sendEmail = require("../utils/sendEmail");
const auth = require("../middleware/auth");


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
      const user = await User.findOne({ npk }).select("+password"); // pastikan ambil password
      if (!user) return res.status(401).json({ message: "NPK tidak ditemukan" });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: "Password salah" });

      const token = jwt.sign(
        { id: user._id, role: user.role },
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

router.get("/protected", auth, (req, res) => {
    res.json({ message: "Kamu berhasil mengakses route yang dilindungi!", user: req.user });
  });


module.exports = router;
