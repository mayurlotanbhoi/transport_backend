import { Router } from "express";
import { createUpload } from "../middlewares/multerStore.middleware.js";
import { registerUser } from "../controllers/user.controller.js";
import { refreshAccessToken } from "../controllers/auth.controller.js";


const folderName = "logos"; // Pass the folder name dynamically
export const upload = createUpload(folderName);
const router = Router()

router.route("/register").post(
    upload.single('logo'),
    registerUser
)

router.route("/refresh-token").post(refreshAccessToken)








export default router