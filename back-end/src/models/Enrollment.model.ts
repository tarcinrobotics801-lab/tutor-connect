// src/models/Enrollment.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IEnrollment extends Document {
  tutorId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;

  /** ONE of these two must be present */
  studentId?: mongoose.Types.ObjectId;
  parentId?: mongoose.Types.ObjectId;

  courseName: string;
  enrollmentDate: Date;
  status: "active" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const enrollmentSchema = new Schema<IEnrollment>(
  {
    tutorId: { type: Schema.Types.ObjectId, ref: "Tutor", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },

    // 👇 make both optional in the schema …
    studentId: { type: Schema.Types.ObjectId, ref: "Student" },
    parentId:  { type: Schema.Types.ObjectId, ref: "Parent"  },

    courseName:     { type: String, required: true },
    enrollmentDate: { type: Date,   default: Date.now },
    status: {
      type:   String,
      enum:   ["active", "completed", "cancelled"],
      default:"active",
    },
  },
  { timestamps: true }
);

/* ---------------------------
   Validation ─ exactly ONE ID
   --------------------------- */
enrollmentSchema.pre("validate", function (next) {
  if (!this.studentId && !this.parentId) {
    return next(new Error("Either studentId or parentId is required."));
  }
  if (this.studentId && this.parentId) {
    return next(new Error("Provide only one of studentId or parentId, not both."));
  }
  next();
});

/* ------------------------------------------
   Unique per course, per enrollee ‑ with
   partial indexes so the two fields don’t
   conflict with each other
   ------------------------------------------ */
enrollmentSchema.index(
  { studentId: 1, courseId: 1 },
  { unique: true, partialFilterExpression: { studentId: { $exists: true } } }
);
enrollmentSchema.index(
  { parentId: 1, courseId: 1 },
  { unique: true, partialFilterExpression: { parentId: { $exists: true } } }
);

export const Enrollment = mongoose.model<IEnrollment>(
  "Enrollment",
  enrollmentSchema
);