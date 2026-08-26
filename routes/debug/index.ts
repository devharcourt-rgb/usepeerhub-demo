import { Router } from "express";
import debuggerRoute from "./debugger";

const router = Router();

router.use(debuggerRoute);

export default router;
