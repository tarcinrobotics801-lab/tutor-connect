import mongoose, { Document, Schema } from "mongoose";

/** A single course offered by a tutor */
export interface ICourse extends Document {
  courseName: string;
  sub: string;                     // subject
  level: string;
  pricePerSession: number;         // 0 means “Free”
  description: string;
  sessionTime: string;
  tag: string[];
  demoLink: string;                // YouTube demo video
  classOrYear?: string;            // NEW - class name or college year
  educationBoard?: "State" | "CBSE" | "ICSE" | "College"; // NEW - board
  tutorId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const YOUTUBE_REGEX =
  /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w\-]{11}$/;

const courseSchema = new Schema<ICourse>(
  {
    courseName:       { type: String, required: true },
    sub:              { type: String, required: true },
    level:            { type: String, required: true },
    pricePerSession:  { type: Number, required: true, min: 0 },
    description:      { type: String, required: true },
    sessionTime:      { type: String, required: true },

    // NEW FIELDS
    classOrYear:      { type: String, default: "" },
    educationBoard: {
      type: String,
      enum: ["State", "CBSE", "ICSE", "College"],
      default: ""
    },

    tag:              { type: [String], default: [] },
    demoLink: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => YOUTUBE_REGEX.test(v),
        message:   "demoLink must be a valid YouTube URL",
      },
    },
    tutorId:          { type: Schema.Types.ObjectId, ref: "Tutor", required: true },
  },
  { timestamps: true }
);

export const Course = mongoose.model<ICourse>("Course", courseSchema);
