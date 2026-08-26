import { v2 as cloudinary } from "cloudinary";

class UploadService {
  constructor() {
    this.configureCloudinary();
  }

  async configureCloudinary() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile({ content, path }: { content: any; path: string }) {
    try {
      const result = await cloudinary.uploader.upload(path, {
        folder: "blow money",
      });

      // Send the Cloudinary URL in the response
      return result.secure_url;
    } catch (error) {
      throw error;
    } finally {
    }
  }
}

export default UploadService;
