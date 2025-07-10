import { useApp } from "@/contexts/AppContext";
import { User } from "lucide-react";
import Navigation from "@/components/Navigation";
import ParentProfileForm from "@/components/ParentProfileForm";

const ParentProfile = () => {
  const { currentUser } = useApp();

  if (!currentUser || currentUser.role !== 'parent') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Access Denied</h3>
            <p className="text-gray-600">Please sign up as a parent to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <ParentProfileForm />
    </div>
  );
};

export default ParentProfile;
