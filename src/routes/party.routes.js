import { Router } from "express";
import { createUpload } from "../middlewares/multerStore.middleware.js";
import { authenticateToken } from "../controllers/auth.controller.js";
import { createParty, getParties } from "../controllers/party.controller.js"; // Adjust path as needed
import multer from "multer";

const folderName = "party"; // Specify the folder name for image uploads
export const upload = createUpload(folderName);
// Configure Multer to handle in-memory storage
const uploadFile = multer({ storage: multer.memoryStorage() });

const router = Router();

// POST request to create a party
router.route('/create-party').post(authenticateToken, uploadFile.single('logo'), createParty);
router.route('/get-your-parties').get(authenticateToken, getParties);



export default router;
