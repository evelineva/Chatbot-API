const upload = require("../middleware/upload");
const { verifyToken } = require("../middleware/auth");

router.post("/upload-profile", verifyToken, upload.single("photo"), async (req, res) => {
  try {
    const photoPath = req.file.path;
    await User.findByIdAndUpdate(req.user.id, { photo: photoPath });
    res.json({ message: "Foto profil berhasil diupload", path: photoPath });
  } catch (err) {
    res.status(500).json({ message: "Upload gagal", error: err.message });
  }
});
