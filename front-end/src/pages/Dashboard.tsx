import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, GraduationCap, BookOpen, Calendar, Building2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useApp } from "@/contexts/AppContext";

const StudentDashboard = () => {
  const { currentUser } = useApp();
  console.log("Student enrolledCourses:", currentUser?.enrolledCourses);

  

  if (!currentUser || currentUser.role !== 'student') {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">Please log in as a student to access the dashboard.</p>
      </div>
    );
  }

  
  if (!currentUser.profileCompleted) {
    return (
      <div className="text-center py-12">
        <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">Complete Your Profile</h3>
        <p className="text-gray-600">Please complete your profile setup to access your dashboard.</p>
      </div>
    );
  }

  // Get data from student profile (from students collection)
  const studentName = currentUser.name || "";
  const studentEmail = currentUser.email || "";
  const studentPhone = currentUser.phoneNumber || "";
  const studentCity = currentUser.city || "";
  const studentState = currentUser.state || "";
  const studentCollege = currentUser.collegeName || "";
  const studentDepartment = currentUser.department || "";
  const studentYear = currentUser.yearOfStudent || 0;
  const enrolledCourses = currentUser.enrolledCourses || [];
  const profilePhoto = currentUser.photo || null;
  // Create charts data based on student information
  const profileCompletionData = [
    { name: 'Completed', value: 100, color: '#10B981' }
  ];

  const courseProgressData = [
    { name: 'Enrolled', courses: enrolledCourses.length },
    { name: 'Available', courses: Math.max(0, 10 - enrolledCourses.length) }
  ];

  const yearProgressData = [
    { year: 'Year 1', completed: studentYear >= 1 ? 100 : 0 },
    { year: 'Year 2', completed: studentYear >= 2 ? 100 : studentYear === 1 ? 50 : 0 },
    { year: 'Year 3', completed: studentYear >= 3 ? 100 : studentYear === 2 ? 50 : 0 },
    { year: 'Year 4', completed: studentYear >= 4 ? 100 : studentYear === 3 ? 25 : 0 }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {studentName}!</h1>
          <p className="text-gray-600 mt-2">Here's your academic profile and course enrollment overview.</p>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
           

          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{enrolledCourses.length}</div>
            <p className="text-xs text-blue-600">Active courses</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Academic Year/Grade</CardTitle>
            <GraduationCap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{studentYear}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Department</CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-purple-900">{studentDepartment || 'N/A'}  </div>
            <p className="text-xs text-purple-600">Study program</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Profile Status</CardTitle>
            <User className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-yellow-900">Complete</div>
            <p className="text-xs text-yellow-600">All fields filled</p>
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
                <p className="text-gray-900">{studentName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900 flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  {studentEmail}
                </p>
              </div>
              {studentPhone && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <p className="text-gray-900 flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    {studentPhone}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700">Location</label>
                <p className="text-gray-900 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  {studentCity}, {studentState}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">College / School Name</label>
                <p className="text-gray-900 flex items-center">
                  <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                  {studentCollege}
                </p>
              </div>
            </div>
            {currentUser.createdAt && (
              <div>
                <label className="text-sm font-medium text-gray-700">Member Since</label>
                <p className="text-gray-900 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  {formatDate(currentUser.createdAt)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enrolled Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              <span>Enrolled Courses</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {enrolledCourses.length > 0 ? (
              <div className="space-y-3">
                {enrolledCourses.map((course, index) => (
                  <div key={index} className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800">{course}</h4>
                        <p className="text-sm text-gray-600">Course {index + 1}</p>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                  </div>
                ))}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm font-semibold text-blue-600">
                    Total Enrolled: {enrolledCourses.length}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No courses enrolled yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profile Photo Display - if exists */}
      {profilePhoto && (
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
                src={profilePhoto} 
                alt="Profile" 
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Details */}
      
    </div>
  );
};

export default StudentDashboard;