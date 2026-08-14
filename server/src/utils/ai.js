import "dotenv/config";
import { ChatGoogle } from "@langchain/google";
import { z } from "zod";

const model = new ChatGoogle({
  model: "gemini-3-flash-preview",
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

const interviewQuestionsSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      type: z.enum(["technical", "behavioral"]),
    })
  ),
});

const questionModel = model.withStructuredOutput(
  interviewQuestionsSchema
);

export const generateInterviewQuestions = async (
  resumeText,
  jobDescription
) => {
  const prompt = `
You are an experienced technical interviewer.

Generate 5 interview questions based on the candidate's resume
and the target job description.

Candidate Resume:
${resumeText}

Job Description:
${jobDescription}

Requirements:
- Mix technical and behavioral questions.
- Questions must be relevant to the target role.
- Use the candidate's actual experience when possible.
- Do not ask questions unrelated to the job.
- Return exactly 5 questions.
`;

  return await questionModel.invoke(prompt);
};

const answerEvaluationSchema = z.object({
  score: z.number().min(0).max(100),
  feedback: z.string(),
});

const answerModel = model.withStructuredOutput(
  answerEvaluationSchema
);

export const evaluateAnswer = async (question, answer) => {
  const prompt = `
You are an experienced interviewer.

Evaluate the candidate's answer.

Question:
${question}

Candidate Answer:
${answer}

Evaluate:
- Relevance to the question
- Clarity
- Completeness
- Quality of explanation

Give a score from 0 to 100 and concise, constructive feedback.
`;

  return await answerModel.invoke(prompt);
};


const interviewSummarySchema = z.object({
  overallScore: z.number().min(0).max(100),
  summary: z.string(),
});

const summaryModel = model.withStructuredOutput(
  interviewSummarySchema
);

export const generateInterviewSummary = async (questions) => {
  const prompt = `
You are an experienced interviewer.

Review this mock interview:

${questions
  .map(
    (q, i) => `
Question ${i + 1}: ${q.question}
Answer: ${q.answer}
Score: ${q.score}
Feedback: ${q.feedback}
`
  )
  .join("\n")}

Provide:
- An overall score from 0 to 100.
- A concise summary of the candidate's overall performance.
- Mention key strengths and weaknesses.

Return the result as structured data.
`;

  return await summaryModel.invoke(prompt);
};


const resumeSchema = z.object({
  name: z.string(),
  email: z.string().default(""),
  phone: z.string().default(""),
  summary: z.string().default(""),

  skills: z.array(z.string()),

  experience: z.array(
    z.object({
      company: z.string(),
      position: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      description: z.string(),
    })
  ),

  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      field: z.string(),
      startDate: z.string(),
      endDate: z.string(),
    })
  ),

  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      technologies: z.array(z.string()),
    })
  ),

  certifications: z.array(
    z.object({
      name: z.string(),
      issuer: z.string(),
      date: z.string(),
    })
  ),
});

const resumeModel = model.withStructuredOutput(resumeSchema);

export const parseResumeWithAI = async (resumeText) => {
  const prompt = `
Extract structured information from this resume.

Resume:
${resumeText}

Rules:
- Only use information actually present in the resume.
- Do not invent information.
- If a field is missing, return an empty string or empty array.
- Extract skills, experience, education, projects and certifications accurately.
`;

  return await resumeModel.invoke(prompt);
};




