import "dotenv/config";
import { ChatGoogle } from "@langchain/google";
import { z } from "zod";

const model = new ChatGoogle({
  model: "gemini-3-flash-preview",
  temperature: 0,
});

const jobMatchSchema = z.object({
 matchScore: z.number().min(0).max(100),

  matchedSkills: z.array(z.string()),

  missingSkills: z.array(z.string()),

  reasons: z.array(z.string()),

  recommendation: z.string(),
});

const structuredModel =
  model.withStructuredOutput(jobMatchSchema);

export const analyzeJobMatch = async (
  resumeText,
  job,
  targetJobDescription = ""
) => {
  try {
    const prompt = `
You are an expert recruitment and resume-matching system.

Compare the candidate's resume against this job posting.

RESUME:
${resumeText}

JOB TITLE:
${job.title}

JOB DESCRIPTION:
${job.description}

${targetJobDescription ? `USER TARGET ROLE DETAILS:\n${targetJobDescription}` : ""}

Analyze:
1. How well the candidate matches this job.
2. Skills demonstrated in the resume that match the job.
3. Important required skills missing from the resume.
4. Why this job is or is not a good match.
5. Give a concise recommendation.

Rules:
- Only use information actually present in the resume.
- Do not invent experience.
- Do not assume a skill because another related skill exists.
- Missing evidence should be treated as missing.
- Return a realistic score from 0-100.
`;

    return await structuredModel.invoke(prompt);
  } catch (error) {
    console.error("AI matching invocation error:", error.message);
    // Fallback basic evaluation if AI service call fails
    return {
      matchScore: 0,
      matchedSkills: [],
      missingSkills: [],
      reasons: [],
      recommendation: "Unable to determine match at this time. Please try again later.",
    };
  }
};