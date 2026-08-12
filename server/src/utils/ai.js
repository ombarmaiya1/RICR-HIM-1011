import { ChatGoogle } from "@langchain/google";
import { z } from "zod";

const model = new ChatGoogle({
  model: "gemini-2.5-flash",
  temperature: 0,
});

const analysisSchema = z.object({
  matchScore: z.number().min(0).max(100),

  matchedSkills: z.array(z.string()),

  missingSkills: z.array(z.string()),

  suggestions: z.array(z.string()),

  summary: z.string(),
});

const structuredModel = model.withStructuredOutput(analysisSchema);

export const analyzeWithAI = async (resumeText, jobDescription) => {
  const prompt = `
You are an expert ATS resume analyzer.

Compare the resume against the target job description.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Analyze:
1. Overall match score from 0-100.
2. Skills/requirements that match.
3. Important skills/requirements missing or weak.
4. Specific improvements for THIS resume and THIS job.
5. A short overall summary.

Do not invent experience or skills that are not present.
`;

  return await structuredModel.invoke(prompt);
};