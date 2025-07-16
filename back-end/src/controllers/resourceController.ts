import { Request, Response } from "express";
import Resource from "../models/Resource.model";

export const createResource = async (req: Request, res: Response) => {
  try {
    const newResource = new Resource(req.body);
    await newResource.save();
    res.status(201).json(newResource);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getAllResources = async (_req: Request, res: Response) => {
  try {
    const resources = await Resource.find().sort({ uploadedAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};