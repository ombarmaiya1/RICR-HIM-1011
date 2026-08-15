import Resume from "../resume/resume.model.js";
import Job from "../job/job.model.js";
import { runATSCheck } from "./ats.service.js";

export const checkATSCompatibility = async (req, res, next) => {
  try {
    const { resumeId, jobId } = req.body;

    if (!resumeId) {
      return res.status(400).json({
        message: "resumeId is required",
      });
    }

    const userId = req.user.userId || req.user._id;

    const resume = await Resume.findOne({
      _id: resumeId,
      $or: [{ userId }, { user: userId }],
    });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    let job = null;

    if (jobId) {
      job = await Job.findOne({
        _id: jobId,
        $or: [{ userId }, { user: userId }],
      });
    }

    const result = await runATSCheck({
      userId,
      resumeId: resume._id,
      resumeText: resume.extractedText || "",
      jobId: job?._id || null,
      jobDescription: job?.description || "",
    });

    return res.status(200).json({
      message: "ATS compatibility analysis completed",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};