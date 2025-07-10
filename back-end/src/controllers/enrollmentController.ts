// src/controllers/enrollmentController.ts
import { RequestHandler } from "express";
import { Enrollment } from "../models/Enrollment.model";
import { Student }   from "../models/Student.model";
import { Parent }    from "../models/Parent.model";

/* ─────────── POST /api/enrollments ─────────── */
export const createEnrollment: RequestHandler = async (req, res) => {
  try {
    const {
      tutorId,
      courseId,
      studentId,   // optional
      parentId,    // optional
      courseName,
      enrollmentDate,
    } = req.body;

    /* basic presence check */
    if (!tutorId || !courseId || !courseName) {
      res.status(400).json({ message: "Missing tutorId, courseId, or courseName" });
      return;   // ✓ returns void
    }

    /* either‑or check */
    if ((!studentId && !parentId) || (studentId && parentId)) {
      res.status(400).json({ message: "Provide exactly ONE of studentId OR parentId" });
      return;
    }

    const enrollment = await Enrollment.create({
      tutorId,
      courseId,
      courseName,
      studentId,
      parentId,
      enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : undefined,
    });

    /* reflect enrollment on learner doc */
    if (studentId) {
      await Student.findByIdAndUpdate(
        studentId,
        { $addToSet: { enrolledCourses: courseName } },
        { new: false }
      );
    } else {
      await Parent.findByIdAndUpdate(
        parentId,
        { $addToSet: { enrolledCourses: courseName } },
        { new: false }
      );
    }

    res.status(201).json({ enrollment });
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(409).json({ message: "Already enrolled in this course" });
      return;
    }
    console.error("createEnrollment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ─────────── GET /api/enrollments/student/:id ─────────── */
export const getEnrollmentsByStudent: RequestHandler = async (req, res) => {
  try {
    const { id: studentId } = req.params;
    const enrollments = await Enrollment.find({ studentId }).sort({ enrollmentDate: -1 });
    res.json({ enrollments });
  } catch (err) {
    console.error("getEnrollmentsByStudent error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ─────────── GET /api/enrollments/parent/:id ─────────── */
export const getEnrollmentsByParent: RequestHandler = async (req, res) => {
  try {
    const { id: parentId } = req.params;
    const enrollments = await Enrollment.find({ parentId }).sort({ enrollmentDate: -1 });
    res.json({ enrollments });
  } catch (err) {
    console.error("getEnrollmentsByParent error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ─────────── GET /api/enrollments/tutor/:id ─────────── */
export const getEnrollmentsByTutor: RequestHandler = async (req, res) => {
  try {
    const { id: tutorId } = req.params;
    const enrollments = await Enrollment.find({ tutorId }).sort({ enrollmentDate: -1 });
    res.json({ enrollments });
  } catch (err) {
    console.error("getEnrollmentsByTutor error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ─────────── PATCH /api/enrollments/:id ─────────── */
export const updateEnrollment: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    /* forbid switching learner IDs */
    if (updates.studentId || updates.parentId) {
      res.status(400).json({ message: "Cannot change studentId / parentId once set" });
      return;
    }

    const enrollment = await Enrollment.findByIdAndUpdate(id, updates, { new: true });
    if (!enrollment) {
      res.status(404).json({ message: "Enrollment not found" });
      return;
    }
    res.json({ enrollment });
  } catch (err) {
    console.error("updateEnrollment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};