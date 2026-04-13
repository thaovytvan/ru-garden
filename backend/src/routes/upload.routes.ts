import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

export const uploadRouter = Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Cloudinary storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "rugarden_products",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  } as any,
});

// File filter (optional, but good for security)
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload an image."), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload endpoint
uploadRouter.post("/", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Không tìm thấy file tải lên." });
    }

    // Cloudinary returns the full URL in req.file.path
    const fileUrl = (req.file as any).path || (req.file as any).url;
    
    res.status(200).json({
      success: true,
      data: {
        url: fileUrl,
      },
    });
  } catch (error: any) {
    console.error("Cloudinary Upload Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi khi tải ảnh lên Cloudinary",
      error: error.message 
    });
  }
});
