import { Request, Response } from "express";
import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import { Tutor } from "../models/Tutor.model"; // Make sure path is correct
import { Course } from "../models/Course.model"; // ✅ Add at top
import { Student }  from "../models/Student.model";

import mongoose from "mongoose";
import {Types} from "mongoose";
// --- Signup ---
interface SignupBody {
  name: string;
  email: string;
  password: string;
  role: "student" | "tutor"|"parent";
  phoneNumber?: string;
}


export const signup = async (
  req: Request<{}, {}, SignupBody>,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password, role, phoneNumber } = req.body;

    const existingUser = await Tutor.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new Tutor({
      name,
      email,
      password: hashedPassword,
      role,
      phoneNumber,
    });

    await user.save();

    // Also create a blank student profile entry if role is student
if (role === "student") {
  await Student.create({
    name,
    email,
    phoneNumber,
    profileCompleted: false,
  });
}


    res.status(201).json({
      message: "Signup successful",
      user,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({
      message: "Signup failed",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};

// --- Login ---
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    console.log("🔐 Login attempt:", email);

    const user = await Tutor.findOne({ email });
    if (!user) {
      console.log("❌ User not found");
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Password mismatch");
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    console.log("✅ Login successful");

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted,
        phoneNumber: user.phoneNumber,
        educationQualification: user.educationalQualification,
        yearsOfExperience: user.yearsOfExperience,
        linkedinProfile: user.linkedinLink,
        bio: user.bio,
        profilePhoto: user.photo,
        availability: user.availability,
        subjects: user.subjects,
     
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed", error: err });
  }
};

export const completeTutorProfile = async (
  req: Request<{ userId: Types.ObjectId }, {}, any>,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const {
      educationQualification,
      yearsOfExperience,
      linkedinProfile,
      bio,
      availability,
      subjects,
      courses, // 👈 Array of full course objects from frontend
      profilePhoto
    } = req.body;

    // 🟢 Save all courses to courses collection with tutorId
    if (Array.isArray(courses)) {
      // Remove old courses by this tutor (optional if updating)
      await Course.deleteMany({ tutorId: new mongoose.Types.ObjectId(userId) });

      // Save new ones
      await Course.insertMany(
        courses.map((course: any) => ({
          ...course,
          tutorId: new mongoose.Types.ObjectId(userId),
        }))
      );
    }

    // 🟢 Store only course titles in tutors collection
    const courseTitles = courses?.map((c: any) => c.title) || [];

    const updatedUser = await Tutor.findByIdAndUpdate(
      userId,
      {
        educationQualification,
        yearsOfExperience,
        linkedinProfile,
        bio,
        availability,
        subjects,
        courses: courseTitles, // only course names stored here
        profilePhoto,
        profileCompleted: true,
      },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: "Tutor not found" });
      return;
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      message: "Profile update failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
export const getCompletedTutors = async (req: Request, res: Response) => {
  try {
    const tutors = await Tutor.find({ role: "tutor", profileCompleted: true });
    res.status(200).json({ tutors });
  } catch (error) {
    console.error("Error fetching tutors:", error);
    res.status(500).json({ message: "Failed to fetch tutors" });
  }
};
// ✅ Fetch tutor by ID (with profileCompleted = true)
export const TutorById = async (req: Request<{ userId: Types.ObjectId }>, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    // Your database query logic here
    const tutor = await Tutor.findById(userId); // or however you fetch the tutor
    
    if (!tutor) {
      res.status(404).json({ message: "Tutor not found" });
      return;
    }
    res.status(200).json({ tutor });
  } catch (error) {
    console.error("Error fetching tutor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};  
export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const courses = await Course.find()
      .populate("tutorId", "name") // ✅ populate tutorId with only the "name" field
      .lean();
    res.status(200).json({ courses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};
// ✅ Get count of completed tutors and total courses
export const getCounts = async (req: Request, res: Response) => {
  try {
    const tutorCount = await Tutor.countDocuments({ role: "tutor", profileCompleted: true });
    const courseCount = await Course.countDocuments();

    res.status(200).json({
      tutorCount,
      courseCount,
    });
  } catch (error) {
    console.error("Error fetching counts:", error);
    res.status(500).json({ message: "Failed to fetch counts" });
  }
};
export const completeStudentProfile: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      phoneNumber, yearOfStudy, department, college,
      city, state, profilePhoto,
    } = req.body;

    const student = await Student.findByIdAndUpdate(
  userId,
  {
    phoneNumber,
    yearOfStudy,
    department,
    college,
    city,
    state,
    profilePhoto,
    profileCompleted: true,
  
  },
  { new: true, upsert: true, setDefaultsOnInsert: true }
);

    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;          // ✅ nothing is *returned* except `void`
    }

    res.status(200).json({
      message: "Student profile updated successfully",
      student,
    });
  } catch (err) {
    console.error("Student profile error:", err);
    res.status(500).json({ message: "Profile update failed" });
  }
};