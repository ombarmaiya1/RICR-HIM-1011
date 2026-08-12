import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    extractedText: {
      type: String,
      required: true,
    },

    parsedData: {
      name: String,
      email: String,
      phone: String,
      summary: String,

      skills: [String],

      experience: [
        {
          company: String,
          position: String,
          startDate: String,
          endDate: String,
          description: String,
        },
      ],

      education: [
        {
          institution: String,
          degree: String,
          field: String,
          startDate: String,
          endDate: String,
        },
      ],

      projects: [
        {
          name: String,
          description: String,
          technologies: [String],
        },
      ],

      certifications: [
        {
          name: String,
          issuer: String,
          date: String,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Resume", resumeSchema);