import express from "express";
import { analyzeResume, getAnalyses, getAnalysis } from "./analysis.controller.js";
import { IsAuthenticated } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", IsAuthenticated, analyzeResume);
router.get("/", IsAuthenticated, getAnalyses);

router.get("/:analysisId", IsAuthenticated, getAnalysis);

export default router;