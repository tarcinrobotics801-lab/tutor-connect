import { Request, Response } from "express";
import { BookingRequest } from "../models/BookingRequest.model";
import { TimeSlot } from "../models/TimeSlot.model";
import { Student } from "../models/Student.model";
export const createBookingRequest = async (req: Request, res: Response) => {
  try {
    const {
      userId,     
      userName,     // ✅ required for both student/parent
      requestedBy,     // ✅ 'student' or 'parent'
      courseId,
      courseName,
      sessionTime,
      tutorId,
      tutorName,
      slotId,
      slotDay,
      slotTime,
    } = req.body;

    if (!userId || !requestedBy) {
      res.status(400).json({ message: "userId and requestedBy are required" });
      return;
    }

    const newRequest = new BookingRequest({
      userId,
      userName,
      requestedBy,
      courseId,
      courseName,
      sessionTime,
      tutorId,
      tutorName,
      slotId,
      slotDay,
      slotTime,
      requestedAt: new Date(),
      status: "pending",
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

    if (!requestId || !meetingLink) {
      res.status(400).json({ error: "requestId and meetingLink are required" });
      return;
    }

    // 🔍 Fetch the booking request
    const request = await BookingRequest.findById(requestId);
    if (!request) {
      res.status(404).json({ error: "Booking request not found" });
      return;
    }

    // ✅ Update booking request
    request.status = "accepted";
    request.meetingLink = meetingLink;
    request.acceptedAt = new Date();
    await request.save();

    // ⏫ Fetch and update time slot
    const slot = await TimeSlot.findById(request.slotId);
    if (!slot) {
      res.status(404).json({ error: "Associated time slot not found" });
      return;
    }

    // ✅ Prevent overbooking
    if (slot.currentMembers >= slot.maxMembers) {
      res.status(400).json({ error: "Cannot accept booking, slot is already full" });
      return;
    }

    

    // ✅ Check required user fields
    if (!request.userId || !request.requestedBy) {
      res.status(400).json({ error: "userId and requestedBy are required in the booking request" });
      return;
    }

    // ➕ Add student/parent to enrolledUsers
    slot.enrolledUsers.push({
      userId: request.userId,
      role: request.requestedBy, // "student" or "parent"
    });

    slot.currentMembers += 1;
    await slot.save();

    if (request.requestedBy === "student") {
    await Student.updateOne(
      { _id: request.userId },
      { $addToSet: { enrolledCourses: request.courseName } }
    );
  }

    res.status(200).json({
      message: "Booking request accepted and slot updated",
      booking: request,
      slot,
    });
  } catch (err) {
    console.error("❌ Accept booking error:", err);
    res.status(500).json({ error: "Failed to accept booking request" });
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