import { Router } from "express";
import { signup, getCounts } from "../controllers/signup.controller";
import { login } from "../controllers/login.controller";
import { completeTutorProfile } from "../controllers/completeTutorProfile.controller";
import { getCompletedTutors, TutorById } from "../controllers/getCompletedTutors.controller";
import { completeStudentProfile } from "../controllers/completeStudentProfile.controller";
import { getAllCourses } from "../controllers/auth.controller";
import { completeParentProfile } from "../controllers/parentProfile.controller";
import { createCourse } from "../controllers/createCourseController";
import { deleteCourseByName } from "../controllers/deleteCoursecontroller";
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
router.delete("/deleteByName/:courseName", deleteCourseByName);
router.get("/counts", getCounts);

export default router;