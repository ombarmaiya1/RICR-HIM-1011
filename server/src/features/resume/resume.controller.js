import fs from "fs";
import Resume from "./resume.model.js";
import AppError from "../../utils/AppError.js";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

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

    const resume = await Resume.create({
      userId: req.user.userId,
      fileName: req.file.originalname,
      extractedText,
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

export { uploadResume };