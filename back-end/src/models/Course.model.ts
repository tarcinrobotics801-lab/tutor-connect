import mongoose, { Document, Schema } from "mongoose";

/** A single course offered by a tutor */
export interface ICourse extends Document {
  courseName: string;
  sub: string;                     // keep plural → array
  level: string;
  pricePerSession: number;         // 0 means “Free”
  description: string;
  sessionTime: String,
  tag: string[];
  demoLink: string;                // NEW – YouTube demo video
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

export const Course =mongoose.model<ICourse>("Course", courseSchema);