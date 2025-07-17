import express from "express";
import { createBookingRequest,acceptBookingRequest,rejectBookingRequest } from "../controllers/bookingController";

const router = express.Router();

router.post("/", createBookingRequest);
router.post("/accept", (req, res, next) => {
  console.log("➡️ Hit /accept route");
  next(); // continue to actual handler
}, acceptBookingRequest);
router.post("/reject", rejectBookingRequest);

export default router;
