import Resume from "../resume/resume.model.js";
import JobSuggestion from "./jobSuggestion.model.js";
import { getJobSuggestions } from "./jobSuggestion.service.js";

export const suggestJobs = async (req, res, next) => {
  try {
    const { resumeId, jobTitle, jobDescription = "" } = req.body;

    if (!resumeId) {
      return res.status(400).json({
        message: "resumeId is required",
      });
    }

    if (!jobTitle) {
      return res.status(400).json({
        message: "jobTitle is required",
      });
    }

    const resume = await Resume.findOne({
      _id: resumeId,
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    const suggestions = await getJobSuggestions({
      userId: req.user._id,
      resumeText: resume.extractedText || resume.rawText || "",
      jobTitle,
      jobDescription,
    });

    return res.status(200).json({
      message: "Job suggestions generated successfully",
      count: suggestions.length,
      data: suggestions,
    });
  } catch (error) {
    next(error);
  }
};

export const getSavedJobSuggestions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, minScore = 0, source } = req.query;

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit), 1), 50);

    const filter = {
      user: req.user._id,
      matchScore: { $gte: Number(minScore) },
    };

    if (source) {
      filter.source = source;
    }

    const skip = (pageNumber - 1) * limitNumber;

    const [jobs, total] = await Promise.all([
      JobSuggestion.find(filter)
        .sort({ matchScore: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      JobSuggestion.countDocuments(filter),
    ]);

    return res.status(200).json({
      message: "Job suggestions fetched successfully",
      data: jobs,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
        hasNextPage: pageNumber * limitNumber < total,
        hasPreviousPage: pageNumber > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};