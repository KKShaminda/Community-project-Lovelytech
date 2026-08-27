import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadRoot = path.resolve(__dirname, '../uploads');

// Subdirectories mapped by feature and user roles:
// - profiles: User, Receptionist, and Admin profile avatars
// - products: Admin and Receptionist catalog & inventory images
// - slips: User order payment bank transfer receipts / slips
// - repairs: Device repair diagnostics & inspection photos
// - general: General attachments
const UPLOAD_FOLDERS = ['profiles', 'products', 'slips', 'repairs', 'general'];

// Ensure all upload directories exist on server startup
if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}
UPLOAD_FOLDERS.forEach((folder) => {
  const folderPath = path.join(uploadRoot, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
});

// Resolve destination folder based on request context, body, or fieldname
const resolveFolder = (req, file) => {
  if (req.uploadFolder && UPLOAD_FOLDERS.includes(req.uploadFolder)) {
    return req.uploadFolder;
  }
  if (req.body && typeof req.body.folder === 'string') {
    const sanitized = req.body.folder.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (UPLOAD_FOLDERS.includes(sanitized)) {
      return sanitized;
    }
  }

  const field = (file.fieldname || '').toLowerCase();
  if (field.includes('profile') || field.includes('avatar')) {
    return 'profiles';
  }
  if (field.includes('slip') || field.includes('receipt')) {
    return 'slips';
  }
  if (field.includes('repair')) {
    return 'repairs';
  }
  if (field.includes('product') || field.includes('image')) {
    return 'products';
  }
  return 'general';
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = resolveFolder(req, file);
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
  const allowedExtensions = /jpeg|jpg|png|webp|gif|avif|svg/;
  const allowedMimeTypes = /image\/(jpeg|jpg|png|webp|gif|avif|svg\+xml)/;

  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const isExtValid = allowedExtensions.test(ext);
  const isMimeValid = allowedMimeTypes.test(file.mimetype);

  if (isExtValid || isMimeValid) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file format. Only image files (JPEG, JPG, PNG, WEBP, GIF, AVIF, SVG) are allowed.'
      ),
      false
    );
  }
};

// Base Multer Instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per image
    files: 10, // max 10 images per batch
  },
});

// Middleware for User / Receptionist / Admin profile picture upload
export const uploadProfilePicture = (req, res, next) => {
  req.uploadFolder = 'profiles';
  const uploader = upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'avatar', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ]);

  uploader(req, res, (err) => {
    if (err) return handleMulterError(err, res, next);
    // Normalize single file to req.file
    if (req.files) {
      req.file =
        req.files.profilePicture?.[0] ||
        req.files.avatar?.[0] ||
        req.files.image?.[0] ||
        req.files.file?.[0];
    }
    next();
  });
};

// Middleware for User order payment slip upload
export const uploadPaymentSlip = (req, res, next) => {
  req.uploadFolder = 'slips';
  const uploader = upload.fields([
    { name: 'slip', maxCount: 1 },
    { name: 'receipt', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ]);

  uploader(req, res, (err) => {
    if (err) return handleMulterError(err, res, next);
    if (req.files) {
      req.file =
        req.files.slip?.[0] ||
        req.files.receipt?.[0] ||
        req.files.image?.[0] ||
        req.files.file?.[0];
    }
    next();
  });
};

// Memory storage for product images to be stored directly in MongoDB
const memoryStorage = multer.memoryStorage();

export const uploadProductMemory = multer({
  storage: memoryStorage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per image
    files: 10, // max 10 images
  },
});

// Middleware for Admin / Receptionist product catalog images upload (stored in MongoDB)
export const uploadProductImages = (req, res, next) => {
  const uploader = uploadProductMemory.fields([
    { name: 'images', maxCount: 10 },
    { name: 'image', maxCount: 10 },
    { name: 'files', maxCount: 10 },
  ]);

  uploader(req, res, (err) => {
    if (err) return handleMulterError(err, res, next);
    if (req.files) {
      const combined = [
        ...(req.files.images || []),
        ...(req.files.image || []),
        ...(req.files.files || []),
      ];
      req.files = combined;
    }
    next();
  });
};

// Helper to convert Multer file into a MongoDB-storable image record with Base64 Data URI
export const createMongoImageRecord = (file) => {
  if (!file) return null;

  let buffer = file.buffer;
  if (!buffer && file.path && fs.existsSync(file.path)) {
    try {
      buffer = fs.readFileSync(file.path);
      fs.unlinkSync(file.path); // Remove temporary file from uploads directory
    } catch {
      // Ignore cleanup error
    }
  }

  const mimetype = file.mimetype || 'image/jpeg';
  const base64 = buffer ? buffer.toString('base64') : '';
  const dataUri = base64 ? `data:${mimetype};base64,${base64}` : (file.url || file.path || '');
  const filename = file.originalname || file.filename || 'product-image.jpg';

  return {
    url: dataUri,
    filename: filename,
    path: dataUri,
    contentType: mimetype,
    size: file.size || (buffer ? buffer.length : 0),
  };
};

// Middleware for Repair inspection images upload
export const uploadRepairImages = (req, res, next) => {
  req.uploadFolder = 'repairs';
  const uploader = upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'image', maxCount: 5 },
    { name: 'file', maxCount: 5 },
  ]);

  uploader(req, res, (err) => {
    if (err) return handleMulterError(err, res, next);
    if (req.files) {
      req.files = [
        ...(req.files.images || []),
        ...(req.files.image || []),
        ...(req.files.file || []),
      ];
      req.file = req.files[0];
    }
    next();
  });
};

// Generic single image uploader
export const uploadSingleImage = (fieldName = 'image', folder = 'general') => {
  return (req, res, next) => {
    req.uploadFolder = folder;
    upload.single(fieldName)(req, res, (err) => {
      if (err) return handleMulterError(err, res, next);
      next();
    });
  };
};

// Generic multiple images uploader
export const uploadMultipleImages = (fieldName = 'images', maxCount = 10, folder = 'general') => {
  return (req, res, next) => {
    req.uploadFolder = folder;
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) return handleMulterError(err, res, next);
      next();
    });
  };
};

// Centralized Multer Error Handler
export const handleMulterError = (err, res, next) => {
  if (!err) return next();

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File is too large. Maximum allowed size is 10MB.',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded in a single request.',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: `Unexpected upload field: ${err.field || 'unknown'}.`,
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
    });
  }

  return res.status(400).json({
    success: false,
    message: err.message || 'File upload failed.',
  });
};

// Helper to construct normalized image record object
export const createImageRecord = (file, folder = 'products', req = null) => {
  const actualFolder = folder || 'products';
  const relativePath = `/uploads/${actualFolder}/${file.filename}`;
  const baseUrl = req
    ? `${req.protocol}://${req.get('host')}`
    : (process.env.BASE_URL || 'http://localhost:5000');

  return {
    url: `${baseUrl}${relativePath}`,
    filename: file.filename,
    path: relativePath,
    mimetype: file.mimetype,
    size: file.size,
  };
};

export const uploadImage = (file, req = null, folder = 'products') => {
  return createImageRecord(file, folder, req);
};

// Safely delete image file from server filesystem
export const deleteImageFile = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') return;

  try {
    let cleanPath = imagePath.trim();

    if (cleanPath.includes('/uploads/')) {
      cleanPath = cleanPath.substring(cleanPath.indexOf('/uploads/'));
    }

    const relativePath = cleanPath.replace(/^\/?uploads[\\/]/i, '');
    const absolutePath = path.resolve(uploadRoot, relativePath);

    // Prevent path traversal outside uploadRoot
    if (absolutePath.startsWith(uploadRoot) && fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  } catch (err) {
    console.error('Error deleting image file:', err.message);
  }
};