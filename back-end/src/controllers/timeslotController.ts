import { Request, Response } from "express";
import { TimeSlot } from "../models/TimeSlot.model";
import { Tutor } from "../models/Tutor.model";

// ✅ Create time slots from tutor availability
export const createTimeSlotsFromAvailability = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { courseId, tutorId } = req.body;

    // 1. Find the tutor
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      res.status(404).json({ error: "Tutor not found" });
      return;
    }

    const availability = tutor.availability;
    console.log("Tutor availability:", availability);


    if (!availability) {
      res.status(400).json({ error: "Tutor availability not set" });
      return;
    }

    // 2. Build time slots based on availability
    const slotsToCreate: Array<{
      courseId: string;
      tutorId: string;
      day: string;
      time: string;
      maxMembers: number;
    }> = [];

    for (const [day, data] of Object.entries(availability)) {
      if (data.available) {
        data.timeSlots.forEach((time: string) => {
          slotsToCreate.push({
            courseId,
            tutorId,
            day,
            time,
            maxMembers: 20,
          });
        });
      }
    }

    // 3. Remove old time slots for this course & tutor
    await TimeSlot.deleteMany({ courseId, tutorId });

    // 4. Insert new slots
    const created = await TimeSlot.insertMany(slotsToCreate);
console.log("Slots to create:", slotsToCreate);

    res.status(201).json(created);
  } catch (err) {
    console.error("Error creating time slots:", err);
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
