import Job from "./job.model.js";
import AppError from "../../utils/AppError.js";

/**
 * Create a new job description
 * POST /api/jobs
 */
const createJob = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title || !description || !title.trim() || !description.trim()) {
      throw new AppError("Title and description are required", 400);
    }

    const job = await Job.create({
      userId: req.user.userId,
      title: title.trim(),
      description: description.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Job description saved",
      job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all saved jobs for authenticated user
 * GET /api/jobs
 */
const getJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single job by ID
 * GET /api/jobs/:jobId
 */
const getJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({
      _id: req.params.jobId,
      userId: req.user.userId,
    });

    if (!job) {
      throw new AppError("Job not found", 404);
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update job title and/or description
 * PUT /api/jobs/:jobId
 */
const updateJob = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title && !description) {
      throw new AppError("At least title or description is required to update", 400);
    }

    const job = await Job.findOne({
      _id: req.params.jobId,
      userId: req.user.userId,
    });

    if (!job) {
      throw new AppError("Job not found", 404);
    }

    if (title && title.trim()) {
      job.title = title.trim();
    }

    if (description && description.trim()) {
      job.description = description.trim();
    }

    await job.save();

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a job description
 * DELETE /api/jobs/:jobId
 */
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.jobId,
      userId: req.user.userId,
    });

    if (!job) {
      throw new AppError("Job not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
      jobId: req.params.jobId,
    });
  } catch (error) {
    next(error);
  }
};

export { createJob, getJobs, getJob, updateJob, deleteJob };