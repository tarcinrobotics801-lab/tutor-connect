import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: string;
  type: 'booking_request' | 'booking_accepted' | 'booking_rejected';
  title: string;
  message: string;
  bookingRequestId?: string;
  createdAt: Date;
  read: boolean;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: String, required: true },
  type: { type: String, required: true, enum: ['booking_request', 'booking_accepted', 'booking_rejected'] },
  title: { type: String, required: true },
  message: { type: String, required: true },
  bookingRequestId: { type: String },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

export const NotificationModel = mongoose.model<INotification>("Notification", NotificationSchema);