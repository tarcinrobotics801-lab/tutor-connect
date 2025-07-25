import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Tutors from "./pages/Tutors";
import TutorProfile from "./pages/TutorProfile";
import TutorProfileView from "./pages/TutorProfileView";
import Resources from "./pages/Resources";
import NotFound from "./pages/NotFound";
import StudentProfile from "./pages/StudentProfile";
import ParentProfile from "./pages/ParentProfile";
import AdminDashboard from "./pages/AdminDashboard";
import ExpertTutors from "./pages/ExpertTutors";
import ExpertTutorsProfileView from "./pages/ExpertTutorsProfileView";

const queryClient = new QueryClient();
const App = () => (
   
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/student-profile" element={<StudentProfile />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/tutors" element={<Tutors />} />
            <Route path="/tutor/:tutorId" element={<TutorProfileView />} />
            <Route path="/tutor-profile" element={<TutorProfile />}/>
            <Route path="/resources" element={<Resources />} />
            <Route path="/parent-profile" element={<ParentProfile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/ExpertTutors" element={<ExpertTutors />} />
            <Route path="/ExpertTutors/:tutorId" element={<ExpertTutorsProfileView />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;