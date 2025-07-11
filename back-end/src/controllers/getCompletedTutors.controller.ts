import { Tutor } from "../models/Tutor.model"; // Make sure path is correct
import { Request, Response } from "express";

export const getCompletedTutors = async (req: Request, res: Response) => {
  try {
    const tutors = await Tutor.find({ role: "tutor", profileCompleted: true });
    res.status(200).json({ tutors });
  } catch (error) {
    console.error("Error fetching tutors:", error);
    res.status(500).json({ message: "Failed to fetch tutors" });
  }
};
export const TutorById = async (req: Request<{ userId: string }>, res: Response): Promise<void> => {
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