import { Router } from "express";
import { createUpload } from "../middlewares/multerStore.middleware.js";
import { getAllVehicles, registerVehicle } from "../controllers/lorry.controller.js";
import { authenticateToken } from "../controllers/auth.controller.js";
import multer from "multer";

const folderName = "vehicle_Doc"; // Pass the folder name dynamically
export const upload = createUpload(folderName);

const router = Router();
const uploadFile = multer({ storage: multer.memoryStorage() });

// POST request to register a vehicle
router.route('/register-vehicle').post(authenticateToken, uploadFile.fields([
    { name: 'insurance_photo', maxCount: 1 },
    { name: 'owner_photo', maxCount: 1 },
    { name: 'permit_photo', maxCount: 1 }
]), registerVehicle);

// POST request to register a vehicle
router.route('/get-all-vehicle').get(authenticateToken, getAllVehicles);


export default router;