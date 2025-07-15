import mongoose from "mongoose";

const bookingRequestSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  courseId: { type: String, required: true },
  courseName: { type: String, required: true },
  tutorId: { type: mongoose.Schema.Types.Mixed, required: true }, // can be string or object
  tutorName: { type: String, required: true },
  slotId: { type: String, required: true },
  slotDay: { type: String, required: true },
  slotTime: { type: String, required: true },
  requestedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  meetingLink: { type: String },
  acceptedAt: { type: Date }
});

export const BookingRequest = mongoose.model("BookingRequest", bookingRequestSchema);
