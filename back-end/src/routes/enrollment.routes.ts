// src/routes/enrollment.routes.ts
import { Router } from "express";
import {
  createEnrollment,
  getEnrollmentsByStudent,
  getEnrollmentsByParent,   // ← NEW
  getEnrollmentsByTutor,
  updateEnrollment,
} from "../controllers/enrollmentController";
const router = Router();

router.post("/",           createEnrollment);
router.get("/student/:id", getEnrollmentsByStudent);
router.get("/parent/:id",   getEnrollmentsByParent);   // ← NEW
router.get("/tutor/:id",   getEnrollmentsByTutor);
router.patch("/:id", updateEnrollment);

export default router;