import path from "path";
import Resume from "./resume.model.js";
import AppError from "../../utils/AppError.js";
import mammoth from "mammoth";
import { parseResumeWithAI } from "../../utils/ai.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../../config/cloudinary.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

/**
 * Ensures Cloudinary PDF URLs open/download properly across all upload formats.
 */
const formatFileUrl = (url) => {
  if (!url) return "";
  if (url.includes("/image/upload/") && !url.includes("fl_attachment")) {
    let formatted = url.replace("/image/upload/", "/image/upload/fl_attachment/");
    if (!formatted.endsWith(".pdf") && !formatted.endsWith(".docx")) {
      formatted += ".pdf";
    }
    return formatted;
  }
  return url;
};

/**
 * Upload and parse resume (PDF / DOCX) and store to Cloudinary
 * POST /api/resumes/upload
 */
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError("Resume file is required", 400);
    }

    const existingResume = await Resume.findOne({
      userId: req.user.userId,
      fileName: req.file.originalname,
    });

    if (existingResume) {
      throw new AppError("A resume with this file name already exists", 409);
    }

    let extractedText = "";

    // 1. Text Extraction
    if (req.file.mimetype === "application/pdf") {
      const result = await pdfParse(req.file.buffer);
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

    // 2. Upload PDF / Document to Cloudinary as RAW file with file extension
    let fileUrl = "";
    let cloudinaryPublicId = "";
    try {
      const ext = path.extname(req.file.originalname) || (req.file.mimetype === "application/pdf" ? ".pdf" : ".docx");
      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: "ai_career_pro/resumes",
        resource_type: "raw",
        public_id: `resume_${req.user.userId}_${Date.now()}${ext}`,
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
      fileUrl: formatFileUrl(fileUrl),
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

    const formattedResumes = resumes.map((doc) => {
      const obj = doc.toObject();
      obj.fileUrl = formatFileUrl(obj.fileUrl);
      return obj;
    });

    res.status(200).json({
      success: true,
      resumes: formattedResumes,
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

    const obj = resume.toObject();
    obj.fileUrl = formatFileUrl(obj.fileUrl);

    res.status(200).json({
      success: true,
      resume: obj,
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