const jwt = require("jsonwebtoken");
const User = require("../models/User");

const checkVerified = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.verified) {
      return res.status(403).json({ message: "Akun belum diverifikasi" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token tidak valid", error: error.message });
  }
};

module.exports = checkVerified;
