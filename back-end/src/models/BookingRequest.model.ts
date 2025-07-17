import mongoose from "mongoose";

const bookingRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" }, // student or parent
  userName: { type: String, required: true },
  requestedBy: {
    type: String,
    enum: ["student", "parent"],
    default: "student"
  },
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
