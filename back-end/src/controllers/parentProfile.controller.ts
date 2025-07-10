import { Request, Response } from "express";
import mongoose from "mongoose";
import { Parent } from "../models/Parent.model";

interface Child {
  name: string;
  age: number;
  class: string;
  schoolName: string;
  place: string;
}

interface ParentProfileInput {
  name: string;
  phoneNumber?: string;
  occupation: string;
  parentType: string;
  children: Child[];
}

/**
 * PUT /api/auth/parent/:userId/profile
 */
export const completeParentProfile = async (
  req: Request<{ userId: string }, {}, ParentProfileInput>,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { name, phoneNumber, occupation, parentType, children } = req.body;

    // Check if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    // Basic field validation
    if (!name || !occupation || !parentType || !Array.isArray(children) || children.length === 0) {
      res.status(400).json({
        message: "Required fields: name, occupation, parentType, and at least one child",
      });
      return;
    }

    // Validate each child
    const hasIncompleteChild = children.some(
      (child) =>
        !child.name ||
        child.age === undefined ||
        !child.class ||
        !child.schoolName ||
        !child.place
    );

    if (hasIncompleteChild) {
      res.status(400).json({
        message: "Each child must have: name, age, class, schoolName, and place",
      });
      return;
    }

    // Update parent profile
    const updatedParent = await Parent.findByIdAndUpdate(
      userId,
      {
        name,
        phoneNumber,
        occupation,
        parentType,
        children,
        profileCompleted: true,
      },
      { new: true, runValidators: true }
    );

    if (!updatedParent) {
      res.status(404).json({ message: "Parent not found" });
      return;
    }

    res.status(200).json({
      message: "Parent profile updated successfully",
      user: updatedParent,
    });
  } catch (error) {
    console.error(`Error updating profile for user ${req.params.userId}:`, error);
    res.status(500).json({ message: "Server error", error });
  }
};