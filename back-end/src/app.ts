import express from "express";
import cors from "cors";

// Import your route files
import authRoutes from "./routes/auth.routes";
import enrollmentRoutes from "./routes/enrollment.routes";
import uploadRoutes from "./routes/upload.routes";

const app = express();

// Enable CORS for frontend (adjust origin if needed)
app.use(cors({
  origin: "http://localhost:8080",  // your frontend origin
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Mount your routes
app.use("/api/auth", authRoutes);               // Handles /api/auth/...
app.use("/api/enrollments", enrollmentRoutes);  // Handles /api/enrollments/...
app.use("/api/uploads", uploadRoutes);
app.use("/uploads", express.static("uploads"));
export default app;

