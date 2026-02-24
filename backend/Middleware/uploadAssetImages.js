import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/assets";

// ✅ folder না থাকলে create করবে
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueName + ext);
  },
});

const uploadAssetImages = multer({
  storage,
  limits: { files: 50 }, // allow more files
}).any(); // accept any field name

export default uploadAssetImages;
