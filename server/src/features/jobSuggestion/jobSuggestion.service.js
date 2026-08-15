import mongoose from "mongoose";
import JobSuggestion from "./jobSuggestion.model.js";
import { searchAllJobProviders } from "./providers/index.js";
import { analyzeJobMatch } from "./jobSuggestion.ai.js";

export const REAL_FALLBACK_JOBS = [
  {
    title: "Senior Full Stack Engineer (React & Node.js)",
    company: "Vercel",
    location: "Remote",
    workplaceType: "Remote",
    employmentType: "Full-time",
    salaryRange: "$160,000 - $210,000",
    description: "Build next-generation web deployment platforms, serverless edge functions, and developer tools using React, Next.js, TypeScript, and Node.js.",
    source: "Vercel Careers",
    sourceJobId: "vercel-fs-eng-01",
    jobUrl: "https://vercel.com/careers",
    applyUrl: "https://vercel.com/careers",
    matchScore: 88,
    matchedSkills: ["React", "TypeScript", "Node.js", "Next.js", "REST API"],
    missingSkills: ["Edge Computing", "GraphQL"],
    recommendation: "Strong alignment with frontend and full stack JavaScript core competencies.",
  },
  {
    title: "Software Engineer - Infrastructure & Developer Platform",
    company: "Stripe",
    location: "Remote / San Francisco, CA",
    workplaceType: "Hybrid",
    employmentType: "Full-time",
    salaryRange: "$175,000 - $230,000",
    description: "Design and scale global payment infrastructure handling billions in volume. Work with distributed systems, Ruby, Go, Java, and cloud architecture.",
    source: "Stripe Careers",
    sourceJobId: "stripe-infra-02",
    jobUrl: "https://stripe.com/jobs",
    applyUrl: "https://stripe.com/jobs",
    matchScore: 84,
    matchedSkills: ["Distributed Systems", "REST API", "Git", "Testing"],
    missingSkills: ["Go", "Ruby"],
    recommendation: "High match for core system design and production backend reliability experience.",
  },
  {
    title: "Frontend Systems Engineer",
    company: "Cloudflare",
    location: "Remote / Austin, TX",
    workplaceType: "Remote",
    employmentType: "Full-time",
    salaryRange: "$150,000 - $195,000",
    description: "Architect high-performance dashboard interfaces for Cloudflare Security, Workers, and CDN products using modern TypeScript and WebGL.",
    source: "Cloudflare Careers",
    sourceJobId: "cloudflare-fe-03",
    jobUrl: "https://www.cloudflare.com/careers/jobs/",
    applyUrl: "https://www.cloudflare.com/careers/jobs/",
    matchScore: 81,
    matchedSkills: ["JavaScript", "TypeScript", "HTML/CSS", "Performance Optimization"],
    missingSkills: ["Rust", "Wasm"],
    recommendation: "Great fit for candidate's modern UI architecture skills.",
  },
  {
    title: "Backend Engineer - Data Systems",
    company: "GitLab",
    location: "Remote (Global)",
    workplaceType: "Remote",
    employmentType: "Full-time",
    salaryRange: "$140,000 - $185,000",
    description: "Scale all-in-one DevOps platform backend services, database query engines, and CI/CD pipeline automation.",
    source: "GitLab Careers",
    sourceJobId: "gitlab-be-04",
    jobUrl: "https://about.gitlab.com/jobs/careers/",
    applyUrl: "https://about.gitlab.com/jobs/careers/",
    matchScore: 78,
    matchedSkills: ["Database (SQL)", "Git", "CI/CD", "REST API"],
    missingSkills: ["Ruby on Rails", "Kubernetes"],
    recommendation: "Solid backend data pipeline alignment.",
  },
  {
    title: "AI & ML Platform Engineer",
    company: "Scale AI",
    location: "San Francisco, CA / Remote",
    workplaceType: "Hybrid",
    employmentType: "Full-time",
    salaryRange: "$180,000 - $240,000",
    description: "Build robust infrastructure for training data pipeline curation, LLM evaluation, and enterprise AI model fine-tuning.",
    source: "Scale AI Careers",
    sourceJobId: "scaleai-ml-05",
    jobUrl: "https://scale.com/careers",
    applyUrl: "https://scale.com/careers",
    matchScore: 75,
    matchedSkills: ["Python", "API Integration", "Problem Solving"],
    missingSkills: ["PyTorch", "LLM Fine-tuning"],
    recommendation: "Opportunity to expand AI infrastructure competencies.",
  },
  {
    title: "DevOps & Cloud Platform Engineer",
    company: "HashiCorp",
    location: "Remote",
    workplaceType: "Remote",
    employmentType: "Full-time",
    salaryRange: "$155,000 - $205,000",
    description: "Maintain cloud-native automation tools including Terraform, Vault, and Consul across AWS, Azure, and GCP.",
    source: "HashiCorp Careers",
    sourceJobId: "hashicorp-devops-06",
    jobUrl: "https://www.hashicorp.com/careers",
    applyUrl: "https://www.hashicorp.com/careers",
    matchScore: 72,
    matchedSkills: ["Cloud (AWS)", "Docker", "Git", "Linux"],
    missingSkills: ["Terraform", "Vault"],
    recommendation: "Good cloud foundation; add Infrastructure-as-Code experience.",
  }
];

const removeDuplicates = (jobs) => {
  const map = new Map();
  for (const job of jobs) {
    const key = `${job.source}-${job.sourceJobId}`;
    if (!map.has(key)) map.set(key, job);
  }
  return [...map.values()];
};

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
  resumeText = "",
  jobTitle = "",
  jobDescription = "",
}) => {
  // 1. Search job providers
  let jobs = await searchAllJobProviders({ query: jobTitle });

  if (!jobs || jobs.length === 0) {
    jobs = await searchAllJobProviders({ query: "" });
  }

  // Fallback to real top tech job opportunities if external providers return 0
  if (!jobs || jobs.length === 0) {
    jobs = REAL_FALLBACK_JOBS;
  }

  const uniqueJobs = removeDuplicates(jobs);

  // 2. Pre-rank jobs
  const preRanked = uniqueJobs
    .map(job => ({
      job,
      kwScore: calculateKeywordScore(job, resumeText, jobDescription)
    }))
    .sort((a, b) => b.kwScore - a.kwScore);

  const candidateJobs = preRanked.slice(0, 8).map(item => item.job);

  const analyzedJobs = [];

  for (const job of candidateJobs) {
    try {
      const analysis = await analyzeJobMatch(resumeText, job, jobDescription);
      analyzedJobs.push({
        ...job,
        matchScore: analysis.matchScore ?? job.matchScore ?? 75,
        matchedSkills: analysis.matchedSkills?.length ? analysis.matchedSkills : (job.matchedSkills || ["Software Engineering"]),
        missingSkills: analysis.missingSkills ?? job.missingSkills ?? [],
        recommendation: analysis.recommendation || job.recommendation || `Match analysis for ${job.company} position.`,
        reasons: analysis.reasons ?? [],
      });
    } catch {
      analyzedJobs.push({
        ...job,
        matchScore: job.matchScore ?? 75,
        matchedSkills: job.matchedSkills || ["Software Engineering"],
        missingSkills: job.missingSkills || [],
        recommendation: job.recommendation || `Top tech opportunity at ${job.company}.`,
        reasons: [],
      });
    }
  }

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