const express = require("express");
const axios = require("axios");
const ChatSession = require("../models/ChatSession");
const authMiddleware = require("../middleware/auth"); 


const router = express.Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Kirim pesan ke chatbot
 *     description: Mengirim pesan dari user ke chatbot dan mendapatkan balasan.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               sender_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Balasan chatbot berhasil diterima
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 replies:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Gagal memanggil FastAPI
 */
router.post('/', async (req, res) => {
    try {
      const { message, sender_id } = req.body;
      console.log('Data yang dikirim:', message, sender_id);
  
      const response = await axios.post('http://localhost:8000/chat', {
        message,
        sender_id,
      });
  
      res.json(response.data);
    } catch (err) {
      console.error('Error memanggil FastAPI:', err.message);
      res.status(500).json({ error: 'Gagal memanggil FastAPI' });
    }
  });

// Membuat sesi chat baru
router.post("/session", async (req, res) => {
    const { sender_id } = req.body;
    const chat_id = `${sender_id}-${Date.now()}`;
    const name = "New Session"; 
  
    try {
      await ChatSession.create({ sender_id, chat_id, name });
      res.json({ chat_id, name });
    } catch (err) {
      res.status(500).json({ message: "Gagal buat sesi" });
    }
  });
  
  
  // Menyimpan pesan ke dalam sesi
  router.post("/session/:chat_id/message", async (req, res) => {
    const { chat_id } = req.params;
    const { text, isUser } = req.body;
    const sender_id = req.user.npk;
  
    try {
      const session = await ChatSession.findOne({ chat_id, sender_id });
  
      if (!session) return res.status(404).json({ message: "Sesi tidak ditemukan" });
  
      session.messages.push({ text, isUser });
      await session.save();
  
      res.json({ message: "Tersimpan" });
    } catch (err) {
      console.error("Error saving message:", err);
      res.status(500).json({ message: "Gagal simpan message" });
    }
  });
  

  // Mengambil semua pesan dari sesi berdasarkan chat_id
  router.get("/session/:chat_id/messages", async (req, res) => {
    const { chat_id } = req.params;
    const sender_id = req.user.npk;
  
    try {
      const session = await ChatSession.findOne({ chat_id, sender_id });
  
      if (!session) return res.status(404).json({ message: "Sesi tidak ditemukan" });
  
      res.json({ messages: session.messages });
    } catch (err) {
      res.status(500).json({ message: "Gagal memuat messages" });
    }
  });
  
  
  // Mendapatkan sesi chat
  router.get("/sessions", async (req, res) => {
    const sender_id = req.user.npk;
  
    try {
      const sessions = await ChatSession.find({ sender_id });
      res.json({ sessions });
    } catch (err) {
      res.status(500).json({ message: "Gagal memuat sesi" });
    }
  });
  

  // Mengubah nama sesi
  router.patch("/session/:chat_id", async (req, res) => {
    const { chat_id } = req.params;
    const { name } = req.body;
    const sender_id = req.user.npk;
  
    try {
      const session = await ChatSession.findOneAndUpdate(
        { chat_id, sender_id },
        { name },
        { new: true }
      );
  
      if (!session) return res.status(404).json({ message: "Sesi tidak ditemukan" });
  
      res.json({ message: "Nama sesi berhasil diubah", session });
    } catch (err) {
      res.status(500).json({ message: "Gagal mengubah nama sesi" });
    }
  });
  
module.exports = router;
