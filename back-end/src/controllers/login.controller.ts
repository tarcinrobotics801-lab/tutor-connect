import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { Tutor, ITutor } from "../models/Tutor.model";
import { Student, IStudent } from "../models/Student.model";
import { Parent, IParent } from "../models/Parent.model";
import { BookingRequest } from "../models/BookingRequest.model"

type UserDoc = ITutor | IStudent | IParent;

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    console.log("Login attempt for email:", email);

    // ✅ Admin login check (before DB queries)
    if (email === "admin@tarcin.in" && password === "Tarcin@12345") {
      const adminUser = {
        _id: "admin-1",
        name: "Admin",
        email: "admin@tarcin.in",
        role: "admin",
        profileCompleted: true
      };

      res.status(200).json({
        message: "Admin login successful",
        user: adminUser
      });
      return;
    }

    // ✅ Continue with DB lookup for tutor, student, parent
    let user: UserDoc | null = await Tutor.findOne({ email });
    let userType: "tutor" | "student" | "parent" | null = user ? "tutor" : null;

    if (!user) {
      user = await Student.findOne({ email });
      userType = user ? "student" : null;
    }

    if (!user) {
      user = await Parent.findOne({ email });
      userType = user ? "parent" : null;
    }

    if (!user) {
      console.log("❌ No user found with this email");
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔐 Password match:", isMatch);

    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // ✅ Response by user type
    switch (userType) {
      case "tutor":
  const tutor = user as ITutor;

  // 🔁 Fetch pending booking requests for this tutor
  const tutorIdStr = (tutor._id as unknown as { toString(): string }).toString();
  const bookingRequests = await BookingRequest.find({
  $or: [
    { tutorId: tutorIdStr },                  // if stored as string
    { "tutorId._id": tutorIdStr },            // if stored as object
  ],
  status: "pending",
});


  res.status(200).json({
    message: "Login successful",
    user: {
      _id: tutor._id,
      name: tutor.name,
      email: tutor.email,
      role: tutor.role,
      profileCompleted: tutor.profileCompleted,
      phoneNumber: tutor.phoneNumber,
      educationalQualification: tutor.educationalQualification,
      yearsOfExperience: tutor.yearsOfExperience,
      linkedinLink: tutor.linkedinLink,
      bio: tutor.bio,
      photo: tutor.photo,
      availability: tutor.availability,
      subjects: tutor.subjects,
      courseNames: tutor.courseNames,
      certificates: tutor.certificates,
      achievements: tutor.achievements,
      bookingRequests // ✅ include pending requests in login response
    },
  });
  break;

       

      case "student":
        const student = user as IStudent;
        res.status(200).json({
          message: "Login successful",
          user: {
            _id: student._id,
            name: student.name,
            email: student.email,
            role: student.role,
            profileCompleted: student.profileCompleted,
            phoneNumber: student.phoneNumber,
            yearOfStudent: student.yearOfStudent,
            department: student.department,
            collegeName: student.collegeName,
            city: student.city,
            state: student.state,
            photo: student.photo,
            parentId: student.parentId,
            enrolledCourses: student.enrolledCourses || [],
          },
        });
        break;

      case "parent":
        const parent = user as IParent;
        res.status(200).json({
          message: "Login successful",
          user: {
            _id: parent._id,
            name: parent.name,
            email: parent.email,
            role: parent.role,
            profileCompleted: parent.profileCompleted,
            phoneNumber: parent.phoneNumber,
            occupation: parent.occupation,
            parentType: parent.parentType,
            children: parent.children || [],
            studentId: parent.studentId,
          },
        });
        break;

      default:
        res.status(500).json({ message: "Unknown user type" });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      message: "Login failed",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};