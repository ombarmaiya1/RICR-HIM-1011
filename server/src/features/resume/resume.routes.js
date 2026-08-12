import express from "express";
import { uploadResume,getResume,getResumes } from "./resume.controller.js";
import { IsAuthenticated } from "../../middlewares/auth.middleware.js";
import upload from "../../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/upload", IsAuthenticated, upload.single("resume"), uploadResume);

router.get("/", IsAuthenticated, getResumes);

router.get("/:resumeId", IsAuthenticated, getResume);

export default router;
