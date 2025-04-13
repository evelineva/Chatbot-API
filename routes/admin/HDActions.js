const express = require("express");
const router = express.Router();
const HdAction = require("../../models/HDAction");
const adminOnly = require("../../middleware/adminOnly");

const User = require("../../models/User");

// GET all
router.get("/", adminOnly, async (req, res) => {
  try {
    const data = await HdAction.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Gagal ambil data" });
  }
});


router.post("/", adminOnly, async (req, res) => {
  try {
    const { npk } = req.body;

    const user = await User.findOne({ npk });
    if (!user) {
      return res.status(400).json({ error: `NPK ${npk} tidak ditemukan di data user` });
    }

    const newRequest = new HdAction(req.body);
    const saved = await newRequest.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: "Gagal tambah data" });
  }
});


// PUT update
router.put("/:id", adminOnly, async (req, res) => {
  try {
    const updated = await HdAction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Gagal update data" });
  }
});

// DELETE
router.delete("/:id", adminOnly, async (req, res) => {
  try {
    await HdAction.findByIdAndDelete(req.params.id);
    res.json({ message: "Berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: "Gagal hapus data" });
  }
});

module.exports = router;
