import express from "express";

import {
  getAllTutors,
  getAllStudents,
  getAllParents,
  getAllCourses,
  deleteTutorAndCourses,
  getPendingTutors,
  approveTutor,
  rejectTutor,
} from "../controllers/admin.controller";

const router = express.Router();

router.get("/tutors", getAllTutors);
// Pending tutor requests
router.get("/pending-tutors", getPendingTutors);
router.patch("/approve-tutor/:tutorId", (req, res) => { approveTutor(req, res); });
router.patch("/reject-tutor/:tutorId", (req, res) => { rejectTutor(req, res); });
router.get("/students", getAllStudents);
router.get("/parents", getAllParents);
router.get("/courses", getAllCourses);

// ✅ New route to delete tutor and their courses
router.delete("/tutors/:tutorId", deleteTutorAndCourses);

export default router;