import express from "express";
import {
  uploadResume,
  getResume,
  getResumes,
  deleteResume,
} from "./resume.controller.js";
import { IsAuthenticated } from "../../middlewares/auth.middleware.js";
import { uploadResume as uploadMiddleware } from "../../middlewares/upload.middleware.js";

const router = express.Router();

// POST /api/resumes/upload -> Upload resume PDF/DOCX (Stored in Cloudinary)
router.post("/upload", IsAuthenticated, uploadMiddleware.single("resume"), uploadResume);

// GET /api/resumes -> Get all resumes
router.get("/", IsAuthenticated, getResumes);

// GET /api/resumes/:resumeId -> Get single resume
router.get("/:resumeId", IsAuthenticated, getResume);

// DELETE /api/resumes/:resumeId -> Delete resume
router.delete("/:resumeId", IsAuthenticated, deleteResume);

export default router;
