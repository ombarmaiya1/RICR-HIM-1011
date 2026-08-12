import fs from "fs";
import Resume from "./resume.model.js";
import AppError from "../../utils/AppError.js";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { parseResumeWithAI } from "../../utils/ai.js";

const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError("Resume file is required", 400);
    }

    let extractedText = "";

    if (req.file.mimetype === "application/pdf") {
      const data = await pdfParse(req.file.buffer);
      extractedText = data.text;
    } 
    else if (
      req.file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({
        buffer: req.file.buffer,
      });

      extractedText = result.value;
    } 
    else {
      throw new AppError("Only PDF and DOCX files are supported", 400);
    }

    if (!extractedText.trim()) {
      throw new AppError("Could not extract text from resume", 400);
    }

    const parsedData = await parseResumeWithAI(extractedText);

    const resume = await Resume.create({
      userId: req.user.userId,
      fileName: req.file.originalname,
      extractedText,parsedData,
    });

    res.status(201).json({
      success: true,
      message: "Resume uploaded successfully",
      resume,
    });
  } catch (error) {
    next(error);
  }
};


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

export { uploadResume , getResumes, getResume };