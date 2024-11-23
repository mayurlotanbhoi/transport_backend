import { Router } from "express";
import { createUpload } from "../middlewares/multerStore.middleware.js";
import { registerUser, updateAvatar, updateLogo, updateUserInfo } from "../controllers/user.controller.js";
import { authenticateToken, refreshAccessToken } from "../controllers/auth.controller.js";
import multer from "multer";


const folderName = "logos"; // Pass the folder name dynamically
export const upload = createUpload(folderName);
const router = Router()


const uploadFile = multer({ storage: multer.memoryStorage() });

router.route("/register").post(
    // upload.single('logo'),
    uploadFile.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'avatar', maxCount: 1 }]),

    registerUser
)
router.route("/update-logo").patch(authenticateToken,
    // upload.single('logo'),
    uploadFile.single('logo'),
    updateLogo
)

router.route("/update-avatar").patch(authenticateToken,
    // upload.single('logo'),
    uploadFile.single('avatar'),
    updateAvatar
)

router.route("/update-user-info").put(authenticateToken, updateUserInfo)







// { name: 'permit_photo', maxCount: 1 }],








export default router