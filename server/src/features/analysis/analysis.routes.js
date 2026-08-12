import express from "express";
import { analyzeResume } from "./analysis.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, analyzeResume);
router.get("/", IsAuthenticated, getAnalyses);

router.get("/:analysisId", IsAuthenticated, getAnalysis);

export default router;