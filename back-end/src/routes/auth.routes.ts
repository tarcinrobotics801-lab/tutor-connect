import { Router } from "express";
import { signup, getCounts } from "../controllers/signup.controller";
import { login } from "../controllers/login.controller";
import { completeTutorProfile } from "../controllers/completeTutorProfile.controller";
import { getCompletedTutors, TutorById } from "../controllers/getCompletedTutors.controller";
import { completeStudentProfile } from "../controllers/completeStudentProfile.controller";
import { getAllCourses } from "../controllers/auth.controller";
import { completeParentProfile } from "../controllers/parentProfile.controller";
import { Student } from "../models/Student.model";
import { createCourse } from "../controllers/createCourseController";
const router = Router();

// Auth routes
router.post("/signup", signup);
router.post("/login", login);

// Profile completion
router.put("/tutor/:userId/profile", completeTutorProfile);
router.put("/student/:userId/profile", completeStudentProfile);
router.put("/parent/:userId/profile", completeParentProfile);
router.post("/courses", createCourse);
// Data retrieval
router.get("/completed-tutors", getCompletedTutors);
router.get("/tutor/:userId", TutorById);
router.get("/courses", getAllCourses);
router.get("/counts", getCounts);

// Get students available for parent registration
router.get("/students-for-parent", async (req, res) => {
  try {
    const students = await Student.find({ parentId: { $exists: false } })
      .select("_id name email")
      .lean();
    res.json({ students });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;