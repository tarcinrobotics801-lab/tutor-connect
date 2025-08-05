import express from "express";
import {
  getUserNotifications,
  markNotificationAsRead,
  clearAllNotifications,
  createNotification,
} from "../controllers/notificationController";

const router = express.Router();

router.get("/:userId", getUserNotifications);
router.patch("/:notificationId/read", markNotificationAsRead);
router.patch("/clear/:userId", clearAllNotifications);
router.post("/", createNotification); // ✅ THE CRITICAL FIX

export default router;
