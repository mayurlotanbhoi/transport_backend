import multer from "multer";

// Function to create multer storage with dynamic destination folder
const createStorage = (folderName) => {
    return multer.diskStorage({
        destination: function (req, file, cb) {
            const destinationFolder = `./public/${folderName}`; // Dynamic destination folder
            cb(null, destinationFolder);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const filename = (uniqueSuffix + file.originalname)?.replace(" ", "")
            cb(null, filename)
        }
    });
};

// Function to create multer upload with dynamic storage
export const createUpload = (folderName) => {
    const storage = createStorage(folderName);
    return multer({ storage: storage });
};