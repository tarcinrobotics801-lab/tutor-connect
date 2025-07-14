// routes/admin.routes.ts
import express from 'express';
import { getAllTutors, getAllStudents, getAllParents, getAllCourses } from '../controllers/admin.controller';

const router = express.Router();

router.get('/tutors', getAllTutors);
router.get('/students', getAllStudents);
router.get('/parents', getAllParents);
router.get('/courses', getAllCourses);

export default router;