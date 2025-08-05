import express from "express";
import cors from "cors";

// Import your route files
import authRoutes from "./routes/auth.routes";
import enrollmentRoutes from "./routes/enrollment.routes";
import uploadRoutes from "./routes/upload.routes";
import adminRoutes from './routes/admin.routes';
import timeSlotRoutes from "./routes/timeslot.routes";
import bookingRoutes from "./routes/booking.routes";
import resourceRoutes from "./routes/resource.routes";
import { createCourse } from "./controllers/createCourseController";
import notificationRoutes from "./routes/notificationRoutes";
const app = express();

// Enable CORS for frontend (adjust origin if needed)
app.use(cors({
  origin: ["http://localhost:8080","https://tutorconnect.tarcin.in"],  // your frontend origin
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Mount your routes
app.use("/api/auth", authRoutes);               // Handles /api/auth/...
app.use("/api/enrollments", enrollmentRoutes);  // Handles /api/enrollments/...
app.use("/api/uploads", uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/timeslots", timeSlotRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/courses", authRoutes); // Assuming this is for course-related routes
app.use("/api/notifications", notificationRoutes);

export default app;