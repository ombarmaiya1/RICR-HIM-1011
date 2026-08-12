import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-3.5-flash",
  temperature: 0,
});

export const analyzeWithAI = async (resumeText, jobDescription) => {
  const prompt = `
You are an expert ATS resume analyzer.

Analyze the resume against the job description.

Resume:
${resumeText}

Job Description:
${jobDescription}

Return ONLY valid JSON in this format:

{
  "matchScore": 0,
  "matchedSkills": [],
  "missingSkills": [],
  "suggestions": [],
  "summary": ""
}

Rules:
- matchScore must be between 0 and 100.
- matchedSkills should contain relevant skills found in both.
- missingSkills should contain important skills from the job that are missing or weak in the resume.
- suggestions must be specific to this resume and job.
- Do not invent experience that is not present in the resume.
`;

  const response = await model.invoke(prompt);

  return JSON.parse(response.content);
};