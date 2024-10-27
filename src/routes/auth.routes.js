import { Router } from "express";
import { createUpload } from "../middlewares/multerStore.middleware.js";
import { registerUser } from "../controllers/user.controller.js";
import { loginUser, logout, refreshAccessToken } from "../controllers/auth.controller.js";


const folderName = "logos"; // Pass the folder name dynamically
export const upload = createUpload(folderName);
const router = Router()

router.route("/login").post(loginUser)
router.route("/logout").post(logout)
router.route("/refresh-token").post(refreshAccessToken)


// router.route("/register").post(
//     upload.single('logo'),
//     registerUser
// )

export default router;