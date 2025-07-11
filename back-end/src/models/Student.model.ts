// src/models/Student.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IStudent extends Document {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: "student";

  /* profile */
  profileCompleted: boolean;
  yearOfStudent?: string;
  department?: string;
  collegeName?: string;
  city?: string;
  state?: string;
  photo?: string;

  /* NEW: list of course names the student has enrolled in */
  enrolledCourses: string[];

  /* parent relationship */
  parentId?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "student" },

    profileCompleted: { type: Boolean, default: false },
    yearOfStudent: String,
    department: String,
    collegeName: String,
    city: String,
    state: String,
    photo: String,

    /* NEW field */
    enrolledCourses: { type: [String], default: [] },

    parentId: { type: Schema.Types.ObjectId, ref: "Parent" },
  },
  { timestamps: true }
);

export const Student = mongoose.model<IStudent>("Student", studentSchema);