import express from "express";
import joinWaitlistRoute from "./join.route";

const router = express.Router();

router.use(joinWaitlistRoute);

export default router;
