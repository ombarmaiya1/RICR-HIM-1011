import Resume from "../resume/resume.model.js";
import Job from "../job/job.model.js";
import Analysis from "./analysis.model.js";
import AppError from "../../utils/AppError.js";
import { analyzeWithAI } from "../../utils/ai.js";

const fallbackAnalysis = (resume, job) => {
  return {
    matchScore: 0,
    matchedSkills: [],
    missingSkills: [],
    suggestions: [],
    summary: "AI analysis is currently unavailable. Please try again later.",
  }
}

const analyzeResume = async (req, res, next) => {
  try {
    const { resumeId, jobId } = req.body

    if (!resumeId || !jobId) {
      throw new AppError('Resume ID and Job ID are required', 400)
    }

    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user.userId,
    })

    if (!resume) {
      throw new AppError('Resume not found', 404)
    }

    const job = await Job.findOne({
      _id: jobId,
      userId: req.user.userId,
    })

    if (!job) {
      throw new AppError('Job description not found', 404)
    }

    const resumeText =
      resume.extractedText?.trim() ||
      (resume.parsedData ? JSON.stringify(resume.parsedData) : '') ||
      resume.fileName ||
      'Candidate Resume Document'

    const jobText =
      job.description?.trim() ||
      job.title ||
      'Target Job Requirement Position'

    let result
    try {
      result = await analyzeWithAI(resumeText, jobText)
    } catch (aiErr) {
      console.warn('AI analysis call failed, using fallback:', aiErr.message)
      result = fallbackAnalysis(resume, job)
    }

    if (!result) {
      result = fallbackAnalysis(resume, job)
    }

    const analysis = await Analysis.create({
      userId: req.user.userId,
      resumeId,
      jobId,
      matchScore: result.matchScore,
      matchedSkills: result.matchedSkills || [],
      missingSkills: result.missingSkills || [],
      suggestions: result.suggestions || [],
      summary: result.summary || 'Analysis complete.',
    })

    const populatedAnalysis = await Analysis.findById(analysis._id)
      .populate('resumeId', 'fileName')
      .populate('jobId', 'title')

    res.status(201).json({
      success: true,
      analysis: populatedAnalysis || analysis,
    })
  } catch (error) {
    next(error)
  }
}

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