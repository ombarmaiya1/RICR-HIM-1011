import Resume from "../resume/resume.model.js";
import Analysis from "../analysis/analysis.model.js";
import Interview from "../interview/interview.model.js";

/**
 * Get aggregated dashboard data and real computed Career Readiness Score
 * GET /api/dashboard
 */
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

    // Calculate real Career Readiness Score from actual interviews and match analyses
    const completedInterviews = interviews.filter(
      (i) => i.status === "completed" && typeof i.overallScore === "number"
    );

    const avgInterviewScore =
      completedInterviews.length > 0
        ? Math.round(
            completedInterviews.reduce((acc, i) => acc + i.overallScore, 0) /
              completedInterviews.length
          )
        : null;

    const avgAnalysisScore =
      analyses.length > 0
        ? Math.round(
            analyses.reduce((acc, a) => acc + (a.matchScore || 0), 0) /
              analyses.length
          )
        : null;

    let careerReadinessScore = 0;
    if (avgInterviewScore !== null && avgAnalysisScore !== null) {
      careerReadinessScore = Math.round(
        avgAnalysisScore * 0.4 + avgInterviewScore * 0.6
      );
    } else if (avgInterviewScore !== null) {
      careerReadinessScore = avgInterviewScore;
    } else if (avgAnalysisScore !== null) {
      careerReadinessScore = avgAnalysisScore;
    }

    // Extract all unique matched skills identified by AI in user's analyses
    const uniqueSkillsSet = new Set();
    analyses.forEach((a) => {
      if (Array.isArray(a.matchedSkills)) {
        a.matchedSkills.forEach((s) => {
          if (s && s.trim()) uniqueSkillsSet.add(s.trim());
        });
      }
    });

    res.status(200).json({
      success: true,
      resumes,
      analyses,
      interviews,
      metrics: {
        careerReadinessScore,
        completedInterviewsCount: completedInterviews.length,
        totalInterviewsCount: interviews.length,
        skillsProfiledCount: uniqueSkillsSet.size,
        latestMatchScore: analyses[0]?.matchScore ?? null,
        latestInterviewScore: completedInterviews[0]?.overallScore ?? null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { getDashboard };