import Resume from "../resume/resume.model.js";
import Job from "../job/job.model.js";
import Analysis from "./analysis.model.js";
import AppError from "../../utils/AppError.js";
import { analyzeWithAI } from "../../utils/ai.js";

const analyzeResume = async (req, res, next) => {
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
      throw new AppError("Job description not found", 404);
    }

    const result = await analyzeWithAI(
      resume.extractedText,
      job.description
    );

    const analysis = await Analysis.create({
      userId: req.user.userId,
      resumeId,
      jobId,
      matchScore: result.matchScore,
      matchedSkills: result.matchedSkills,
      missingSkills: result.missingSkills,
      suggestions: result.suggestions,
      summary: result.summary,
    });

    res.status(201).json({
      success: true,
      analysis,
    });
  } catch (error) {
    next(error);
  }
};

const getAnalyses = async (req, res, next) => {
  try {
    const analyses = await Analysis.find({
      userId: req.user.userId,
    })
      .populate("resumeId", "fileName")
      .populate("jobId", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      analyses,
    });
  } catch (error) {
    next(error);
  }
};

const getAnalysis = async (req, res, next) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.analysisId,
      userId: req.user.userId,
    })
      .populate("resumeId")
      .populate("jobId");

    if (!analysis) {
      throw new AppError("Analysis not found", 404);
    }

    res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    next(error);
  }
};

export { analyzeResume, getAnalyses, getAnalysis };