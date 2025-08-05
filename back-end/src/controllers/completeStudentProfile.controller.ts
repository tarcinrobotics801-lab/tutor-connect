import { Student } from "../models/Student.model";
import { Request, Response } from "express";
import { RequestHandler } from "express";

export const completeStudentProfile: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      phoneNumber, 
      yearOfStudent,
      department, 
      collegeName,
      city, 
      state, 
      photo,
      enrolledCourses
    } = req.body;

    // Validate required fields
    if (!yearOfStudent || !collegeName || !city || !state) {
      res.status(400).json({ 
        message: "All fields are required: yearOfStudent, department, collegeName, city, state" 
      });
      return;
    }

    const student = await Student.findByIdAndUpdate(
      userId,
      {
        phoneNumber,
        yearOfStudent,
        department,
        collegeName,
        city,
        state,
        photo,
        enrolledCourses, 
        profileCompleted: true,
      },
      { new: true, runValidators: true }
    );

    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    // Return consistent response structure that matches AppContext expectations
    res.status(200).json({
      message: "Student profile updated successfully",
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        profileCompleted: student.profileCompleted,
        phoneNumber: student.phoneNumber,
        yearOfStudent: student.yearOfStudent,
        department: student.department,
        collegeName: student.collegeName,
        city: student.city,
        state: student.state,
        photo: student.photo,
        parentId: student.parentId,
        enrolledCourses: student.enrolledCourses,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt
      }
    });
  } catch (err) {
    console.error("Student profile update error:", err);
    res.status(500).json({ 
      message: "Profile update failed",
      error: err instanceof Error ? err.message : "Unknown error"
    });
  }
};
