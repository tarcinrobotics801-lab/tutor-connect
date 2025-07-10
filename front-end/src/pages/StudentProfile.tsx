import { useState } from "react";
import { User, BarChart3 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StudentProfileForm from "@/components/StudentProfileForm";
import StudentDashboard from "@/pages/Dashboard"; // You must create this component
import { useApp } from "@/contexts/AppContext";

const StudentProfile = () => {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState(currentUser?.profileCompleted ? "dashboard" : "profile");

  if (!currentUser || currentUser.role !== "student") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Access Denied</h3>
            <p className="text-gray-600">Please sign up as a student to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md bg-white/80 backdrop-blur-sm border border-blue-200">
            <TabsTrigger
              value="dashboard"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
              disabled={!currentUser.profileCompleted}
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              <User className="h-4 w-4" />
              Profile Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-8">
            <StudentDashboard />
          </TabsContent>

          <TabsContent value="profile" className="mt-8">
            <StudentProfileForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentProfile;
