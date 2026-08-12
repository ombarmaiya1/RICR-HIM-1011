import express from "express";
import { startInterview } from "./interview.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/start", authMiddleware, startInterview);

export default router;