import { Request, Response } from "express";
import { TimeSlot } from "../models/TimeSlot.model";
import { Tutor } from "../models/Tutor.model";

// ✅ Create time slots only if they don't already exist
export const createTimeSlotsFromAvailability = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { courseId, tutorId } = req.body;

    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      res.status(404).json({ error: "Tutor not found" });
      return;
    }

    const availability = tutor.availability;
    if (!availability) {
      res.status(400).json({ error: "Tutor availability not set" });
      return;
    }

    const slotsToCreate: Array<{
      courseId: string;
      tutorId: string;
      day: string;
      time: string;
      maxMembers: number;
    }> = [];

    for (const [day, data] of Object.entries(availability)) {
      if (data.available) {
        for (const time of data.timeSlots) {
          const exists = await TimeSlot.exists({ courseId, tutorId, day, time });
          if (!exists) {
            slotsToCreate.push({
              courseId,
              tutorId,
              day,
              time,
              maxMembers: 20,
            });
          }
        }
      }
    }

    const created = await TimeSlot.insertMany(slotsToCreate);
    console.log("✅ New slots created:", created.length);

    res.status(201).json({ message: "Time slots created", created });
  } catch (err) {
    console.error("❌ Error creating time slots:", err);
    res.status(500).json({ error: "Failed to create time slots" });
  }
};


// ✅ Get time slots for a course
export const getTimeSlotsForCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      res.status(400).json({ error: "Missing courseId in request" });
      return;
    }

    const slots = await TimeSlot.find({ courseId });
    res.json(slots);
  } catch (err) {
    console.error("Error fetching time slots:", err);
    res.status(500).json({ error: "Failed to fetch time slots" });
  }
};
