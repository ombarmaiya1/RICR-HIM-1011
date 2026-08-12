import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    matchScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    matchedSkills: [String],

    missingSkills: [String],

    suggestions: [String],

    summary: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Analysis", analysisSchema);