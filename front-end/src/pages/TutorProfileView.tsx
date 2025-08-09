import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, LinkIcon, Star, Calendar, ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import CustomLoader from "@/components/CustomLoader";

const TutorProfileView = () => {
  const { tutorId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const { toast } = useToast();
  const [tutor, setTutor] = useState<any>(null);
  const [loading, setLoading] = useState(true); // ⬅️ ADD THIS


  useEffect(() => {
    if (!tutorId) return;

    const fetchTutor = async () => {
      setLoading(true); // ✅ start loading
      try {
        const res = await fetch(`/api/auth/tutor/${tutorId}`);
        const data = await res.json();
        setTutor(data.tutor);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false); // ✅ only run this after fetch completes
      }
    };

    fetchTutor();
  }, [tutorId]);

  if (loading) {
    return <CustomLoader />; // ✅ Use CustomLoader component
  }

  if (!tutor) {
    return (
      <div className="bg-purple-600 text-white py-2 text-center text-sm relative z-10">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Tutor Not Found</h3>
            <p className="text-gray-600">The tutor profile you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/tutors')} className="mt-4">
              Back to Tutors
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Button
          onClick={() => navigate('/Courses')}
          variant="ghost"
          className="mb-6 text-purple-600 hover:text-purple-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
              <CardHeader className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  {tutor.photo ? (
                    <img
                      src={tutor.photo}
                      alt={tutor.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-purple-200"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center border-4 border-blue-200">
                      <User className="h-16 w-16 text-white" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                </div>
                <CardTitle className="text-2xl text-gray-900">{tutor.name}</CardTitle>
                <CardDescription className="text-purple-600 font-medium text-lg">
                  {tutor.educationalQualification}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{tutor.yearsOfExperience} experience</span>
                </div>

                {tutor.gradeOrYear && (
    <div className="text-center text-sm text-gray-700">
      <strong>Grade/Year:</strong> {tutor.gradeOrYear}
    </div>
  )}

  {tutor.educationBoard && (
    <div className="text-center text-sm text-gray-700">
      <strong>Education Board:</strong> {tutor.educationBoard}
    </div>
  )}


                {tutor.linkedinLink && (
                  <div className="flex items-center space-x-3">
                    <LinkIcon className="h-4 w-4 text-gray-400" />
                    <a
                      href={
                        tutor.linkedinLink.startsWith("http")
                          ? tutor.linkedinLink
                          : `https://${tutor.linkedinLink}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 underline break-all"
                    >
                      {tutor.linkedinLink}
                    </a>
                  </div>
                )}


                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Subjects:</p>
                  <div className="flex flex-wrap gap-1">
                    {tutor.subjects?.map((subject) => (
                      <Badge
                        key={subject}
                        variant="secondary"
                        className="bg-purple-100 text-purple-700 hover:bg-purple-200"
                      >
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{tutor.bio}</p>
              </CardContent>
            </Card>

            {/* Availability */}
            <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Availability</span>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {days.map((day) => (
                    <div key={day} className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                      <span className="capitalize font-medium text-gray-900">{day}</span>
                      <span className="text-sm text-gray-600">
                        {tutor.availability?.[day as keyof typeof tutor.availability]?.available
                          ? tutor.availability?.[day as keyof typeof tutor.availability]?.timeSlots.join(", ") || "Available"
                          : "Not Available"}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorProfileView;