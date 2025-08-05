import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Calendar, TrendingUp, Star, Clock, Video, MessageSquare, User, Award, MapPin, Phone, Mail, BookMarked, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useApp } from "@/contexts/AppContext";
import { useEffect } from "react";


const TutorDashboard = () => {
  const { currentUser, setCurrentUser } = useApp();

  if (!currentUser || currentUser.role !== 'tutor') {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">Please log in as a tutor to access the dashboard.</p>
      </div>
    );
  }

  if (!currentUser.profileCompleted) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">Complete Your Profile</h3>
        <p className="text-gray-600">Please complete your profile setup to access your dashboard and start teaching.</p>
      </div>
    );
  }

  // Get data from tutor profile
  const tutorSubjects = currentUser.subjects || [];
  const tutorBio = currentUser.bio || "";
  const tutorExperience = currentUser.yearsOfExperience || "0";
  const tutorEducation = currentUser.educationalQualification || "";
  const tutorAvailability = currentUser.availability || {};
  const tutorLinkedIn = currentUser.linkedinLink || "";
  const tutorCourses = currentUser.courseNames || [];
  const tutorPhoto = currentUser.photo || null;

  const handleDeleteCourse = async (courseName: string) => {
  try {
    const confirmed = window.confirm(`Are you sure you want to delete "${courseName}"?`);
    if (!confirmed) return;

    const cleanName = courseName.trim(); // remove extra whitespace
    const encodedName = encodeURIComponent(cleanName); // safely encode for URL

    const response = await fetch(`/api/courses/deleteByName/${encodedName}`, {
      method: "DELETE",
    });

    if (response.ok) {
      console.log("✅ Course deleted successfully");
      // Optional: remove from local state or refetch user data
    } else {
      console.error("❌ Failed to delete course");
    }
  } catch (error) {
    console.error("❌ Error deleting course", error);
  }
};







  // Helper function to check if a day is actually available
  const isActuallyAvailable = (dayData: any) => {
    return dayData?.available && Array.isArray(dayData.timeSlots) && dayData.timeSlots.length > 0;
  };


  // Create subject distribution data for chart
  const subjectChartData = tutorSubjects.map((subject, index) => ({
    subject: subject,
    value: 1,
    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'][index % 6]
  }));

  // Create experience level data - since experience is string, parse it
  const experienceYears = parseInt(tutorExperience) || 0;
  const experienceLevel = experienceYears >= 5 ? 'Expert' : experienceYears >= 2 ? 'Intermediate' : 'Beginner';

  // Create course levels based on subjects (mock data based on experience)
  const courseLevelData = tutorSubjects.length > 0 ? [
    {
      name: 'Beginner',
      value: experienceYears >= 1 ? Math.ceil(tutorSubjects.length * 0.4) : tutorSubjects.length,
      color: '#10B981'
    },
    {
      name: 'Intermediate',
      value: experienceYears >= 2 ? Math.ceil(tutorSubjects.length * 0.4) : 0,
      color: '#3B82F6'
    },
    {
      name: 'Advanced',
      value: experienceYears >= 5 ? Math.ceil(tutorSubjects.length * 0.2) : 0,
      color: '#F59E0B'
    }
  ].filter(item => item.value > 0) : [];

  // Calculate availability (count only actually available days)
  const availabilityEntries = Object.keys(tutorAvailability).filter(day =>
    isActuallyAvailable(tutorAvailability[day])
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {currentUser.name}!</h1>
          <p className="text-gray-600 mt-2">Here's your teaching profile overview and specializations.</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Teaching Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{tutorSubjects.length}</div>
            <p className="text-xs text-blue-600">Subject areas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Experience</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{tutorExperience}</div>
            <p className="text-xs text-green-600">Years experience</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Availability</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{availabilityEntries}</div>
            <p className="text-xs text-purple-600">Days available</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Teaching Level</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-yellow-900">{experienceLevel}</div>
            <p className="text-xs text-yellow-600">Based on experience</p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Information */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Personal Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <span>Profile Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <p className="text-gray-900">{currentUser.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900 flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  {currentUser.email}
                </p>
              </div>
              {currentUser.phoneNumber && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-gray-900 flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    {currentUser.phoneNumber}
                  </p>
                </div>
              )}
              {tutorEducation && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Education</label>
                  <p className="text-gray-900">{tutorEducation}</p>
                </div>
              )}
            </div>

            {tutorBio && (
              <div>
                <label className="text-sm font-medium text-gray-700">Bio</label>
                <p className="text-gray-900 mt-1">{tutorBio}</p>
              </div>
            )}

            {tutorLinkedIn && (
              <div>
                <label className="text-sm font-medium text-gray-700">LinkedIn Profile</label>
                <a href={tutorLinkedIn} target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View LinkedIn Profile
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subjects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              <span>Teaching Subjects</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tutorSubjects.length > 0 ? (
              <div className="space-y-2">
                {tutorSubjects.map((subject, index) => (
                  <Badge key={index} variant="secondary" className="mr-2 mb-2">
                    {subject}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No subjects added yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row - Only show if there are subjects */}
      {tutorSubjects.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Subject Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>Subject Specializations</span>
              </CardTitle>
              <CardDescription>Your teaching subject areas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={subjectChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    dataKey="value"
                    label={({ subject }) => subject}
                  >
                    {subjectChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>



          <Card>
  <CardHeader>
    <CardTitle className="flex items-center space-x-2">
      <BookMarked className="h-5 w-5 text-purple-600" />
      <span>Your Courses</span>
    </CardTitle>
  </CardHeader>

  <CardContent>
    {tutorCourses.length > 0 ? (
      <div className="space-y-3">
        {tutorCourses.map((courseName, index) => (
          <div
            key={`${courseName}-${index}`}
            className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border-l-4 border-purple-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-800">{courseName}</h4>
                <p className="text-sm text-gray-600">Course {index + 1}</p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteCourse(courseName)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ))}

        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
          <p className="text-sm font-semibold text-purple-600">
            Total Courses: {tutorCourses.length}
          </p>
        </div>
      </div>
    ) : (
      <div className="text-center py-8">
        <BookMarked className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">You haven’t added any courses yet</p>
      </div>
    )}
  </CardContent>
</Card>



        </div>
      )}

      {/* Availability Schedule - Only show if availability data exists */}
      {Object.keys(tutorAvailability).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span>Weekly Availability</span>
            </CardTitle>
            <CardDescription>Your teaching schedule preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">{['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
              const dayKey = day.toLowerCase();
              const dayData = tutorAvailability[dayKey]; // Ex: { available: true, timeSlots: [...] }
              const isAvailable = isActuallyAvailable(dayData);
              const timeSlots = dayData?.timeSlots || [];

              return (
                <div key={day} className={`p-3 rounded-lg text-center border ${isAvailable
                  ? 'bg-green-100 border-green-200'
                  : 'bg-red-100 border-red-200'
                  }`}>
                  <div className="font-medium text-sm">{day.slice(0, 3)}</div>

                  {timeSlots.length > 0 && (
                    <div className="text-xs text-gray-600 mt-1">
                      {timeSlots.join(", ")}
                    </div>
                  )}

                  <div className={`text-xs mt-1 ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                    {isAvailable ? 'Available' : 'Unavailable'}
                  </div>
                </div>
              );
            })}

            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Photo Display - if exists */}
      {tutorPhoto && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-indigo-600" />
              <span>Profile Photo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <img
                src={tutorPhoto}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State for Missing Information */}
      {tutorSubjects.length === 0 && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Complete Your Teaching Profile</h3>
            <p className="text-gray-600 mb-4">
              Add your subjects, experience, and availability to make your profile more attractive to students.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <User className="h-4 w-4 mr-2" />
              Update Profile
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TutorDashboard;