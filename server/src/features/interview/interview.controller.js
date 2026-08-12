import Resume from "../resume/resume.model.js";
import Job from "../job/job.model.js";
import Interview from "./interview.model.js";
import AppError from "../../utils/AppError.js";
import { generateInterviewQuestions } from "../../utils/ai.js";

const startInterview = async (req, res, next) => {
  try {
    const { resumeId, jobId } = req.body;

    if (!resumeId || !jobId) {
      throw new AppError("Resume ID and Job ID are required", 400);
    }

    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user.userId,
    });

    if (!resume) {
      throw new AppError("Resume not found", 404);
    }

    const job = await Job.findOne({
      _id: jobId,
      userId: req.user.userId,
    });

    if (!job) {
      throw new AppError("Job not found", 404);
    }

    const result = await generateInterviewQuestions(
      resume.extractedText,
      job.description
    );

    const interview = await Interview.create({
      userId: req.user.userId,
      resumeId,
      jobId,
      questions: result.questions.map((item) => ({
        question: item.question,
        type: item.type,
      })),
    });

    res.status(201).json({
      success: true,
      interview,
    });
  } catch (error) {
    next(error);
  }
};

export { startInterview };