import express from "express";
import {
  upload,
  uploadProfilePicture,
  uploadPaymentSlip,
  uploadProductImages,
  uploadRepairImages,
  createImageRecord,
} from "../middlewares/imageUploader.js";
import {
  requiredSignIn,
  isAdminOrReceptionist,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// 1. Profile Picture Upload (User, Receptionist, Admin)
router.post(
  "/profile",
  requiredSignIn,
  uploadProfilePicture,
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No profile image file was provided.",
      });
    }

    const imageRecord = createImageRecord(req.file, "profiles", req);
    res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully.",
      data: imageRecord,
      url: imageRecord.url,
      path: imageRecord.path,
    });
  }
);

// 2. Product Images Upload (Admin & Receptionist)
router.post(
  "/product",
  requiredSignIn,
  isAdminOrReceptionist,
  uploadProductImages,
  (req, res) => {
    const files = req.files || (req.file ? [req.file] : []);

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No product image files were provided.",
      });
    }

    const images = files.map((file) => createImageRecord(file, "products", req));
    res.status(200).json({
      success: true,
      message: `${images.length} product image(s) uploaded successfully.`,
      images,
      data: images,
    });
  }
);

// 3. Payment Slip Upload (User / Checkout)
router.post(
  "/slip",
  uploadPaymentSlip,
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No bank payment slip image file was provided.",
      });
    }

    const imageRecord = createImageRecord(req.file, "slips", req);
    res.status(200).json({
      success: true,
      message: "Payment slip uploaded successfully.",
      data: imageRecord,
      url: imageRecord.url,
      path: imageRecord.path,
    });
  }
);

// 4. Repair Device Images Upload (User / Receptionist / Admin)
router.post(
  "/repair",
  uploadRepairImages,
  (req, res) => {
    const files = req.files || (req.file ? [req.file] : []);

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No repair image files were provided.",
      });
    }

    const images = files.map((file) => createImageRecord(file, "repairs", req));
    res.status(200).json({
      success: true,
      message: "Repair image(s) uploaded successfully.",
      images,
      data: images,
    });
  }
);

// 5. Generic Single Upload (Authenticated)
router.post(
  "/single",
  requiredSignIn,
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided.",
      });
    }

    const folder = req.uploadFolder || "general";
    const imageRecord = createImageRecord(req.file, folder, req);
    res.status(200).json({
      success: true,
      message: "Image uploaded successfully.",
      data: imageRecord,
      url: imageRecord.url,
      path: imageRecord.path,
    });
  }
);

// 6. Generic Multiple Upload (Authenticated)
router.post(
  "/multiple",
  requiredSignIn,
  upload.array("images", 10),
  (req, res) => {
    const files = req.files || [];
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No image files provided.",
      });
    }

    const folder = req.uploadFolder || "general";
    const images = files.map((file) => createImageRecord(file, folder, req));
    res.status(200).json({
      success: true,
      message: `${images.length} images uploaded successfully.`,
      images,
      data: images,
    });
  }
);

export default router;
