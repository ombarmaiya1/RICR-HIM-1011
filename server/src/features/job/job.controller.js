import Job from "./job.model.js";
import AppError from "../../utils/AppError.js";

const createJob = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      throw new AppError("Title and description are required", 400);
    }

    if (!title?.trim() || !description?.trim()) {
  throw new AppError(
    "Title and description are required",
    400
  );
}

    const job = await Job.create({
      userId: req.user.userId,
      title,
      description,
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

export { createJob, getJobs };