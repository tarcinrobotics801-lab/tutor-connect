import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Mail, Phone, Save, Upload, MapPin, GraduationCap} from "lucide-react";
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
  const { currentUser, updateUser } = useApp();
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

    if (!profileData.yearOfStudent  || !profileData.collegeName || !profileData.city || !profileData.state) {
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
      department: profileData.department || "", // Optional field
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
                        <Label htmlFor="yearOfStudent">Year of Study / Grade *</Label>
                        <Input
                          id="yearOfStudent"
                          value={profileData.yearOfStudent}
                          onChange={(e) => handleInputChange("yearOfStudent", e.target.value)}
                          placeholder="e.g. 2nd Year or 10th Grade"
                        />
                      </div>
                      <div>
                        <Label htmlFor="department">Department (Only for College Students)</Label>
                        <Input
                          id="department"
                          value={profileData.department}
                          onChange={(e) => handleInputChange("department", e.target.value)}
                          placeholder="e.g., Computer Science"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="collegeName">College / School Name *</Label>
                      <Input
                        id="collegeName"
                        value={profileData.collegeName}
                        onChange={(e) => handleInputChange("collegeName", e.target.value)}
                        placeholder="Enter your college (or school name if you're a school student)"
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
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - Profile card */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
              <CardHeader className="text-center">
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
                  {isEditing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full">
                      <div className="text-white text-center">
                        <Upload className="h-6 w-6 mx-auto mb-1" />
                        <span className="text-xs font-medium">Upload Photo</span>
                      </div>
                    </div>
                  )}
                </div>
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

          {/* Right column - Forms */}
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
                    <Label htmlFor="yearOfStudent">Year of Study / Grade *</Label>
                    <Input
                      id="yearOfStudent"
                      value={profileData.yearOfStudent}
                      onChange={(e) => handleInputChange("yearOfStudent", e.target.value)}
                      disabled={!isEditing}
                      placeholder="e.g. 2nd Year or 10th Grade"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department (Only for College Students)</Label>
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
                  <Label htmlFor="collegeName">College / School Name *</Label>
                  <Input
                    id="collegeName"
                    value={profileData.collegeName}
                    onChange={(e) => handleInputChange("collegeName", e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your college (or school name if you're a school student)"
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
      </div>
    </div>
  </div>
);
};
export default StudentProfileForm;