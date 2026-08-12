import Resume from "../resume/resume.model.js";
import Analysis from "../analysis/analysis.model.js";
import Interview from "../interview/interview.model.js";

const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const [resumes, analyses, interviews] = await Promise.all([
      Resume.find({ userId }).sort({ createdAt: -1 }),

      Analysis.find({ userId })
        .populate("resumeId", "fileName")
        .populate("jobId", "title")
        .sort({ createdAt: -1 }),

      Interview.find({ userId })
        .populate("resumeId", "fileName")
        .populate("jobId", "title")
        .sort({ createdAt: -1 }),
    ]);

    res.status(200).json({
      success: true,
      resumes,
      analyses,
      interviews,
    });
  } catch (error) {
    next(error);
  }
};

export { getDashboard };