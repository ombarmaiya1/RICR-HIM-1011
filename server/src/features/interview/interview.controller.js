import Resume from "../resume/resume.model.js";
import Job from "../job/job.model.js";
import Interview from "./interview.model.js";
import AppError from "../../utils/AppError.js";
import { generateInterviewQuestions } from "../../utils/ai.js";
import { evaluateAnswer } from "../../utils/ai.js";
import { generateInterviewSummary } from "../../utils/ai.js";

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

const submitAnswer = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    const { questionIndex, answer } = req.body;

    if (questionIndex === undefined || !answer?.trim()) {
      throw new AppError("Question index and answer are required", 400);
    }

    const interview = await Interview.findOne({
      _id: interviewId,
      userId: req.user.userId,
    });

    if (!interview) {
      throw new AppError("Interview not found", 404);
    }

    const question = interview.questions[questionIndex];

    if (!question) {
      throw new AppError("Question not found", 404);
    }

    const result = await evaluateAnswer(question.question, answer);

    question.answer = answer;
    question.score = result.score;
    question.feedback = result.feedback;

    await interview.save();

    res.status(200).json({
      success: true,
      question,
    });
  } catch (error) {
    next(error);
  }
};

const completeInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.interviewId,
      userId: req.user.userId,
    });

    if (!interview) {
      throw new AppError("Interview not found", 404);
    }

    // Gracefully handle any skipped or unanswered questions
    interview.questions.forEach((question) => {
      if (!question.answer || !question.answer.trim()) {
        question.answer = "[Skipped by candidate]";
        question.score = 0;
        question.feedback = "Question was skipped without an answer.";
      }
    });

    let overallScore = 0;
    let summary = "";

    try {
      const result = await generateInterviewSummary(interview.questions);
      if (result && typeof result.overallScore === "number") {
        overallScore = result.overallScore;
        summary = result.summary;
      }
    } catch (aiError) {
      console.error("AI summary invocation failed, falling back to computed score:", aiError);
    }

    // Always guarantee mathematically accurate score from evaluations
    const validScores = interview.questions
      .map((q) => q.score)
      .filter((s) => typeof s === "number");

    if (!overallScore && validScores.length > 0) {
      overallScore = Math.round(
        validScores.reduce((sum, s) => sum + s, 0) / interview.questions.length
      );
    }

    if (!summary) {
      summary = `Candidate completed mock interview across ${interview.questions.length} questions. Evaluated career readiness score: ${overallScore}%.`;
    }

    interview.overallScore = overallScore;
    interview.summary = summary;
    interview.status = "completed";

    await interview.save();

    res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    next(error);
  }
};

const getInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find({
      userId: req.user.userId,
    })
      .populate("resumeId", "fileName")
      .populate("jobId", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      interviews,
    });
  } catch (error) {
    next(error);
  }
};

const getInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.interviewId,
      userId: req.user.userId,
    })
      .populate("resumeId")
      .populate("jobId");

    if (!interview) {
      throw new AppError("Interview not found", 404);
    }

    res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    next(error);
  }
};

export {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterviews,
  getInterview,
};
