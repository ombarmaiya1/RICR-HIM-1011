import ATSResult from "./ats.model.js";

const STANDARD_SECTIONS = {
  experience: [
    "experience",
    "work experience",
    "employment",
    "professional experience",
  ],

  education: [
    "education",
    "academic background",
  ],

  skills: [
    "skills",
    "technical skills",
    "core skills",
  ],

  projects: [
    "projects",
    "personal projects",
    "academic projects",
  ],

  certifications: [
    "certifications",
    "certificates",
  ],

  summary: [
    "summary",
    "professional summary",
    "profile",
    "objective",
  ],
};

const normalizeText = (text = "") => {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
};

const checkContactInformation = (text) => {
  const issues = [];

  const emailRegex =
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

  const phoneRegex =
    /(\+?\d[\d\s().-]{8,}\d)/;

  if (!emailRegex.test(text)) {
    issues.push({
      severity: "high",
      title: "Email address not detected",
      description:
        "No recognizable email address was found in the resume.",
      suggestion:
        "Add a professional email address in the main document body.",
    });
  }

  if (!phoneRegex.test(text)) {
    issues.push({
      severity: "medium",
      title: "Phone number not detected",
      description:
        "No recognizable phone number was found.",
      suggestion:
        "Add your phone number using a standard format.",
    });
  }

  return issues;
};

const checkSections = (text) => {
  const issues = [];
  const foundSections = {};

  for (const [section, variations] of Object.entries(
    STANDARD_SECTIONS
  )) {
    const found = variations.some((name) =>
      text.includes(name)
    );

    foundSections[section] = found;
  }

  const requiredSections = [
    "experience",
    "education",
    "skills",
  ];

  for (const section of requiredSections) {
    if (!foundSections[section]) {
      issues.push({
        severity: "high",
        title: `Missing ${section} section`,
        description:
          `A standard ${section} section could not be clearly identified.`,
        suggestion:
          `Use a conventional "${section}" heading.`,
      });
    }
  }

  return {
    issues,
    foundSections,
  };
};

const checkTextQuality = (text) => {
  const issues = [];

  if (!text || text.trim().length < 100) {
    issues.push({
      severity: "high",
      title: "Resume may not be ATS readable",
      description:
        "Very little text could be extracted from the document.",
      suggestion:
        "Use a text-based PDF or DOCX instead of an image-based resume.",
    });
  }

  if (text.length > 15000) {
    issues.push({
      severity: "medium",
      title: "Resume may be unnecessarily long",
      description:
        "A large amount of text was extracted from the resume.",
      suggestion:
        "Remove unnecessary content and keep the resume focused on relevant experience.",
    });
  }

  return issues;
};

const extractKeywords = (jobDescription) => {
  if (!jobDescription) return [];

  const text = normalizeText(jobDescription);

  const commonWords = new Set([
    "the",
    "and",
    "for",
    "with",
    "from",
    "that",
    "this",
    "are",
    "you",
    "your",
    "our",
    "will",
    "have",
    "has",
    "about",
    "into",
    "using",
    "years",
    "work",
    "working",
    "role",
    "job",
    "team",
  ]);

  const words = text
    .replace(/[^\w\s+#.-]/g, " ")
    .split(/\s+/)
    .filter(
      (word) =>
        word.length >= 3 &&
        !commonWords.has(word)
    );

  return [...new Set(words)];
};

const checkKeywords = (
  resumeText,
  jobDescription
) => {
  if (!jobDescription) {
    return {
      matchedKeywords: [],
      missingKeywords: [],
      score: 100,
    };
  }

  const resume = normalizeText(resumeText);

  const keywords = extractKeywords(jobDescription);

  const matchedKeywords = keywords.filter((keyword) =>
    resume.includes(keyword)
  );

  const missingKeywords = keywords.filter(
    (keyword) => !resume.includes(keyword)
  );

  const score =
    keywords.length === 0
      ? 100
      : Math.round(
          (matchedKeywords.length / keywords.length) *
            100
        );

  return {
    matchedKeywords: matchedKeywords.slice(0, 30),
    missingKeywords: missingKeywords.slice(0, 30),
    score,
  };
};

const calculateScore = ({
  documentScore,
  structureScore,
  formattingScore,
  keywordScore,
  contentScore,
}) => {
  return Math.round(
    documentScore * 0.2 +
      structureScore * 0.2 +
      formattingScore * 0.15 +
      keywordScore * 0.3 +
      contentScore * 0.15
  );
};

const getStatus = (score) => {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Needs Improvement";

  return "Poor";
};

export const runATSCheck = async ({
  userId,
  resumeId,
  resumeText,
  jobId = null,
  jobDescription = "",
}) => {
  const normalizedText = normalizeText(resumeText);

  const textIssues = checkTextQuality(
    normalizedText
  );

  const contactIssues =
    checkContactInformation(normalizedText);

  const {
    issues: sectionIssues,
    foundSections,
  } = checkSections(normalizedText);

  const keywordResult = checkKeywords(
    normalizedText,
    jobDescription
  );

  const issues = [
    ...textIssues,
    ...contactIssues,
    ...sectionIssues,
  ];

  const documentScore =
    textIssues.length === 0 ? 100 : 50;

  const requiredSections = [
    "experience",
    "education",
    "skills",
  ];

  const sectionsFound =
    requiredSections.filter(
      (section) => foundSections[section]
    ).length;

  const structureScore = Math.round(
    (sectionsFound / requiredSections.length) *
      100
  );

  const formattingScore = 100;

  const contentScore =
    normalizedText.length >= 300 ? 90 : 60;

  const score = calculateScore({
    documentScore,
    structureScore,
    formattingScore,
    keywordScore: keywordResult.score,
    contentScore,
  });

  const status = getStatus(score);

  const result = await ATSResult.create({
    user: userId,
    resume: resumeId,
    job: jobId,

    score,
    status,

    breakdown: {
      document: documentScore,
      structure: structureScore,
      formatting: formattingScore,
      keywords: keywordResult.score,
      content: contentScore,
    },

    matchedKeywords:
      keywordResult.matchedKeywords,

    missingKeywords:
      keywordResult.missingKeywords,

    issues,
  });

  return result;
};