import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

// Use memory storage — file is kept as a Buffer, never saved to disk
const storage = multer.memoryStorage();
export const upload = multer({ storage });

/**
 * Uploads a file buffer (from Multer) directly to Cloudinary.
 * @param {Buffer} fileBuffer - The file buffer from req.file.buffer
 * @param {string} folder - The Cloudinary folder to upload into (e.g. "profiles")
 * @returns {Promise<{ url: string, public_id: string }>}
 */
export const uploadImage = (fileBuffer, folder = 'uploads') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        use_filename: true,
        unique_filename: true,
        overwrite: true,
      },
      (error, result) => {
        if (error) return reject(error);
        console.log('Cloudinary upload result:', result);
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );

    // Pipe the buffer into the Cloudinary upload stream
    stream.end(fileBuffer);
  });
};