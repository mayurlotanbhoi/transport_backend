import { Router } from "express";
import { createUpload } from "../middlewares/multerStore.middleware.js";
import { authenticateToken } from "../controllers/auth.controller.js";
import { createParty, getParties } from "../controllers/party.controller.js"; // Adjust path as needed

const folderName = "party"; // Specify the folder name for image uploads
export const upload = createUpload(folderName);

const router = Router();

// POST request to create a party
router.route('/create-party').post(authenticateToken, upload.single('logo'), createParty);
router.route('/get-your-parties').get(authenticateToken, getParties);



export default router;
