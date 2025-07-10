import { Student } from "../models/Student.model";
import { Tutor } from "../models/Tutor.model";
import { Course } from "../models/Course.model";
import { Parent } from "../models/Parent.model";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";

// --- Signup Interfaces ---
interface TutorSignupBody {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    role: "tutor";
}

interface StudentSignupBody {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    role: "student";
}

interface ParentSignupBody {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    role: "parent";
  }
  
  type SignupBody = TutorSignupBody | StudentSignupBody | ParentSignupBody;

// Helper function to normalize MongoDB document for frontend
const normalizeDocument = (doc: any) => {
    return {
        _id: doc._id,                    // 🔥 Only using _id
        name: doc.name,
        email: doc.email,
        role: doc.role,
        profileCompleted: doc.profileCompleted,
        phoneNumber: doc.phoneNumber,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
        // password is excluded
    };
};

// --- Tutor Signup ---
export const tutorSignup = async (
    req: Request<{}, {}, TutorSignupBody>,
    res: Response
): Promise<void> => {
    try {
        const { name, email, password, phoneNumber } = req.body;

        // Validate required fields
        if (!name || !email || !password || !phoneNumber) {
            res.status(400).json({ message: "All fields are required" });
            return;
        }

        // Check if tutor already exists
        const existingTutor = await Tutor.findOne({ email });
        if (existingTutor) {
            res.status(400).json({ message: "Tutor already exists with this email" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const tutor = new Tutor({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            role: "tutor",
            profileCompleted: false,
        });

        await tutor.save();

        // Normalize response for frontend
        const tutorResponse = normalizeDocument(tutor);

        res.status(201).json({
            message: "Tutor signup successful",
            user: tutorResponse,
        });
    } catch (err) {
        console.error("Tutor signup error:", err);
        res.status(500).json({
            message: "Tutor signup failed",
            error: err instanceof Error ? err.message : "Unknown error",
        });
    }
};

// --- Student Signup ---
export const studentSignup = async (
    req: Request<{}, {}, StudentSignupBody>,
    res: Response
): Promise<void> => {
    try {
        const { name, email, password, phoneNumber } = req.body;

        // Validate required fields
        if (!name || !email || !password || !phoneNumber) {
            res.status(400).json({ message: "All fields are required" });
            return;
        }

        // Check if student already exists
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            res.status(400).json({ message: "Student already exists with this email" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const student = new Student({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            role: "student",
            profileCompleted: false,
        });

        await student.save();

        // Normalize response for frontend
        const studentResponse = normalizeDocument(student);

        res.status(201).json({
            message: "Student signup successful",
            user: studentResponse,
        });
    } catch (err) {
        console.error("Student signup error:", err);
        res.status(500).json({
            message: "Student signup failed",
            error: err instanceof Error ? err.message : "Unknown error",
        });
    }
};
export const parentSignup = async (
    req: Request<{}, {}, ParentSignupBody>,
    res: Response
  ): Promise<void> => {
    try {
      const { name, email, password, phoneNumber } = req.body;
  
      if (!name || !email || !password || !phoneNumber) {
        res.status(400).json({ message: "All fields are required" });
        return;
      }
  
      const existingParent = await Parent.findOne({ email });
      if (existingParent) {
        res.status(400).json({ message: "Parent already exists with this email" });
        return;
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const parent = new Parent({
        name,
        email,
        password: hashedPassword,
        phoneNumber,
        role: "parent",
        profileCompleted: false,
      });
  
      await parent.save();
  
      const parentResponse = {
        _id: parent._id,
        name: parent.name,
        email: parent.email,
        role: parent.role,
        phoneNumber: parent.phoneNumber,
        profileCompleted: parent.profileCompleted,
        createdAt: parent.createdAt,
        updatedAt: parent.updatedAt,
      };
  
      res.status(201).json({
        message: "Parent signup successful",
        user: parentResponse,
      });
    } catch (err) {
      console.error("Parent signup error:", err);
      res.status(500).json({
        message: "Parent signup failed",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };
  

// --- Generic Signup Handler ---
export const signup = async (
    req: Request<{}, {}, SignupBody>,
    res: Response
  ): Promise<void> => {
    try {
      const { role } = req.body;
  
      switch (role) {
        case "tutor":
          await tutorSignup(req as Request<{}, {}, TutorSignupBody>, res);
          break;
        case "student":
          await studentSignup(req as Request<{}, {}, StudentSignupBody>, res);
          break;
        case "parent":
          await parentSignup(req as Request<{}, {}, ParentSignupBody>, res);
          break;
        default:
          res.status(400).json({ message: "Invalid role specified. Only 'tutor', 'student', and 'parent' are supported." });
      }
    } catch (err) {
      console.error("Signup error:", err);
      res.status(500).json({
        message: "Signup failed",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };
  

// --- Get Counts for Registration Requirements ---
export const getCounts = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const tutorCount = await Tutor.countDocuments();
        const courseCount = await Course.countDocuments();
        const studentCount = await Student.countDocuments();

        res.status(200).json({
            tutorCount,
            courseCount,
            studentCount,
        });
    } catch (err) {
        console.error("Error fetching counts:", err);
        res.status(500).json({
            message: "Failed to fetch counts",
            error: err instanceof Error ? err.message : "Unknown error",
        });
    }
};

// --- Get All Students (for admin purposes) ---
export const getAllStudents = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const students = await Student.find({})
            .select('name email phoneNumber profileCompleted yearOfStudent department collegeName city state createdAt')
            .sort({ createdAt: -1 });

        const normalizedStudents = students.map(student => ({
            _id: student._id,                // 🔥 Only using _id
            name: student.name,
            email: student.email,
            phoneNumber: student.phoneNumber,
            profileCompleted: student.profileCompleted,
            yearOfStudent: student.yearOfStudent,
            department: student.department,
            collegeName: student.collegeName,
            city: student.city,
            state: student.state,
            createdAt: student.createdAt
        }));

        res.status(200).json({
            students: normalizedStudents,
            count: normalizedStudents.length
        });
    } catch (err) {
        console.error("Error fetching students:", err);
        res.status(500).json({
            message: "Failed to fetch students",
            error: err instanceof Error ? err.message : "Unknown error",
        });
    }
};

// --- Get All Tutors (for admin purposes) ---
export const getAllTutors = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const tutors = await Tutor.find({})
            .select('name email phoneNumber profileCompleted educationalQualification yearsOfExperience subjects bio createdAt')
            .sort({ createdAt: -1 });

        const normalizedTutors = tutors.map(tutor => ({
            _id: tutor._id,                  // 🔥 Only using _id
            name: tutor.name,
            email: tutor.email,
            phoneNumber: tutor.phoneNumber,
            profileCompleted: tutor.profileCompleted,
            educationalQualification: tutor.educationalQualification,
            yearsOfExperience: tutor.yearsOfExperience,
            subjects: tutor.subjects,
            bio: tutor.bio,
            createdAt: tutor.createdAt
        }));

        res.status(200).json({
            tutors: normalizedTutors,
            count: normalizedTutors.length
        });
    } catch (err) {
        console.error("Error fetching tutors:", err);
        res.status(500).json({
            message: "Failed to fetch tutors",
            error: err instanceof Error ? err.message : "Unknown error",
        });
    }
};