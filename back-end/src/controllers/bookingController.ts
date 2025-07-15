import { Request, Response } from "express";
import { BookingRequest } from "../models/BookingRequest.model";

export const createBookingRequest = async (req: Request, res: Response) => {
  try {
    const {
      studentId,
      studentName,
      courseId,
      courseName,
      tutorId,
      tutorName,
      slotId,
      slotDay,
      slotTime,
    } = req.body;
    

    const newRequest = new BookingRequest({
      studentId,
      studentName,
      courseId,
      courseName,
      tutorId,
      tutorName,
      slotId,
      slotDay,
      slotTime,
      requestedAt: new Date(),
      status: "pending"
    });

    const saved = await newRequest.save();
    res.status(201).json({ booking: saved });
  } catch (err) {
    console.error("Booking request failed:", err);
    res.status(500).json({ error: "Failed to create booking request" });
  }
};

// ✅ Accept Booking Request
export const acceptBookingRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId, meetingLink } = req.body;

    const request = await BookingRequest.findById(requestId);
    if (!request) {
      res.status(404).json({ error: "Booking request not found" });
      return;
    }

    request.status = "accepted";
    request.meetingLink = meetingLink;
    request.acceptedAt = new Date();

    await request.save();

    res.status(200).json({ message: "Booking request accepted", booking: request });
  } catch (err) {
    console.error("Accept booking error:", err);
    res.status(500).json({ error: "Failed to accept booking" });
  }
};

// ✅ Reject Booking Request
export const rejectBookingRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId } = req.body;

    const request = await BookingRequest.findById(requestId);
    if (!request) {
      res.status(404).json({ error: "Booking request not found" });
      return;
    }

    request.status = "rejected";
    await request.save();

    res.status(200).json({ message: "Booking request rejected", booking: request });
  } catch (err) {
    console.error("Reject booking error:", err);
    res.status(500).json({ error: "Failed to reject booking" });
  }
};

