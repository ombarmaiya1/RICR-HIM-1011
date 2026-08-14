import mongoose from "mongoose";

const atsIssueSchema = new mongoose.Schema(
  {
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    suggestion: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const atsResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      default: null,
    },

    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    status: {
      type: String,
      enum: ["Excellent", "Good", "Needs Improvement", "Poor"],
      required: true,
    },

    breakdown: {
      document: Number,
      structure: Number,
      formatting: Number,
      keywords: Number,
      content: Number,
    },

    matchedKeywords: [String],

    missingKeywords: [String],

    issues: [atsIssueSchema],
  },
  {
    timestamps: true,
  }
);

const ATSResult = mongoose.model("ATSResult", atsResultSchema);

export default ATSResult;