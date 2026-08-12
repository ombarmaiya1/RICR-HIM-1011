import express from "express";
import { createJob, getJobs } from "./job.controller.js";
import { IsAuthenticated } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", IsAuthenticated, createJob);
router.get("/", IsAuthenticated, getJobs);

export default router;