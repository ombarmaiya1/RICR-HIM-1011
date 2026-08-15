import mongoose from "mongoose";
import JobSuggestion from "./jobSuggestion.model.js";
import { searchAllJobProviders } from "./providers/index.js";
import { analyzeJobMatch } from "./jobSuggestion.ai.js";

const removeDuplicates = (jobs) => {
  const map = new Map();
  for (const job of jobs) {
    const key = `${job.source}-${job.sourceJobId}`;
    if (!map.has(key)) map.set(key, job);
  }
  return [...map.values()];
};

// Basic keyword pre-ranking to select top candidate jobs before sending to AI
const calculateKeywordScore = (job, resumeText, jobDescription) => {
  const text = `${job.title} ${job.description} ${job.location}`.toLowerCase();
  const searchTerms = `${resumeText} ${jobDescription}`.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  let matches = 0;
  for (const term of searchTerms) {
    if (text.includes(term)) matches++;
  }
  return matches;
};

export const getJobSuggestions = async ({
  userId,
  resumeText,
  jobTitle,
  jobDescription = "",
}) => {
  // 1. Search job providers with target job title query
  let jobs = await searchAllJobProviders({ query: jobTitle });

  // If no jobs returned with title query, search all available postings as fallback
  if (!jobs || jobs.length === 0) {
    jobs = await searchAllJobProviders({ query: "" });
  }

  const uniqueJobs = removeDuplicates(jobs);

  // 2. Pre-rank jobs using basic keyword matching to avoid sending dozens of jobs to AI
  const preRanked = uniqueJobs
    .map(job => ({
      job,
      kwScore: calculateKeywordScore(job, resumeText, jobDescription)
    }))
    .sort((a, b) => b.kwScore - a.kwScore);

  // Take top 5 candidates for AI analysis
  const candidateJobs = preRanked.slice(0, 5).map(item => item.job);

  const analyzedJobs = [];

  for (const job of candidateJobs) {
    try {
      const analysis = await analyzeJobMatch(resumeText, job, jobDescription);
      analyzedJobs.push({
        ...job,
        matchScore: analysis.matchScore ?? 70,
        matchedSkills: analysis.matchedSkills ?? [],
        missingSkills: analysis.missingSkills ?? [],
        recommendation: analysis.recommendation ?? "",
        reasons: analysis.reasons ?? [],
      });
    } catch (error) {
      console.error("AI job analysis failed for job:", job.sourceJobId, error.message);
      analyzedJobs.push({
        ...job,
        matchScore: 0,
        matchedSkills: [],
        missingSkills: [],
        recommendation: "Match score unavailable. Please retry.",
        reasons: [],
      });
    }
  }

  // 3. Sort by final AI match score
  const rankedJobs = analyzedJobs.sort((a, b) => b.matchScore - a.matchScore);

  const savedJobs = [];
  for (const job of rankedJobs) {
    const userIdObjectId = new mongoose.Types.ObjectId(userId);

    const saved = await JobSuggestion.findOneAndUpdate(
      {
        user: userIdObjectId,
        source: job.source,
        sourceJobId: job.sourceJobId,
      },
      {
        user: userIdObjectId,
        ...job,
      },
      {
        new: true,
        upsert: true,
      }
    );
    savedJobs.push(saved);
  }

  return savedJobs;
};