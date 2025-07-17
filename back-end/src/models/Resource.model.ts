import { Schema, model, Document } from "mongoose";

export interface IResource extends Document {
  title: string;
  description: string;
  subject: string;
  className: string;
  driveUrl: string;
  contents?: string;
  tutorId: string;
  tutorName: string;
  uploadedAt: Date;
}

const resourceSchema = new Schema<IResource>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  subject: { type: String, required: true },
  className: { type: String, required: true },
  driveUrl: { type: String, required: true },
  contents: String,
  tutorId: { type: String, required: true },
  tutorName: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

export default model<IResource>("Resource", resourceSchema);