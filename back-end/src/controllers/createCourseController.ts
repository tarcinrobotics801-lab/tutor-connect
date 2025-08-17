// src/controllers/createCourse.controller.ts
import { RequestHandler } from "express";
import { Course } from "../models/Course.model";
import { Tutor } from "../models/Tutor.model";

const YOUTUBE_REGEX =
  /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})(?:[&?].*)?$/;
export const createCourse: RequestHandler = async (req, res) => {
  try {
    const {
      tutorId,
      tutorName,
      courseName,
      description,
      sub,
      level,
      pricePerSession,
      sessionTime,
      tag,
      demoLink,
      classOrYear,       // NEW FIELD
      educationBoard,    // NEW FIELD
    } = req.body;


    // Check if tutor is approved
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      res.status(404).json({ message: "Tutor not found" });
      return;
    }
    if (!tutor.isApproved) {
      res.status(403).json({ message: "Tutor is not approved by admin." });
      return;
    }

    // Validate required fields
    if (
      !tutorId ||
      !courseName ||
      !sub ||
      !description ||
      !demoLink ||
      !YOUTUBE_REGEX.test(String(demoLink).trim())
    ) {
      res.status(400).json({ message: "Missing or invalid fields" });
      return;
    }

    // Validate new fields
    if (!classOrYear || !String(classOrYear).trim()) {
      res.status(400).json({ message: "Class or Year is required." });
      return;
    }

    if (!educationBoard || !["State", "CBSE", "ICSE", "College"].includes(educationBoard)) {
      res.status(400).json({ message: "Valid education board is required." });
      return;
    }

    // Create the course with all fields
    const course = await Course.create({
      tutorId,
      tutorName,
      courseName,
      description,
      sub,
      level,
      pricePerSession,
      sessionTime,
      tag,
      demoLink,
      classOrYear,       // Store new field
      educationBoard,    // Store new field
    });

    // Add course name to tutor's list (avoid duplicates)
    await Tutor.findByIdAndUpdate(tutorId, {
      $addToSet: { courseNames: courseName },
    });

    res.status(201).json({ course });
  } catch (err) {
    console.error("createCourse error:", err);
    res.status(500).json({
      message: "Server error",
      error:
        typeof err === "object" && err !== null && "message" in err
          ? (err as any).message
          : String(err),
      details:
        typeof err === "object" && err !== null && "errors" in err
          ? (err as any).errors
          : null,
    });
  }
};
