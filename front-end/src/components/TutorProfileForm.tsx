import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, Book, Award, Calendar, Link as LinkIcon, Save, Upload, Plus, AlertCircle, RefreshCw, FileText, ExternalLink, Trash2, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import CertificateUpload from "@/components/CertificateUpload";
import AchievementUpload from "@/components/AchievementUpload";
// Error handling types
interface ApiError {
  message: string;
  code?: string;
  type: 'network' | 'validation' | 'server' | 'unknown';
  details?: unknown;
}

const uploadImageToBackend = async (file: File, tutorId: string): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append("photo", file);

    const res = await fetch(`http://localhost:5000/api/uploads/tutor-photo/${tutorId}`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");

    const data = await res.json();
    return data.photoUrl;
  } catch (err) {
    console.error("Upload error:", err);
    return null;
  }
};
const TutorProfileForm = () => {
  const { currentUser, updateUser, addCourse } = useApp();
  const [addedCourses, setAddedCourses] = useState<unknown[]>([]);
  const [isEditing, setIsEditing] = useState(!currentUser?.profileCompleted);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Loading and error states
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Updated profile data structure to match backend expectations
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phoneNumber: currentUser?.phoneNumber || "",
    bio: currentUser?.bio || "",
    educationalQualification: currentUser?.educationalQualification || "",
    yearsOfExperience: currentUser?.yearsOfExperience || "",
    subjects: currentUser?.subjects || [],
    availability: currentUser?.availability || {
      monday: { available: false, timeSlots: [] },
      tuesday: { available: false, timeSlots: [] },
      wednesday: { available: false, timeSlots: [] },
      thursday: { available: false, timeSlots: [] },
      friday: { available: false, timeSlots: [] },
      saturday: { available: false, timeSlots: [] },
      sunday: { available: false, timeSlots: [] },
    },

    linkedinLink: currentUser?.linkedinLink || "",
    photo: currentUser?.photo || null,
    certificates: currentUser?.certificates || [], // ⭐ ADDED from 2nd code
    achievements: currentUser?.achievements || []
  });

  // Course structure matching backend expectations - FIXED FIELD NAMES
  const [newCourse, setNewCourse] = useState({
    courseName: "", // Changed from 'title' to 'courseName'
    description: "",
    sub: "",
    level: "",
    pricePerSession: 0, // Changed from 'price' to 'pricePerSession'
    sessionTime: "",
    tag: [] as string[],// Changed from 'tags' to 'tag'
    demoLink: "",           // NEW
  });

  const [newTag, setNewTag] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Network status monitoring
  useState(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });

  const handleInputChange = (field: string, value: unknown) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: "" }));
    }
    // Clear general error
    if (error) setError(null);
  };



  // ⭐ ADDED Certificate handlers from 2nd code
  const handleCertificateUpload = (certificate: { name: string; url: string; uploadedAt: string }) => {
    setProfileData(prev => ({
      ...prev,
      certificates: [...prev.certificates, certificate]
    }));

    toast({
      title: "Certificate Uploaded",
      description: "Your certificate has been uploaded successfully.",
    });
  };
  const handleAchievementUpload = (achievement: { name: string; url: string; uploadedAt: string; type: string }) => {
    setProfileData(prev => ({
      ...prev,
      achievements: [...prev.achievements, achievement]
    }));

    toast({
      title: "Achievement Uploaded",
      description: "Your achievement certificate has been uploaded successfully.",
    });
  };

  const handleRemoveCertificate = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index)
    }));

    toast({
      title: "Certificate Removed",
      description: "Certificate has been removed from your profile.",
    });
  };

  const handleRemoveAchievement = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));

    toast({
      title: "Achievement Removed",
      description: "Achievement has been removed from your profile.",
    });
  };

  // Validation functions updated to match backend field names
  const validateField = (field: string, value: unknown): string | null => {
    switch (field) {
      case 'educationalQualification':
        return !value || !(value as string).trim() ? 'Educational qualification is required' : null;
      case 'yearsOfExperience':
        return !value || !(value as string).trim() ? 'Years of experience is required' : null;
      case 'linkedinLink': {
        if (typeof value !== "string" || !value.trim()) {
          return 'LinkedIn link is required';
        }
        const linkStr = value.trim();
        // Strict LinkedIn URL regex
        const LINKEDIN_REGEX = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_.]+\/?(\?.*)?$/i;
        if (!LINKEDIN_REGEX.test(linkStr)) {
          return 'Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/yourname)';
        }
        return null;
      }
      case 'bio': {
        if (typeof value !== "string" || !value.trim()) {
          return 'Bio is required';
        }
        const wordCount = value.trim().split(/\s+/).length;
        if (wordCount < 50) {
          return 'Bio must be at least 50 words long';
        }
        return null;
      }
      case 'subjects':
        return !value || !(value as string[]).length ? 'At least one subject is required' : null;
      case "availability": {
        const avail = value as typeof profileData.availability;

        console.log("🔍 Availability validation input:", avail);

        if (!avail || typeof avail !== "object") {
          return "Availability is required.";
        }
        const hasValidDay = Object.values(avail).some(
          (day) =>
            day?.available === true &&
            Array.isArray(day.timeSlots) &&
            day.timeSlots.length > 0
        );
        if (!hasValidDay) {
          return "You must be available at least one day with time slots.";
        }
        return null;
      }
      case 'certificates': // ⭐ ADDED certificate validation
        return !value || !(value as unknown[]).length ? 'At least one certificate is required' : null;
      default:
        return null;
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const fieldsToValidate = ['educationalQualification', 'yearsOfExperience', 'linkedinLink', 'bio', 'subjects', 'certificates', 'availability']; // ⭐ ADDED certificates

    fieldsToValidate.forEach(field => {
      const error = validateField(field, profileData[field as keyof typeof profileData]);
      if (error) errors[field] = error;
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Profile completion logic updated with correct field names
  const isProfileComplete = () => {
    return (
      profileData.name.trim() !== "" &&
      profileData.bio.trim() !== "" &&
      profileData.educationalQualification.trim() !== "" &&
      profileData.yearsOfExperience.trim() !== "" &&
      profileData.linkedinLink.trim() !== "" &&
      profileData.subjects.length > 0 &&
      profileData.certificates.length > 0 // ⭐ ADDED certificate requirement
      // Note: photo is NOT required for completion
    );
  };

  const handleApiError = (error: unknown): ApiError => {
    if (!navigator.onLine) {
      return { message: 'No internet connection. Please check your network.', type: 'network' };
    }

    const err = error as { response?: { status?: number; data?: unknown }; message?: string };

    if (err.response?.status === 400) {
      return {
        message: 'Invalid data provided. Please check your inputs.',
        type: 'validation',
        code: '400',
        details: err.response.data
      };
    }

    if (err.response?.status === 401) {
      return { message: 'Session expired. Please log in again.', type: 'server', code: '401' };
    }

    if (err.response?.status && err.response.status >= 500) {
      return {
        message: 'Server error. Please try again later.',
        type: 'server',
        code: err.response.status.toString()
      };
    }

    return {
      message: err.message || 'An unexpected error occurred. Please try again.',
      type: 'unknown',
      details: error
    };
  };

  // Fixed: Use only _id property consistently
  const handleSave = async () => {
    if (!currentUser) {
      setError({ message: 'User session not found. Please log in again.', type: 'validation' });
      return;
    }

    // Use only _id property
    const userId = currentUser._id;

    if (!userId) {
      setError({ message: 'User ID not found. Please log in again.', type: 'validation' });
      return;
    }

    const requiredFields = [
      'educationalQualification',
      'yearsOfExperience',
      'linkedinLink',
      'bio',
    ];

    const missingFields = requiredFields.filter(field => {
      const value = profileData[field as keyof typeof profileData];
      return !value || value.toString().trim() === "";
    });

    // ⭐ UPDATED validation to include certificates
    if (missingFields.length > 0 || profileData.subjects.length === 0 || profileData.certificates.length === 0) {
      toast({
        title: "Profile Incomplete",
        description: "Please complete all fields, add at least one subject, and upload at least one certificate.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Send data with field names matching backend expectations
      const response = await fetch(`/api/auth/tutor/${userId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          educationalQualification: profileData.educationalQualification,
          yearsOfExperience: profileData.yearsOfExperience,
          linkedinLink: profileData.linkedinLink,
          bio: profileData.bio,
          availability: profileData.availability,
          subjects: profileData.subjects,
          certificates: profileData.certificates, // ⭐ ADDED certificates to payload
          achievements: profileData.achievements, // NEW: achievements
          photo: profileData.photo,
        }),
      });

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Server Error');
      }

      // Update user with _id
      updateUser(userId, data.user);
      console.log("Updated User ID:", userId);
      setIsEditing(false);

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

      if (!currentUser.profileCompleted) {
        setTimeout(() => navigate("/tutor-profile"), 1000);
      }

    } catch (err: unknown) {
      const apiError = handleApiError(err);
      setError(apiError);

      toast({
        title: "Update failed",
        description: apiError.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSubject = (subject: string) => {
    if (!profileData.subjects.includes(subject)) {
      setProfileData(prev => ({
        ...prev,
        subjects: [...prev.subjects, subject]
      }));
    }
  };

  const handleRemoveSubject = (subject: string) => {
    setProfileData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s !== subject)
    }));
  };

  const handleAddTag = () => {
    if (newTag && !newCourse.tag.includes(newTag)) {
      setNewCourse(prev => ({
        ...prev,
        tag: [...prev.tag, newTag] // Using 'tag' instead of 'tags'
      }));
      setNewTag("");
    }
  };
  const YOUTUBE_REGEX =
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}$/;

  // Fixed: Use only _id property and correct field names for course
  const handleAddCourse = async () => {
    if (!currentUser || !newCourse.courseName || !newCourse.sub) {
      toast({
        title: "Course Incomplete",
        description: "Please fill in course name and subject.",
        variant: "destructive"
      });
      return;
    }
    if (!newCourse.level) {
      toast({
        title: "Course Incomplete",
        description: "Please select a difficulty level.",
        variant: "destructive"
      });
      return;
    }

    if (!newCourse.description.trim()) {
      toast({
        title: "Course Incomplete",
        description: "Course description is required.",
        variant: "destructive"
      });
      return;
    }

    if (
      newCourse.pricePerSession === null ||
      newCourse.pricePerSession === undefined ||
      isNaN(newCourse.pricePerSession) ||
      newCourse.pricePerSession < 0
    ) {
      toast({
        title: "Course Incomplete",
        description: "Price per session must be 0 (free) or a positive number.",
        variant: "destructive"
      });
      return;
    }

    if (newCourse.tag.length === 0) {
      toast({
        title: "Course Incomplete",
        description: "At least one tag is required.",
        variant: "destructive"
      });
      return;
    }

    if (!newCourse.demoLink.trim() || !YOUTUBE_REGEX.test(newCourse.demoLink)) {
      toast({
        title: "Course Incomplete",
        description: "A valid YouTube demo link is required.",
        variant: "destructive"
      });
      return;
    }

    const userId = currentUser._id;

    const course = {
      courseName: newCourse.courseName,
      description: newCourse.description,
      sub: newCourse.sub,
      level: newCourse.level,
      pricePerSession: newCourse.pricePerSession,
      sessionTime: newCourse.sessionTime,
      tag: newCourse.tag,
      demoLink: newCourse.demoLink,
      tutorId: userId,
      tutorName: currentUser.name,
    };

    try {
      const res = await fetch("/api/auth/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(course),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add course.");
      }

      // Add to local state only after backend confirms save
      setAddedCourses(prev => [...prev, data.course]);

      // Reset course form
      setNewCourse({
        courseName: "",
        description: "",
        sub: "",
        level: "",
        pricePerSession: 0,
        sessionTime: "",
        tag: [],
        demoLink: ""
      });

      toast({
        title: "Course Added",
        description: "Your course has been saved to the system.",
      });
    } catch (err: any) {
      toast({
        title: "Failed to add course",
        description: err.message || "An error occurred",
        variant: "destructive",
      });
    }
  };
  const ErrorAlert = ({ error, onRetry }: { error: ApiError; onRetry?: () => void }) => (
    <div className={`p-4 rounded-lg mb-4 ${error.type === 'network' ? 'bg-orange-50 border border-orange-200' :
      error.type === 'validation' ? 'bg-yellow-50 border border-yellow-200' :
        'bg-red-50 border border-red-200'
      }`}>
      <div className="flex items-start">
        <AlertCircle className={`w-5 h-5 mt-0.5 mr-3 ${error.type === 'network' ? 'text-orange-500' :
          error.type === 'validation' ? 'text-yellow-500' :
            'text-red-500'
          }`} />
        <div className="flex-1">
          <p className="font-medium text-gray-900">{error.message}</p>
          {error.code && <p className="text-sm text-gray-600 mt-1">Error code: {error.code}</p>}
          <div className="flex gap-2 mt-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Retry
              </button>
            )}
            <button
              onClick={() => setError(null)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const availableSubjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "History", "Computer Science", "Economics"];
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Network Status Warning */}
      {!isOnline && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex items-center text-red-700">
            <AlertCircle className="w-5 h-5 mr-2" />
            You're currently offline. Changes cannot be saved until connection is restored.
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && <ErrorAlert error={error} onRetry={handleSave} />}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">
            {currentUser?.profileCompleted
              ? "Your profile is complete and visible to students."
              : "Complete your profile to start receiving bookings. All fields except photo are required."
            }
          </p>
        </div>
        <Button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isSaving || !isOnline}
        >
          {isSaving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          ) : (
            "Edit Profile"
          )}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Picture and Basic Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="relative w-32 h-32 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4 overflow-hidden">
                {profileData.photo ? (
                  <img src={profileData.photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-16 w-16 text-blue-600" />
                )}
                {isEditing && (
                  <Button
                    size="sm"
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full p-0"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !currentUser?._id) return;

                  // 1. Local preview
                  const preview = URL.createObjectURL(file);
                  handleInputChange("photo", preview);

                  // 2. Upload to Cloudinary via backend
                  const permanentUrl = await uploadImageToBackend(file, currentUser._id);
                  if (permanentUrl) {
                    handleInputChange("photo", permanentUrl);
                  } else {
                    toast({
                      title: "Upload failed",
                      description: "Could not save photo. Please try again.",
                      variant: "destructive",
                    });
                  }
                }}
              />
              <CardTitle>{profileData.name}</CardTitle>
              <CardDescription>
                {profileData.educationalQualification || "Add your qualification"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{profileData.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{profileData.phoneNumber || "Not provided"}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Award className="h-4 w-4 text-gray-400" />
                <span className="text-sm">
                  {profileData.yearsOfExperience ? `${profileData.yearsOfExperience} experience ` : "Experience not added"}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <LinkIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-blue-600 truncate">
                  {profileData.linkedinLink || "LinkedIn link not added"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Book className="h-5 w-5" />
                <span>Subjects</span>
                {fieldErrors.subjects && <span className="text-red-500">*</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profileData.subjects.map((subject) => (
                  <Badge key={subject} variant="secondary" className="relative group">
                    {subject}
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveSubject(subject)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
              {fieldErrors.subjects && (
                <p className="text-red-500 text-sm mt-2">{fieldErrors.subjects}</p>
              )}
              {isEditing && (
                <Select onValueChange={handleAddSubject}>
                  <SelectTrigger className="mt-3">
                    <SelectValue placeholder="Add subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {availableSubjects
                      .filter(subject => !profileData.subjects.includes(subject))
                      .map(subject => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {/* ⭐ ADDED Certificates Section from 2nd code */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Certificates</span>
                {fieldErrors.certificates && <span className="text-red-500">*</span>}
              </CardTitle>
              <CardDescription>
                Upload your degree certificates to verify qualifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileData.certificates.length > 0 && (
                <div className="space-y-3">
                  {profileData.certificates.map((cert: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">{cert.name}</p>
                          <p className="text-xs text-gray-500">
                            Uploaded on {new Date(cert.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(cert.url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                        {isEditing && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveCertificate(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isEditing && (
                <CertificateUpload onUpload={handleCertificateUpload} />
              )}

              {profileData.certificates.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No certificates uploaded yet</p>
                  {!isEditing && (
                    <p className="text-xs mt-1">Enable editing to upload certificates</p>
                  )}
                </div>
              )}

              {fieldErrors.certificates && (
                <p className="text-red-500 text-sm mt-2">{fieldErrors.certificates}</p>
              )}
            </CardContent>
          </Card>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Achievement Certificates</span>
              </CardTitle>
              <CardDescription>
                Upload NPTEL courses and other achievement certificates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileData.achievements.length > 0 && (
                <div className="space-y-3">
                  {profileData.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Trophy className="h-4 w-4 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium">{achievement.name}</p>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {achievement.type}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            Uploaded on {new Date(achievement.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(achievement.url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                        {isEditing && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveAchievement(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isEditing && (
                <AchievementUpload onUpload={handleAchievementUpload} />
              )}

              {profileData.achievements.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No achievement certificates uploaded yet</p>
                  {!isEditing && (
                    <p className="text-xs mt-1">Enable editing to upload achievements</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>


        {/* Main Profile Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Your public profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="qualification">
                  Educational Qualification <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="qualification"
                  value={profileData.educationalQualification}
                  onChange={(e) => handleInputChange("educationalQualification", e.target.value)}
                  disabled={!isEditing}
                  placeholder="e.g., Ph.D. in Mathematics, Harvard University"
                  className={fieldErrors.educationalQualification ? 'border-red-500' : ''}
                />
                {fieldErrors.educationalQualification && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.educationalQualification}</p>
                )}
              </div>

              <div>
                <Label htmlFor="experience">
                  Years of Experience <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="experience"
                  value={profileData.yearsOfExperience}
                  onChange={(e) => handleInputChange("yearsOfExperience", e.target.value)}
                  disabled={!isEditing}
                  placeholder="e.g., 5+ years"
                  className={fieldErrors.yearsOfExperience ? 'border-red-500' : ''}
                />
                {fieldErrors.yearsOfExperience && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.yearsOfExperience}</p>
                )}
              </div>

              <div>
                <Label htmlFor="linkedin">
                  LinkedIn Link <span className="text-red-500">*</span>
                </Label>
                <Input

                  id="linkedin"
                  value={profileData.linkedinLink}
                  onChange={(e) => handleInputChange("linkedinLink", e.target.value)}
                  disabled={!isEditing}
                  placeholder="https://www.linkedin.com/in/your-profile"
                  className={fieldErrors.linkedinLink ? 'border-red-500' : ''}
                />
                {fieldErrors.linkedinLink && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.linkedinLink}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle>
                Bio <span className="text-red-500">*</span>
              </CardTitle>
              <CardDescription>Tell students about yourself and your teaching approach (minimum 50 words)</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={profileData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                disabled={!isEditing}
                placeholder="Describe your teaching experience, methodology, and what makes you passionate about education..."
                rows={4}
                className={fieldErrors.bio ? 'border-red-500' : ''}
              />
              <div className="flex justify-between items-center mt-2">
                {fieldErrors.bio && (
                  <p className="text-red-500 text-sm">{fieldErrors.bio}</p>
                )}
                <p className="text-sm text-gray-500 ml-auto">
                  {profileData.bio.trim().split(/\s+/).filter(word => word.length > 0).length}/50 words minimum
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Availability</span>
              </CardTitle>
              <CardDescription>Set your weekly schedule for student bookings</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {Object.entries(profileData.availability).map(([day, data]) => (
                  <div key={day} className="grid grid-cols-4 gap-4 items-center">
                    {/* Day label */}
                    <Label className="capitalize font-medium">{day}</Label>

                    {/* Available checkbox */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={data.available}
                        disabled={!isEditing}
                        onChange={(e) => {
                          setProfileData((prev) => ({
                            ...prev,
                            availability: {
                              ...prev.availability,
                              [day]: {
                                ...prev.availability[day],
                                available: e.target.checked,
                              },
                            },
                          }));
                        }}
                      />
                      <span className="text-sm">Available</span>
                    </div>

                    {/* Time slots input */}
                    <input
                      type="text"
                      disabled={!isEditing}
                      placeholder="e.g., 10:00 AM, 2:00 PM"
                      value={data.timeSlots.join(", ")}
                      onChange={(e) => {
                        setProfileData((prev) => ({
                          ...prev,
                          availability: {
                            ...prev.availability,
                            [day]: {
                              ...prev.availability[day],
                              timeSlots: e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter((s) => s.length > 0),
                            },
                          },
                        }));
                      }}
                      className="col-span-2 border rounded px-2 py-1 text-sm"
                    />
                  </div>
                ))}
                {fieldErrors.availability && (
                  <p className="text-red-500 text-sm mt-2">{fieldErrors.availability}</p>
                )}
              </div>


            </CardContent>
          </Card>


          {/* Add Course Section */}
          {isProfileComplete() && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Course</CardTitle>
                <CardDescription>Create courses for students to enroll in</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="course-title">
                      Course Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="course-title"
                      value={newCourse.courseName}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, courseName: e.target.value }))}
                      placeholder="e.g., Advanced Mathematics"
                    />
                  </div>
                  <div>
                    <Label htmlFor="course-subject">
                      Subject <span className="text-red-500">*</span>
                    </Label>
                    <Select onValueChange={(value) => setNewCourse(prev => ({ ...prev, sub: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {availableSubjects.map(sub => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="course-level">Level</Label>
                    <Select onValueChange={(value) => setNewCourse(prev => ({ ...prev, level: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="course-price">Price per Session</Label>
                    <Input
                      id="course-price"
                      type="number"                            // 👈
                      min={0}
                      value={newCourse.pricePerSession}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, pricePerSession: Number(e.target.value), }))}
                      placeholder="0 = Free, 50 = ₹50 / session"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="session-time">Session Time</Label>
                  <Input
                    id="session-time"
                    value={newCourse.sessionTime}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, sessionTime: e.target.value }))}
                    placeholder="e.g., Monday 3:00 PM - 4:00 PM"
                  />
                </div>

                <div>
                  <Label htmlFor="course-description">Description</Label>
                  <Textarea
                    id="course-description"
                    value={newCourse.description}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what students will learn in this course..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newCourse.tag.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                        <button
                          onClick={() => setNewCourse(prev => ({
                            ...prev,
                            tag: prev.tag.filter(t => t !== tag)
                          }))}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <Button onClick={handleAddTag} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <Label htmlFor="course-demo">
                      Demo YouTube Link <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="course-demo"
                      value={newCourse.demoLink}
                      onChange={(e) =>
                        setNewCourse(prev => ({ ...prev, demoLink: e.target.value }))
                      }
                      placeholder="https://youtu.be/VIDEO_ID"
                    />
                  </div>
                </div>

                <Button onClick={handleAddCourse} className="w-full">
                  Add Course
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorProfileForm;