
// ✅ controllers/notificationController.ts
import { RequestHandler } from "express";
import { NotificationModel } from "../models/Notification.model";

export const getUserNotifications: RequestHandler = async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await NotificationModel.find({ userId }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

export const markNotificationAsRead: RequestHandler = async (req, res) => {
  const { notificationId } = req.params;
  try {
    await NotificationModel.findByIdAndUpdate(notificationId, { read: true });
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update notification" });
  }
};

export const clearAllNotifications: RequestHandler = async (req, res) => {
  const { userId } = req.params;
  try {
    await NotificationModel.updateMany({ userId }, { read: true });
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Failed to clear notifications" });
  }
};

export const createNotification: RequestHandler = async (req, res) => {
  console.log("📥 Incoming notification payload:", req.body); // 👈 log input

  try {
    const newNotification = await NotificationModel.create(req.body);
    console.log("✅ Notification saved:", newNotification);    // 👈 log saved result

    res.status(201).json({ notification: newNotification });
  } catch (err) {
    console.error("❌ Failed to create notification:", err);   // 👈 log error
    res.status(500).json({ message: "Failed to create notification" });
  }
};
