import { Request, Response } from "express";
import mongoose from "mongoose";
import { Tutor } from "../models/Tutor.model";
import { Course } from "../models/Course.model";

const YOUTUBE_REGEX =
  /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w\-]{11}$/;

export const completeTutorProfile = async (
  req: Request<{ userId: string }, {}, any>,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const {
      educationalQualification,
      yearsOfExperience,
      linkedinLink,
      bio,
      availability,
      subjects,
      courses = [],
      photo,
      certificates = [],
      achievements = [], // ✅ New
    } = req.body;

    const tutor = await Tutor.findById(userId);
    if (!tutor) {
      res.status(404).json({ message: "Tutor not found" });
      return;
    }

    // Basic validations
    if (
      !educationalQualification ||
      !yearsOfExperience ||
      !bio ||
      !Array.isArray(subjects) ||
      !subjects.length
    ) {
      res.status(400).json({
        message:
          "All fields are required: educationalQualification, yearsOfExperience, bio, subjects",
      });
      return;
    }

    const LINKEDIN_REGEX = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_.]+\/?(\?.*)?$/i;
    if (!linkedinLink || !LINKEDIN_REGEX.test(String(linkedinLink).trim())) {
      res.status(400).json({
        message:
          "Please provide a valid LinkedIn profile URL (e.g., https://linkedin.com/in/yourname)",
      });
      return;
    }

    if (bio.trim().split(/\s+/).length < 50) {
      res.status(400).json({ message: "Bio must be at least 50 words" });
      return;
    }
    // ✅ Availability validation
    if (!availability || typeof availability !== "object") {
      res.status(400).json({ message: "Availability is required." });
      return;
    }
    const hasAtLeastOneSlot = Object.values(availability).some((day: any) =>
      day.available && Array.isArray(day.timeSlots) && day.timeSlots.length > 0
    );
    if (!hasAtLeastOneSlot) {
      res.status(400).json({
        message: "You must be available at least one day with time slots.",
      });
      return;
    }

    // ✅ Certificates validation
    if (!Array.isArray(certificates)) {
      res.status(400).json({ message: "Certificates must be an array" });
      return;
    }

    for (const cert of certificates) {
      if (!cert.name || !cert.url || !cert.uploadedAt) {
        res.status(400).json({
          message: "Each certificate must have name, url, and uploadedAt",
        });
        return;
      }
    }

    // ✅ Achievements validation
    if (!Array.isArray(achievements)) {
      res.status(400).json({ message: "Achievements must be an array" });
      return;
    }

    for (const ach of achievements) {
      if (!ach.name || !ach.url || !ach.uploadedAt || !ach.type) {
        res.status(400).json({
          message: "Each achievement must have name, url, uploadedAt, and type",
        });
        return;
      }
    }

    // Courses validation
    if (Array.isArray(courses) && courses.length) {
      for (const course of courses) {
        if (
          !course.courseName ||
          !course.demoLink ||
          !YOUTUBE_REGEX.test(String(course.demoLink).trim())
        ) {
          res.status(400).json({
            message: `Each course needs a courseName and a valid YouTube demoLink. "${course.courseName ?? "Unnamed"}" is invalid.`,
          });
          return;
        }
      }
    }

    // Insert only new courses
    if (courses.length) {
      const existingNames = new Set<string>(
        await Course.find({ tutorId: tutor._id }).distinct("courseName")
      );

      const freshCourses = courses.filter(
        (c: any) => !existingNames.has(c.courseName)
      );

      if (freshCourses.length) {
        await Course.insertMany(
          freshCourses.map((c: any) => ({
            ...c,
            tutorId: tutor._id,
          }))
        );
      }
    }

    const namesToAdd: string[] = courses
      .map((c: any) => c.courseName || c.name || c.title)
      .filter(Boolean);

    // ✅ Final update
    const updatedTutor = await Tutor.findByIdAndUpdate(
      tutor._id,
      {
        educationalQualification,
        yearsOfExperience,
        linkedinLink,
        bio,
        availability,
        subjects,
        photo,
        certificates,
        achievements, // ✅ store in MongoDB
        profileCompleted: true,
        $addToSet: { courseNames: { $each: namesToAdd } },
      },
      { new: true, runValidators: true }
    );

    if (!updatedTutor) {
      res.status(404).json({ message: "Tutor update failed" });
      return;
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: updatedTutor._id,
        name: updatedTutor.name,
        email: updatedTutor.email,
        role: updatedTutor.role,
        profileCompleted: updatedTutor.profileCompleted,
        phoneNumber: updatedTutor.phoneNumber,
        educationalQualification: updatedTutor.educationalQualification,
        yearsOfExperience: updatedTutor.yearsOfExperience,
        linkedinLink: updatedTutor.linkedinLink,
        bio: updatedTutor.bio,
        availability: updatedTutor.availability,
        subjects: updatedTutor.subjects,
        courseNames: updatedTutor.courseNames,
        photo: updatedTutor.photo,
        certificates: updatedTutor.certificates,
        achievements: updatedTutor.achievements, // ✅ Include in response
        updatedAt: updatedTutor.updatedAt,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      message: "Profile update failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};