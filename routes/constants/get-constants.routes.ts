import { Router } from "express";
import getConstantsHandler from "../../handlers/constants/get-constants.handler";

const router = Router();

router.get("/", getConstantsHandler);

export default router;
