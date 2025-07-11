import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
import { Request } from 'express';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req: Request, file) => {
    // Determine folder based on route
    let folder = 'uploads'; // default fallback

    if (req.originalUrl.includes('tutor-photo')) {
      folder = 'tutor-photos';
    } else if (req.originalUrl.includes('student-photo')) {
      folder = 'student-photos';
    }

    return {
      folder,
      format: 'png', // or infer from file: file.mimetype.split('/')[1]
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
    };
  },
});

export { cloudinary };
