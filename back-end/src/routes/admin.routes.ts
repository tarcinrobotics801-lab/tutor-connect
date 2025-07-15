import express from "express";
import {
  getAllTutors,
  getAllStudents,
  getAllParents,
  getAllCourses,
  deleteTutorAndCourses, // ⬅ Import this
} from "../controllers/admin.controller";

const router = express.Router();

router.get("/tutors", getAllTutors);
router.get("/students", getAllStudents);
router.get("/parents", getAllParents);
router.get("/courses", getAllCourses);

// ✅ New route to delete tutor and their courses
router.delete("/tutors/:tutorId", deleteTutorAndCourses);

export default router;