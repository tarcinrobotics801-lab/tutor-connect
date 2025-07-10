import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, BarChart3, Calendar } from "lucide-react";
import Navigation from "@/components/Navigation";
import TutorDashboard from "@/components/TutorDashboard";
import TutorProfileForm from "@/components/TutorProfileForm";
import TutorBookingRequests from "@/components/TutorBookingRequests";
import { useApp } from "@/contexts/AppContext";

const TutorProfile = () => {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState(currentUser?.profileCompleted ? "dashboard" : "profile");

  if (!currentUser || currentUser.role !== 'tutor') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Access Denied</h3>
            <p className="text-gray-600">Please sign up as a tutor to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-lg bg-white/80 backdrop-blur-sm border border-purple-200">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
              disabled={!currentUser.profileCompleted}
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="requests" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
              disabled={!currentUser.profileCompleted}
            >
              <Calendar className="h-4 w-4" />
              Requests
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
            >
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-8">
            <TutorDashboard />
          </TabsContent>

          <TabsContent value="requests" className="mt-8">
            <TutorBookingRequests />
          </TabsContent>

          <TabsContent value="profile" className="mt-8">
            <TutorProfileForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TutorProfile;
