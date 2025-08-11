import { useState, useEffect } from "react";
import {useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { useApp } from "@/contexts/AppContext";
import { BookOpen, Upload, Search, User, Calendar, ExternalLink, Filter } from "lucide-react";
import ResourceUpload from "@/components/ResourceUpload";

const Resources = () => {
  const { currentUser } = useApp(); // Get logged-in user
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedClass, setSelectedClass] = useState("All");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch("/api/resources");
        const data = await res.json();
        setResources(data);
      } catch (err) {
        console.error("Failed to fetch resources:", err);
      }
    };

    // Only fetch resources if user is logged in
    if (currentUser) {
      fetchResources();
    }
  }, [currentUser]);

  // If user is not logged in, show login prompt
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              {/* User icon */}
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <User className="h-12 w-12 text-red-500" />
              </div>
              
              {/* Login message */}
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Please Login
              </h2>
              
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                You need to be logged in to view and access learning resources.
              </p>
              {/* Login button */}
              <Button
              onClick={() => navigate("/login")}
              className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600"
            >
              Login Now
            </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const subjects = ["All", ...new Set(resources.map(r => r.subject))];
  const classes = ["All", ...new Set(resources.map(r => r.className))];

  const filteredResources = resources.filter(resource => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tutorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubject = selectedSubject === "All" || resource.subject === selectedSubject;
    const matchesClass = selectedClass === "All" || resource.className === selectedClass;

    return matchesSearch && matchesSubject && matchesClass;
  });

  const isTutor = currentUser?.role === "tutor";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-purple-600" />
              Free Notes Library For Student 
            </h1>
            <p className="text-gray-600 mt-2">
              {isTutor
                ? "Share your teaching materials with students"
                : "Access educational Notes and materials shared by expert tutors"}
            </p>
          </div>

          {isTutor && (
            <Button
              onClick={() => setShowUploadModal(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Resource
            </Button>
          )}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search resources by title, description, or tutor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white"
            >
              {classes.map(className => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>
          </div>
        </div>


        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.length > 0 ? (
            filteredResources.map((resource) => (
              <Card key={resource._id || resource.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{resource.title}</CardTitle>
                      <div className="flex gap-2 mb-3">
                        <Badge variant="secondary">{resource.subject}</Badge>
                        <Badge variant="outline">{resource.className}</Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-sm">
                    {resource.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span>By {resource.tutorName}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Uploaded {new Date(resource.uploadedAt).toLocaleDateString()}</span>
                    </div>

                    {resource.contents && (
                      <div className="text-sm text-gray-700 mt-2">
                        <p className="font-semibold">Topics Covered:</p>
                        <p>{resource.contents}</p>
                      </div>
                    )}

                    <div className="pt-2">
                      <Button
                        onClick={() => window.open(resource.driveUrl, "_blank")}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        size="sm"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Access Notes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedSubject !== "All" || selectedClass !== "All"
                  ? "Try adjusting your search criteria"
                  : "No resources have been uploaded yet"}
              </p>
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Upload Learning Resource</h2>
                  <Button variant="outline" size="sm" onClick={() => setShowUploadModal(false)}>×</Button>
                </div>
                <ResourceUpload
                  onUpload={() => setShowUploadModal(false)}
                  tutorId={currentUser?._id || ""}
                  tutorName={currentUser?.name || ""}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;