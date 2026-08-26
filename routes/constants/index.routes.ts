import { Router } from "express";
import getConstantsRoute from "./get-constants.routes";

const router = Router();

router.use(getConstantsRoute);

export default router;
