import { Request, Response } from "express";
import { Course } from "../models/Course.model";
import { Tutor } from "../models/Tutor.model";

// Explicit return type Promise<void>
export const deleteCourseByName = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawName = req.params.courseName;
    const cleanName = decodeURIComponent(rawName).trim();

    console.log("🔍 Attempting to delete course with name:", cleanName);

    // Log all course names in the DB to debug
    const allCourses = await Course.find({});
    console.log("📚 Courses in DB:", allCourses.map(c => `"${c.courseName}"`));

    // Find course using case-insensitive exact match
    const course = await Course.findOne({
      courseName: new RegExp(`^${cleanName}$`, "i"),
    });

    if (!course) {
      console.log("⚠️ Course not found for:", cleanName);
      res.status(404).json({ message: "Course not found" });
      return;
    }

    // Delete the course from Course collection
    await Course.findByIdAndDelete(course._id);

    // Remove from tutor's courseNames array
    await Tutor.findByIdAndUpdate(course.tutorId, {
      $pull: { courseNames: course.courseName },
    });

    console.log("✅ Course deleted:", cleanName);
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (err) {
    console.error("❌ deleteCourseByName error:", err);
    res.status(500).json({
      message: "Server error",
      error: (err as Error).message,
    });
  }
};
