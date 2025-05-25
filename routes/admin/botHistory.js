const express = require("express");
const axios = require("axios");
const ChatSession = require("../../models/ChatSession");
const adminOnly = require("../../middleware/adminOnly");

const router = express.Router();

/**
 * @route GET /api/chat/users/:sender_id/sessions
 * @desc Ambil semua sesi milik user tertentu
 */
router.get("/users/:sender_id/sessions", adminOnly, async (req, res) => {
  const { sender_id } = req.params;

  try {
    const sessions = await ChatSession.find({ sender_id });
    res.json({ sessions });
  } catch (err) {
    console.error("Gagal memuat sesi:", err);
    res.status(500).json({ message: "Gagal memuat sesi" });
  }
});

/**
 * @route GET /api/chat/users/:sender_id/sessions/:chat_id/messages
 * @desc Ambil semua pesan dari sesi milik user tertentu
 */
router.get("/users/:sender_id/sessions/:chat_id/messages", adminOnly, async (req, res) => {
  const { sender_id, chat_id } = req.params;

  try {
    const session = await ChatSession.findOne({ chat_id, sender_id });

    if (!session) {
      return res.status(404).json({ message: "Sesi tidak ditemukan" });
    }

    res.json({ messages: session.messages });
  } catch (err) {
    console.error("Gagal memuat messages:", err);
    res.status(500).json({ message: "Gagal memuat messages" });
  }
});

module.exports = router;
