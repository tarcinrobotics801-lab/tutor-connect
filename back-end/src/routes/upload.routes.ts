import { Router, RequestHandler } from "express";
import multer from "multer";
import path from "path";

const router = Router();

/* ─ Upload config ─ */
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (_req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

/* ─ Handler: returns void ─ */
const uploadPhoto: RequestHandler = (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: "No file" });
    return;                       // ← just end, do not return res object
  }

  const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(201).json({ url });  // ← no “return” in front of this
};

/* ─ Route ─ */
router.post("/photo", upload.single("photo"), uploadPhoto);

export default router;