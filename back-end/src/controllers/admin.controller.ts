import { Request, Response } from "express";
import { Tutor } from "../models/Tutor.model";
import { Student } from "../models/Student.model";
import { Parent } from "../models/Parent.model";
import { Course } from "../models/Course.model";

// ✅ Fetch all tutors
export const getAllTutors = async (_: Request, res: Response) => {
  try {
    const tutors = await Tutor.find().lean();
    res.status(200).json({ tutors });
  } catch (error) {
    console.error("Error fetching tutors:", error);
    res.status(500).json({ message: "Failed to fetch tutors" });
  }
};

// ✅ Fetch all students
export const getAllStudents = async (_: Request, res: Response) => {
  try {
    const students = await Student.find().lean();
    res.status(200).json({ students });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

// ✅ Fetch all parents
export const getAllParents = async (_: Request, res: Response) => {
  try {
    const parents = await Parent.find().lean();
    res.status(200).json({ parents });
  } catch (error) {
    console.error("Error fetching parents:", error);
    res.status(500).json({ message: "Failed to fetch parents" });
  }
};

// ✅ Fetch all courses and safely flatten tutor name
export const getAllCourses = async (_: Request, res: Response) => {
  try {
    const courses = await Course.find()
      .populate("tutorId", "name email photo") // 👈 include more fields if needed
      .lean();

    const formattedCourses = courses.map(course => {
      const tutor = course.tutorId as unknown as {
        _id: string;
        name: string;
        email?: string;
        photo?: string;
      };

      return {
        ...course,
        tutorName: tutor.name,
        tutorEmail: tutor.email,
        tutorPhoto: tutor.photo,
      };
    });

    res.status(200).json({ courses: formattedCourses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};
export const deleteTutorAndCourses = async (req: Request, res: Response) => {
  const { tutorId } = req.params;

  try {
    // Delete all courses linked to the tutor
    await Course.deleteMany({ tutorId });

    // Delete the tutor
    await Tutor.findByIdAndDelete(tutorId);

    res.status(200).json({ message: "Tutor and their courses deleted successfully" });
  } catch (error) {
    console.error("Error deleting tutor and courses:", error);
    res.status(500).json({ message: "Failed to delete tutor and courses" });
  }
};