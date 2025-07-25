import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Mail, Phone, Save, Upload, MapPin, GraduationCap, Bell, Calendar, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";

const uploadStudentImage = async (file: File, studentId: string): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append("photo", file);

    const res = await fetch(`/api/uploads/student-photo/${studentId}`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.photoUrl;
  } catch (err) {
    console.error("Student photo upload error:", err);
    return null;
  }
};

const StudentProfileForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser, updateUser, getUserNotifications, markNotificationAsRead } = useApp();
  const { setCurrentUser } = useApp();
  const [isEditing, setIsEditing] = useState(!currentUser?.profileCompleted);
  const [activeTab, setActiveTab] = useState(currentUser?.profileCompleted ? "dashboard" : "profile");

  const [profileData, setProfileData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    yearOfStudent: currentUser?.yearOfStudent || "",
    department: currentUser?.department || "",
    collegeName: currentUser?.collegeName || "",
    city: currentUser?.city || "",
    state: currentUser?.state || "",
    phoneNumber: currentUser?.phoneNumber || "",
    photo: currentUser?.photo || null
  });

  const notifications = currentUser ? getUserNotifications(currentUser._id) : [];
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = async (file: File) => {
    if (!file || !currentUser?._id) return;

    // Show local preview immediately
    const previewUrl = URL.createObjectURL(file);
    setProfileData((prev) => ({ ...prev, photo: previewUrl }));

    // Upload to backend (Cloudinary)
    const permanentUrl = await uploadStudentImage(file, currentUser._id);
    if (permanentUrl) {
      setProfileData((prev) => ({ ...prev, photo: permanentUrl }));
    } else {
      toast({
        title: "Upload failed",
        description: "Could not save photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    // Add validation for currentUser and currentUser._id
    if (!currentUser) {
      toast({
        title: "Authentication Error",
        description: "Please log in to update your profile.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (!currentUser._id) {
      toast({
        title: "User ID Error",
        description: "User ID is missing. Please try logging in again.",
        variant: "destructive",
      });
      console.error("currentUser object:", currentUser);
      return;
    }

    // Validate required fields
    if (!profileData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!profileData.yearOfStudent || !profileData.department || !profileData.collegeName || !profileData.city || !profileData.state) {
      toast({
        title: "Validation Error",
        description: "All fields marked with * are required.",
        variant: "destructive",
      });
      return;
    }

    // Build the payload the backend expects
    const payload = {
      phoneNumber: profileData.phoneNumber,
      yearOfStudent: profileData.yearOfStudent,
      department: profileData.department,
      collegeName: profileData.collegeName,
      city: profileData.city,
      state: profileData.state,
      photo: profileData.photo || "", 
    };

    try {
      console.log("Making request with user _id:", currentUser._id);
      console.log("Request payload:", payload);

      const res = await fetch(
        `/api/auth/student/${currentUser._id}/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      console.log("Response status:", res.status, res.statusText);

      let data;
      try {
        data = await res.json();
        console.log("Response data:", data);
      } catch (jsonError) {
        console.error("Failed to parse JSON response:", jsonError);
        throw new Error(`Server returned ${res.status}: ${res.statusText}`);
      }

      
      if (!res.ok) {
        const errorMessage = data?.message || data?.error || `Server error: ${res.status} ${res.statusText}`;
        console.error("API Error Details:", {
          status: res.status,
          statusText: res.statusText,
          data: data
        });
        throw new Error(errorMessage);
      }

      // Check if the response has the expected structure
      if (!data || typeof data !== 'object') {
        console.error("Unexpected response format:", data);
        throw new Error("Invalid response format from server");
      }

      // Keep React state in sync - use _id consistently
      if (data.student) {
        updateUser(currentUser._id, {
          ...currentUser,
          ...data.student,
          profileCompleted: true,
        });
      } else {
        console.warn("No student data in response:", data);
        // Update with the payload data if server doesn't return student object
        updateUser(currentUser._id, {
          ...currentUser,
          ...payload,
          yearOfStudent: Number(profileData.yearOfStudent),
          profileCompleted: true,
        });
      }
      setCurrentUser(data.student); 

      toast({
        title: "Profile Saved",
        description: "Your student profile has been updated!",
      });
      setIsEditing(false);
    } catch (err: any) {
      console.error("Profile update error:", err);
      console.error("Error details:", {
        name: err.name,
        message: err.message,
        stack: err.stack
      });

      let errorMessage = "Failed to update profile";

      // Handle different types of errors
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (err.name === 'AbortError') {
        errorMessage = "Request timed out. Please try again.";
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.toString) {
        errorMessage = err.toString();
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_request':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'booking_accepted':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'booking_rejected':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notificationId: string) => {
    markNotificationAsRead(notificationId);
  };

  if (!currentUser?.profileCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
                <p className="text-gray-600 mt-2">
                  Complete your profile to access courses and book sessions.
                </p>
              </div>
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
                  <CardHeader className="text-center">
                    {/* Profile Photo Circle with Hover */}
                    <div 
                      className="relative w-32 h-32 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4 overflow-hidden group cursor-pointer"
                      onClick={() => document.getElementById('photo-upload-initial')?.click()}
                    >
                      {profileData.photo ? (
                        <img src={profileData.photo} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                          {profileData.name ? getInitials(profileData.name) : <User className="h-16 w-16" />}
                        </div>
                      )}
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full">
                        <div className="text-white text-center">
                          <Upload className="h-6 w-6 mx-auto mb-1" />
                          <span className="text-xs font-medium">Upload Photo</span>
                        </div>
                      </div>
                    </div>

                    {/* Hidden file input */}
                    <input
                      id="photo-upload-initial"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          await handlePhotoUpload(file);
                        }
                      }}
                    />

                    {/* Upload Photo Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                      onClick={() => document.getElementById('photo-upload-initial')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>

                    <CardTitle className="mt-4">{profileData.name}</CardTitle>
                    <CardDescription className="capitalize">Student</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{profileData.email}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{profileData.phoneNumber}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <GraduationCap className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{profileData.yearOfStudent} - {profileData.department}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{profileData.city}, {profileData.state}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Your basic profile information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          disabled={true}
                          className="bg-gray-100"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber">Contact Number *</Label>
                      <Input
                        id="phoneNumber"
                        value={profileData.phoneNumber}
                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                        placeholder="Enter your contact number"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
                  <CardHeader>
                    <CardTitle>Academic Information</CardTitle>
                    <CardDescription>Details about your education</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="yearOfStudent">Year of Study *</Label>
                        <Input
                          id="yearOfStudent"
                          value={profileData.yearOfStudent}
                          onChange={(e) => handleInputChange("yearOfStudent", e.target.value)}
                          placeholder="e.g., 2nd Year, Final Year"
                        />
                      </div>
                      <div>
                        <Label htmlFor="department">Department Name *</Label>
                        <Input
                          id="department"
                          value={profileData.department}
                          onChange={(e) => handleInputChange("department", e.target.value)}
                          placeholder="e.g., Computer Science"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="collegeName">College Name *</Label>
                      <Input
                        id="collegeName"
                        value={profileData.collegeName}
                        onChange={(e) => handleInputChange("collegeName", e.target.value)}
                        placeholder="Enter your college name"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
                  <CardHeader>
                    <CardTitle>Location Information</CardTitle>
                    <CardDescription>Your current location details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">Place/City *</Label>
                        <Input
                          id="city"
                          value={profileData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          placeholder="Enter your city"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          value={profileData.state}
                          onChange={(e) => handleInputChange("state", e.target.value)}
                          placeholder="Enter your state"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back, {currentUser.name}!</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md bg-white/80 backdrop-blur-sm border border-blue-200">
              <TabsTrigger
                value="dashboard"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
              >
                <User className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
              >
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
              >
                <Bell className="h-4 w-4" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-8">
              <Card className="shadow-xl border-blue-100 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Student Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-16">
                  <GraduationCap className="h-16 w-16 text-blue-400 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Welcome to Your Dashboard
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Your profile is complete! You can now browse courses and book sessions with tutors.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => navigate("/courses")} className="bg-blue-600 hover:bg-blue-700">
                      Browse Courses
                    </Button>
                    <Button onClick={() => navigate("/tutors")} variant="outline">
                      View Tutors
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="mt-8">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
                    <CardHeader className="text-center">
                      {/* Profile Photo Circle with Hover - Only show hover when editing */}
                      <div 
                        className={`relative w-32 h-32 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4 overflow-hidden ${isEditing ? 'group cursor-pointer' : ''}`}
                        onClick={() => isEditing ? document.getElementById('photo-upload-profile')?.click() : null}
                      >
                        {profileData.photo ? (
                          <img src={profileData.photo} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                            {profileData.name ? getInitials(profileData.name) : <User className="h-16 w-16" />}
                          </div>
                        )}
                        
                        {/* Hover overlay - only show when editing */}
                        {isEditing && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full">
                            <div className="text-white text-center">
                              <Upload className="h-6 w-6 mx-auto mb-1" />
                              <span className="text-xs font-medium">Upload Photo</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Hidden file input */}
                      <input
                        id="photo-upload-profile"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file && isEditing) {
                            await handlePhotoUpload(file);
                          }
                        }}
                      />

                      {/* Upload Photo button - only show when editing */}
                      {isEditing && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mb-4 text-blue-600 border-blue-200 hover:bg-blue-50"
                          onClick={() => document.getElementById('photo-upload-profile')?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Photo
                        </Button>
                      )}

                      <CardTitle>{profileData.name}</CardTitle>
                      <CardDescription className="capitalize">Student</CardDescription>
                      <Button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className="mt-4 bg-blue-600 hover:bg-blue-700"
                      >
                        {isEditing ? (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        ) : (
                          "Edit Profile"
                        )}
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{profileData.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{profileData.phoneNumber}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <GraduationCap className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{profileData.yearOfStudent} - {profileData.department}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{profileData.city}, {profileData.state}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Your basic profile information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            value={profileData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            disabled={!isEditing}
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            disabled={true}
                            className="bg-gray-100"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="phoneNumber">Contact Number *</Label>
                        <Input
                          id="phoneNumber"
                          value={profileData.phoneNumber}
                          onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter your contact number"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
                    <CardHeader>
                      <CardTitle>Academic Information</CardTitle>
                      <CardDescription>Details about your education</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="yearOfStudent">Year of Study *</Label>
                          <Input
                            id="yearOfStudent"
                            value={profileData.yearOfStudent}
                            onChange={(e) => handleInputChange("yearOfStudent", e.target.value)}
                            disabled={!isEditing}
                            placeholder="e.g., 2nd Year, Final Year"
                          />
                        </div>
                        <div>
                          <Label htmlFor="department">Department Name *</Label>
                          <Input
                            id="department"
                            value={profileData.department}
                            onChange={(e) => handleInputChange("department", e.target.value)}
                            disabled={!isEditing}
                            placeholder="e.g., Computer Science"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="collegeName">College Name *</Label>
                        <Input
                          id="collegeName"
                          value={profileData.collegeName}
                          onChange={(e) => handleInputChange("collegeName", e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter your college name"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
                    <CardHeader>
                      <CardTitle>Location Information</CardTitle>
                      <CardDescription>Your current location details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">Place/City *</Label>
                          <Input
                            id="city"
                            value={profileData.city}
                            onChange={(e) => handleInputChange("city", e.target.value)}
                            disabled={!isEditing}
                            placeholder="Enter your city"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State *</Label>
                          <Input
                            id="state"
                            value={profileData.state}
                            onChange={(e) => handleInputChange("state", e.target.value)}
                            disabled={!isEditing}
                            placeholder="Enter your state"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-8">
              <Card className="shadow-xl border-blue-100 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                    <Bell className="h-6 w-6" />
                    Notifications
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="h-6 w-6 flex items-center justify-center p-0 text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Stay updated with your booking requests and tutor responses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    {notifications.length === 0 ? (
                      <div className="text-center py-16 text-gray-500">
                        <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg">No notifications yet</p>
                        <p className="text-sm">You'll see updates here when tutors respond to your booking requests</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {notifications.map((notification) => {
  const urlMatch = notification.message.match(/https?:\/\/[^\s]+/);
  const meetingLink = urlMatch ? urlMatch[0] : null;

  return (
    <Card
      key={notification.id}
      className={`cursor-pointer hover:bg-gray-50 transition-colors ${
        !notification.read ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
      }`}
      onClick={() => handleNotificationClick(notification.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {getNotificationIcon(notification.type)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm text-gray-900">{notification.title}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-400">{formatDate(notification.createdAt)}</p>
                {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
              </div>
            </div>
            <div className="text-sm text-gray-600 mt-1 whitespace-pre-line">
  {notification.message}
</div>

            {meetingLink && (
              <Button
                size="sm"
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={(e) => {
                  e.stopPropagation(); // don’t trigger mark-as-read when clicking button
                  window.open(meetingLink, "_blank");
                }}
              >
                Join Meeting
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
})}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileForm;