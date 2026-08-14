import express from "express";
import {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
} from "./job.controller.js";
import { IsAuthenticated } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// GET /api/jobs -> Get all saved jobs
router.get("/", IsAuthenticated, getJobs);

// POST /api/jobs -> Create new job
router.post("/", IsAuthenticated, createJob);

// GET /api/jobs/:jobId -> Get single job by ID
router.get("/:jobId", IsAuthenticated, getJob);

// PUT /api/jobs/:jobId -> Update job title and/or description
router.put("/:jobId", IsAuthenticated, updateJob);

// DELETE /api/jobs/:jobId -> Delete job
router.delete("/:jobId", IsAuthenticated, deleteJob);

export default router;