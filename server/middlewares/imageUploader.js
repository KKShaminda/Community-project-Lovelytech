import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadRoot = path.resolve(__dirname, '../uploads');

// Ensure root and products upload directory exist
const productsDir = path.join(uploadRoot, 'products');
if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Default to 'products' or 'slips' folder safely based on file fieldname
    let folder = (req.body && typeof req.body.folder === 'string' && req.body.folder.replace(/[^a-zA-Z0-9_-]/g, ''));
    if (!folder) {
      folder = file.fieldname === "slip" ? "slips" : "products";
    }
    const folderPath = path.join(uploadRoot, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .substring(0, 50);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif|avif|svg\+xml/;
  const isMimeAllowed = allowedTypes.test(file.mimetype);
  const isExtAllowed = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (isMimeAllowed || isExtAllowed) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WEBP, GIF, AVIF, SVG) are allowed!'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per image
    files: 5, // max 5 images
  },
});

export const createImageRecord = (file, folder = 'products', req = null) => {
  const relativePath = `/uploads/${folder}/${file.filename}`;
  const baseUrl = req ? `${req.protocol}://${req.get('host')}` : (process.env.BASE_URL || 'http://localhost:5000');

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
  if (!imagePath || typeof imagePath !== 'string') return;

  try {
    let cleanPath = imagePath;

    // If it's a full URL e.g. http://localhost:5000/uploads/products/xyz.jpg
    if (cleanPath.includes('/uploads/')) {
      cleanPath = cleanPath.substring(cleanPath.indexOf('/uploads/'));
    }

    const relativePath = cleanPath.replace(/^\/?uploads\//, '');
    const absolutePath = path.resolve(uploadRoot, relativePath);

    // Prevent path traversal outside uploadRoot
    if (absolutePath.startsWith(uploadRoot) && fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  } catch (err) {
    console.error('Error deleting image file:', err.message);
  }
};