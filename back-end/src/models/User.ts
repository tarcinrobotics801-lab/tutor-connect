import mongoose, { Schema, Document } from 'mongoose';

// Tutor Model
export interface ITutor extends Document {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: 'tutor';
  // Profile completion fields
  educationalQualification?: string;
  yearsOfExperience?: number;
  linkedinLink?: string;
  bio?: string;
  subjects?: string[];
  availability?: {
    monday: { available: boolean; timeSlots: string[] };
    tuesday: { available: boolean; timeSlots: string[] };
    wednesday: { available: boolean; timeSlots: string[] };
    thursday: { available: boolean; timeSlots: string[] };
    friday: { available: boolean; timeSlots: string[] };
    saturday: { available: boolean; timeSlots: string[] };
    sunday: { available: boolean; timeSlots: string[] };
  };
  courses?: string[]; // Course names
  profileCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TutorSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'tutor' },
  educationalQualification: { type: String },
  yearsOfExperience: { type: Number },
  linkedinLink: { type: String },
  bio: { type: String, minlength: 50 },
  subjects: [{ type: String }],
  availability: {
    monday: { available: { type: Boolean, default: false }, timeSlots: [String] },
    tuesday: { available: { type: Boolean, default: false }, timeSlots: [String] },
    wednesday: { available: { type: Boolean, default: false }, timeSlots: [String] },
    thursday: { available: { type: Boolean, default: false }, timeSlots: [String] },
    friday: { available: { type: Boolean, default: false }, timeSlots: [String] },
    saturday: { available: { type: Boolean, default: false }, timeSlots: [String] },
    sunday: { available: { type: Boolean, default: false }, timeSlots: [String] }
  },
  courses: [{ type: String }],
  profileCompleted: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Student Model
export interface IStudent extends Document {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: 'student';
  // Profile completion fields
  yearOfStudy?: string;
  department?: string;
  collegeName?: string;
  city?: string;
  state?: string;
  profileCompleted: boolean;
  parentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'student' },
  yearOfStudy: { type: String },
  department: { type: String },
  collegeName: { type: String },
  city: { type: String },
  state: { type: String },
  profileCompleted: { type: Boolean, default: false },
  parentId: { type: Schema.Types.ObjectId, ref: 'Parent' }
}, {
  timestamps: true
});

// Parent Model
export interface IParent extends Document {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: 'parent';
  studentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ParentSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'parent' },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', unique: true }
}, {
  timestamps: true
});

// Course Model
export interface ICourse extends Document {
  courseName: string;
  subjects: string[];
  level: string;
  pricePerSession: number;
  description: string;
  tags: string[];
  tutorId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema: Schema = new Schema({
  courseName: { type: String, required: true },
  subjects: [{ type: String, required: true }],
  level: { type: String, required: true },
  pricePerSession: { type: Number, required: true },
  description: { type: String, required: true },
  tags: [{ type: String }],
  tutorId: { type: Schema.Types.ObjectId, ref: 'Tutor', required: true }
}, {
  timestamps: true
});

// Enrollment Model
export interface IEnrollment extends Document {
  tutorId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  courseName: string;
  enrollmentDate: Date;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema: Schema = new Schema({
  tutorId: { type: Schema.Types.ObjectId, ref: 'Tutor', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  courseName: { type: String, required: true },
  enrollmentDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' }
}, {
  timestamps: true
});

// Export models
export const Tutor = mongoose.model<ITutor>('Tutor', TutorSchema);
export const Student = mongoose.model<IStudent>('Student', StudentSchema);
export const Parent = mongoose.model<IParent>('Parent', ParentSchema);
export const Course = mongoose.model<ICourse>('Course', CourseSchema);
export const Enrollment = mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);