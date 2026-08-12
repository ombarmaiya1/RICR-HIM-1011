import express from "express";
import { uploadResume } from "./resume.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import upload from "../../middlewares/upload.middleware.js";

const router = express.Router();

router.post(
  "/upload",
  authMiddleware,
  upload.single("resume"),
  uploadResume
);

export default router;