const express = require("express");
const router = express.Router();
const multer = require("multer");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

// Storage in memory (buffer)
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { email, subject, message } = req.body;
    const file = req.file;

    if (!email || !file || !subject || !message) {
      return res.status(400).json({ message: "Email, subject, message, dan file harus disertakan" });
    }

    // Setup transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: `"Admin 👨‍💻" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      text: message,
      attachments: [
        {
          filename: file.originalname,
          content: file.buffer,
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email berhasil dikirim!" });
  } catch (error) {
    console.error("Error kirim email:", error);
    res.status(500).json({ message: "Gagal mengirim email" });
  }
});

module.exports = router;
