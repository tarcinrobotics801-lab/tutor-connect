import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "Tutor", required: true },
  day: { type: String, required: true },   // e.g., "monday"
  time: { type: String, required: true },  // e.g., "10:00 AM"
  maxMembers: { type: Number, default: 20 },
  currentMembers: { type: Number, default: 0 },
  enrolledUsers: {
  type: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
      role: { type: String, enum: ["student", "parent"], required: true },
    },
  ],
  default: [], // ✅ ensures it's initialized as array
},
}, { timestamps: true });


export const TimeSlot = mongoose.model("TimeSlot", timeSlotSchema);
