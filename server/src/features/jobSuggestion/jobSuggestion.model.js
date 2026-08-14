import mongoose from "mongoose";

const jobSuggestionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      default: "Not specified",
    },

    workplaceType: {
      type: String,
      default: "Not specified",
    },

    employmentType: {
      type: String,
      default: "Not specified",
    },

    description: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    // AI analysis
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    matchedSkills: {
      type: [String],
      default: [],
    },

    missingSkills: {
      type: [String],
      default: [],
    },

    reasons: {
      type: [String],
      default: [],
    },

    recommendation: {
      type: String,
      default: "",
    },

    // Job source
    source: {
      type: String,
      enum: ["greenhouse", "lever"],
      required: true,
    },

    sourceJobId: {
      type: String,
      required: true,
    },

    // External links
    jobUrl: {
      type: String,
      default: "",
    },

    applyUrl: {
      type: String,
      default: "",
    },

    postedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent the same external job
// from being saved multiple times for one user.
jobSuggestionSchema.index(
  {
    user: 1,
    source: 1,
    sourceJobId: 1,
  },
  {
    unique: true,
  }
);

const JobSuggestion = mongoose.model(
  "JobSuggestion",
  jobSuggestionSchema
);

export default JobSuggestion;