import { Router } from "express";
import { createUpload } from "../middlewares/multerStore.middleware.js";
import { registerUser } from "../controllers/user.controller.js";
import { refreshAccessToken } from "../controllers/auth.controller.js";


const folderName = "logos"; // Pass the folder name dynamically
export const upload = createUpload(folderName);
const router = Router()

router.route("/register").post(
    // upload.single('logo'),
    upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'avatar', maxCount: 1 }]),

    registerUser
)

// { name: 'permit_photo', maxCount: 1 }],








export default router