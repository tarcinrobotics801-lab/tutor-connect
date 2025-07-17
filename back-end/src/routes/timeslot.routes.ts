import express from "express";
import { createTimeSlotsFromAvailability, getTimeSlotsForCourse } from "../controllers/timeslotController";

const router = express.Router();

router.post("/create", createTimeSlotsFromAvailability);
router.get("/:courseId", getTimeSlotsForCourse);

export default router;
