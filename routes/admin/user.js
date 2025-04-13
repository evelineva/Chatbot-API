const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const adminOnly = require("../../middleware/adminOnly");
const bcrypt = require("bcryptjs")

// GET all users
router.get("/", adminOnly, async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Gagal mengambil data user." });
    }
});

// Tambah user baru
router.post("/", adminOnly, async (req, res) => {
    const { email, npk, password, role = "user", verified = false } = req.body;

    if (!email || !npk || !password) {
        return res.status(400).json({ message: "Email, NPK, dan Password wajib diisi." });
    }

    const existing = await User.findOne({ $or: [{ email }, { npk }] });
    if (existing) return res.status(400).json({ message: "Email atau NPK sudah digunakan." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        email,
        npk,
        password: hashedPassword,
        role,
        verified,
    });

    await user.save();

    res.json({ message: "User berhasil dibuat.", user });
});

// PUT update user by ID
router.put("/:id", adminOnly, async (req, res) => {
    const { email, npk, password, verified } = req.body;

    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User tidak ditemukan" });


        if (email) user.email = email;
        if (npk) user.npk = npk;
        if (typeof verified === "boolean") user.verified = verified;

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }
        // Sebelum update email/npk
        if (email && email !== user.email) {
            const existingEmail = await User.findOne({ email });
            if (existingEmail) return res.status(400).json({ message: "Email sudah digunakan" });
        }
        if (npk && npk !== user.npk) {
            const existingnpk = await User.findOne({ npk });
            if (existingnpk) return res.status(400).json({ message: "Npk sudah digunakan" });
        }

        await user.save();
        res.json({ message: "User berhasil diperbarui", user });
    } catch (err) {
        res.status(500).json({ message: "Gagal memperbarui user", error: err.message });
    }
});

// DELETE: - Hapus user
router.delete("/:id", adminOnly, async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User berhasil dihapus." });
});

module.exports = router;
