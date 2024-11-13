import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

// cloudinaryUpload.js
import { createReadStream } from 'streamifier';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}


// for dirct file uplod on cloud
/**
 * Uploads a file buffer directly to Cloudinary.
 * @param {Buffer} fileBuffer - The file buffer from the client.
 * @param {Object} options - Additional options for Cloudinary (optional).
 * @returns {Promise<string>} - Resolves with the URL of the uploaded file.
 */
export const uploadToCloudinary = (fileBuffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", ...options },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url); // Return the URL
            }
        );

        createReadStream(fileBuffer).pipe(uploadStream);
    });
};





export { uploadOnCloudinary }