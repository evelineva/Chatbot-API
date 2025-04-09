const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token tidak ditemukan." });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User tidak ditemukan." });
    }

    if (!user.verified) {
      return res.status(403).json({ message: "Akun belum diverifikasi." });
    }

    // User valid dan terverifikasi
    req.user = user;
    next();

  } catch (err) {
    return res.status(401).json({ message: "Token tidak valid.", error: err.message });
  }
};

module.exports = auth;
