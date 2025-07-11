import { Course } from "../models/Course.model"; // ✅ Add at top
import { Request, Response } from "express";

export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const courses = await Course.find()
      .populate("tutorId", "name") // ✅ populate tutorId with only the "name" field
      .lean();
    res.status(200).json({ courses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};