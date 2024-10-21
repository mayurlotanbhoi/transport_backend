import { Router } from "express";
import { getCitiByName } from "../controllers/city.controllers.js";




const router = Router()

router.route("/search").get(
    getCitiByName
)





export default router