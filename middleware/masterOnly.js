const jwt = require("jsonwebtoken");
const User = require("../models/User");

const masterOnly = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Token tidak ditemukan." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan." });
    if (user.role !== "master") return res.status(403).json({ message: "Akses hanya untuk master." });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token tidak valid." });
  }
};

module.exports = masterOnly;
