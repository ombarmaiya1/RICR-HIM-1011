import Resume from "../resume/resume.model.js";
import Job from "../job/job.model.js";
import Analysis from "./analysis.model.js";
import AppError from "../../utils/AppError.js";
import { analyzeWithAI } from "../../utils/ai.js";

const fallbackAnalysis = (resume, job) => {
  const resumeStr = (resume.extractedText || JSON.stringify(resume.parsedData || {}) || '').toLowerCase()
  const jobStr = (job.description || job.title || '').toLowerCase()

  const extractedSkills = resume.parsedData?.skills || []
  const commonTech = [
    'react', 'node.js', 'javascript', 'typescript', 'python', 'java', 'aws', 'docker',
    'kubernetes', 'sql', 'mongodb', 'git', 'ci/cd', 'rest api', 'graphql', 'html', 'css',
    'express', 'microservices'
  ]

  const matched = []
  const missing = []

  const allSkillsToCheck = Array.from(
    new Set([...extractedSkills.map((s) => s.toLowerCase()), ...commonTech])
  )

  allSkillsToCheck.forEach((skill) => {
    if (resumeStr.includes(skill) && (jobStr.includes(skill) || jobStr.length < 50)) {
      matched.push(skill.toUpperCase())
    } else if (jobStr.includes(skill)) {
      missing.push(skill.toUpperCase())
    }
  })

  if (matched.length === 0) {
    matched.push('SOFTWARE DEVELOPMENT', 'PROBLEM SOLVING')
  }
  if (missing.length === 0) {
    missing.push('SYSTEM ARCHITECTURE')
  }

  const score = matched.length > 0 ? Math.min(35, Math.max(5, Math.floor(15 + matched.length * 2 - missing.length * 5))) : 0

  return {
    matchScore: score,
    matchedSkills: matched.slice(0, 8),
    missingSkills: missing.slice(0, 6),
    suggestions: [
      `Highlight experience with ${missing[0] || 'key skills'} in your executive summary.`,
      `Add quantitative metrics related to ${matched[0] || 'core technologies'}.`,
      `Tailor job responsibility bullet points to reflect ${job.title ? `the ${job.title}` : 'target role'} requirements.`,
    ],
    summary: `Candidate demonstrates ${score > 0 ? `${score}%` : 'limited'} technical alignment with ${job.title ? `"${job.title}"` : 'the target position'}. Review skill gaps and update resume keywords for better ATS compatibility.`,
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
      console.warn('AI analysis call failed, using rule-based match fallback:', aiErr.message)
      result = fallbackAnalysis(resume, job)
    }

    if (!result || !result.matchScore) {
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