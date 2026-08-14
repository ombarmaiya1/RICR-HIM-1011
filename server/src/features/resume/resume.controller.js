import Resume from "./resume.model.js";
import AppError from "../../utils/AppError.js";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { parseResumeWithAI } from "../../utils/ai.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../../config/cloudinary.js";

/**
 * Upload and parse resume (PDF / DOCX) and store to Cloudinary
 * POST /api/resumes/upload
 */
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError("Resume file is required", 400);
    }

    let extractedText = "";

    // 1. Text Extraction
    if (req.file.mimetype === "application/pdf") {
      const parser = new PDFParse({ data: req.file.buffer });
      const result = await parser.getText();
      extractedText = result.text;
    } else if (
      req.file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({
        buffer: req.file.buffer,
      });
      extractedText = result.value;
    } else {
      throw new AppError("Only PDF and DOCX files are supported", 400);
    }

    if (!extractedText.trim()) {
      throw new AppError("Could not extract text from resume", 400);
    }

    // 2. Upload PDF / Document to Cloudinary
    let fileUrl = "";
    let cloudinaryPublicId = "";
    try {
      const isPdf = req.file.mimetype === "application/pdf";
      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: "ai_career_pro/resumes",
        resource_type: isPdf ? "auto" : "raw",
        public_id: `resume_${req.user.userId}_${Date.now()}`,
      });

      fileUrl = uploadResult.secure_url || uploadResult.url || "";
      cloudinaryPublicId = uploadResult.public_id || "";
    } catch (cloudError) {
      console.warn("Cloudinary upload warning (fallback to text):", cloudError.message);
    }

    // 3. AI Parse structure
    const parsedData = await parseResumeWithAI(extractedText);

    // 4. Save to Database
    const resume = await Resume.create({
      userId: req.user.userId,
      fileName: req.file.originalname,
      fileUrl,
      cloudinaryPublicId,
      extractedText,
      parsedData,
    });

    res.status(201).json({
      success: true,
      message: "Resume uploaded and stored successfully",
      resume,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all resumes for user
 * GET /api/resumes
 */
const getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      resumes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single resume by ID
 * GET /api/resumes/:resumeId
 */
const getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.resumeId,
      userId: req.user.userId,
    });

    if (!resume) {
      throw new AppError("Resume not found", 404);
    }

    res.status(200).json({
      success: true,
      resume,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete resume and remove from Cloudinary
 * DELETE /api/resumes/:resumeId
 */
const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.resumeId,
      userId: req.user.userId,
    });

    if (!resume) {
      throw new AppError("Resume not found", 404);
    }

    if (resume.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(resume.cloudinaryPublicId, {
          resource_type: "raw",
        });
      } catch (err) {
        console.warn("Cloudinary delete cleanup warning:", err.message);
      }
    }

    res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
      resumeId: req.params.resumeId,
    });
  } catch (error) {
    next(error);
  }
};

export { uploadResume, getResumes, getResume, deleteResume };