import mongoose, { Document, Schema } from 'mongoose';

// Certificate interface
export interface Certificate {
  name: string;
  url: string;
  uploadedAt: Date;
}

// Achievement interface
export interface Achievement {
  name: string;
  url: string;
  uploadedAt: Date;
  type: string;
}

// Tutor interface
export interface ITutor extends Document {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: 'tutor';
  profileCompleted: boolean;
  isApproved: boolean; // Admin approval status
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  educationalQualification?: string;
  yearsOfExperience?: string;
  educationBoard?: "State" | "CBSE" | "ICSE" | "College";
  gradeOrYear?: string;
  linkedinLink?: string;
  bio?: string;
  subjects?: string[];
  photo?: string;
  availability?: {
    monday: { available: boolean; timeSlots: string[] };
    tuesday: { available: boolean; timeSlots: string[] };
    wednesday: { available: boolean; timeSlots: string[] };
    thursday: { available: boolean; timeSlots: string[] };
    friday: { available: boolean; timeSlots: string[] };
    saturday: { available: boolean; timeSlots: string[] };
    sunday: { available: boolean; timeSlots: string[] };
  };
  courseNames?: string[];
  certificates?: Certificate[];
  achievements?: Achievement[];
  createdAt: Date;
  updatedAt: Date;
}


const tutorSchema = new Schema<ITutor>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'tutor' },

    profileCompleted: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false }, // Admin approval status
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: { type: String },
    educationalQualification: { type: String },
    yearsOfExperience: { type: String },

    // NEW FIELDS
    educationBoard: {
      type: String,
      enum: ["State", "CBSE", "ICSE", "College"],
      required: false
    },
    gradeOrYear: {
      type: String,
      required: false,
      default: "NO"
    },

    linkedinLink: { type: String },
    bio: { type: String },
    subjects: [{ type: String }],
    photo: { type: String },

    availability: {
      monday: {
        available: { type: Boolean, default: false },
        timeSlots: [{ type: String }]
      },
      tuesday: {
        available: { type: Boolean, default: false },
        timeSlots: [{ type: String }]
      },
      wednesday: {
        available: { type: Boolean, default: false },
        timeSlots: [{ type: String }]
      },
      thursday: {
        available: { type: Boolean, default: false },
        timeSlots: [{ type: String }]
      },
      friday: {
        available: { type: Boolean, default: false },
        timeSlots: [{ type: String }]
      },
      saturday: {
        available: { type: Boolean, default: false },
        timeSlots: [{ type: String }]
      },
      sunday: {
        available: { type: Boolean, default: false },
        timeSlots: [{ type: String }]
      }
    },

    courseNames: [{ type: String }],

    certificates: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],

    achievements: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
        type: { type: String, required: true }
      }
    ]
  },
  {
    timestamps: true
  }
);

export const Tutor = mongoose.model<ITutor>('Tutor', tutorSchema);
