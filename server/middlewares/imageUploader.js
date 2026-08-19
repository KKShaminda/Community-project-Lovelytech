import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadRoot = path.resolve(__dirname, '../uploads');

if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.body.folder || 'products';
    const folderPath = path.join(uploadRoot, folder);
    fs.mkdirSync(folderPath, { recursive: true });
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

export const upload = multer({ storage });

export const createImageRecord = (file, folder = 'products', req = null) => {
  const relativePath = `/uploads/${folder}/${file.filename}`;
  const baseUrl = req ? `${req.protocol}://${req.get('host')}` : 'http://localhost:5000';

  return {
    url: `${baseUrl}${relativePath}`,
    filename: file.filename,
    path: relativePath,
  };
};

export const uploadImage = (file, req = null, folder = 'products') => {
  return createImageRecord(file, folder, req);
};

export const deleteImageFile = (imagePath) => {
  if (!imagePath) return;

  const relativePath = imagePath.replace(/^\/uploads\//, '');
  const absolutePath = path.join(uploadRoot, relativePath);

  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
};