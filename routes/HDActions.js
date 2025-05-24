const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const HdAction = require("../models/HDAction");
const User = require("../models/User");
const generateCustomId = require("../utils/generateCustomId");

router.get("/", verifyToken, async (req, res) => {
  try {
    const npk = req.user.npk; 
    const data = await HdAction.find({ npk }).sort({ createdAt: -1 }); 
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Gagal ambil data" });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const { npk } = req.body;

    const user = await User.findOne({ npk });
    if (!user) {
      return res.status(400).json({ error: `NPK ${npk} tidak ditemukan di data user` });
    }

    const customId = await generateCustomId(npk);

    const newRequest = new HdAction({
      _id: customId,
      ...req.body,
      userId: req.userId,
    });

    const saved = await newRequest.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: "Gagal tambah data" });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const hdAction = await HdAction.findById(req.params.id);

    if (!hdAction) {
      return res.status(404).json({ error: "Data tidak ditemukan" });
    }

    if (hdAction.userId.toString() !== userId) {
      return res.status(403).json({ error: "Anda tidak memiliki izin untuk mengupdate data ini" });
    }

    const updated = await HdAction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Gagal update data" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const hdAction = await HdAction.findById(req.params.id);

    if (!hdAction) {
      return res.status(404).json({ error: "Data tidak ditemukan" });
    }

    if (hdAction.userId.toString() !== userId) {
      return res.status(403).json({ error: "Anda tidak memiliki izin untuk menghapus data ini" });
    }

    await HdAction.findByIdAndDelete(req.params.id);
    res.json({ message: "Berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: "Gagal hapus data" });
  }
});

module.exports = router;
