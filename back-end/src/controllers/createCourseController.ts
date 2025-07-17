// src/controllers/createCourse.controller.ts
import { RequestHandler } from "express";
import { Course } from "../models/Course.model";
import { Tutor } from "../models/Tutor.model";

const YOUTUBE_REGEX =
  /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}$/;

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
    } = req.body;

    if (
      !tutorId || !courseName || !sub || !description || !demoLink ||
      !YOUTUBE_REGEX.test(String(demoLink).trim())
    ) {
      res.status(400).json({ message: "Missing or invalid fields" });
      return;
    }

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
    });

    await Tutor.findByIdAndUpdate(tutorId, {
      $addToSet: { courseNames: courseName },
    });

    res.status(201).json({ course });
  } catch (err) {
    console.error("createCourse error:", err);
    res.status(500).json({
    message: "Server error",
    error: typeof err === "object" && err !== null && "message" in err ? (err as any).message : String(err),
    details: typeof err === "object" && err !== null && "errors" in err ? (err as any).errors : null, // shows validation fields if it's a Mongoose error
  });
}
};