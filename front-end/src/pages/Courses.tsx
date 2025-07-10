import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import BookingRequestDialog from "@/components/BookingRequestDialog";
import {
  User,
  Search,
  BookOpen,
  Clock,
  Calendar,
  DollarSign,
  PlayCircle,
  Star,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";

const getYouTubeEmbedUrl = (url: string): string => {
  if (!url) return "";
  // watch?v=VIDEO_ID → embed/VIDEO_ID
  if (url.includes("watch?v="))
    return url.replace("watch?v=", "embed/");
  // youtu.be/VIDEO_ID → youtube.com/embed/VIDEO_ID
  if (url.includes("youtu.be/"))
    return url.replace("youtu.be/", "youtube.com/embed/");
  return url; // assume it's already embed form
};

const Courses = () => {
  const { currentUser, addSession } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);

  /* ───────────────────────────────────────────────────
     Authentication and Profile Completion Guards
  ──────────────────────────────────────────────────── */
  
  // Check if user is not logged in
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Please Login</h3>
            <p className="text-gray-600">You need to be logged in to view and book courses.</p>
            <Button 
              onClick={() => navigate("/login")}
              className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600"
            >
              Login Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check if student hasn't completed profile
  if (currentUser.role === 'student' && !currentUser.profileCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Complete Your Profile</h3>
            <p className="text-gray-600 mb-4">Please complete your student profile to browse and book courses.</p>
            <Button 
              onClick={() => navigate("/student-profile")}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              Complete Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ───────────────────────────────────────────────────
     Fetch courses once on mount
  ──────────────────────────────────────────────────── */
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/auth/courses");
        const data = await response.json();
        if (response.ok) setCourses(data.courses);
        else console.error("Failed to fetch courses:", data.message);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  /* ───────────────────────────────────────────────────
     Get unique subjects for filter buttons
  ──────────────────────────────────────────────────── */
  const allSubjects = ["All", ...Array.from(new Set(courses.map(course => course.sub || "General")))];

  /* ───────────────────────────────────────────────────
     Enhanced search and subject filter
  ──────────────────────────────────────────────────── */
  const filteredCourses = courses.filter((course) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      (course.courseName?.toLowerCase() || "").includes(term) ||
      (course.sub?.toLowerCase() || "").includes(term) ||
      (course.description?.toLowerCase() || "").includes(term) ||
      (course.tutorId?.name?.toLowerCase() || "").includes(term)
    );

    const matchesSubject = selectedSubject === "All" || (course.sub || "General") === selectedSubject;

    return matchesSearch && matchesSubject;
  });

  /* ───────────────────────────────────────────────────
     Enhanced Book‑session handler with better notifications
  ──────────────────────────────────────────────────── */
  const handleBookSession = async (course: any) => {
    /* Enhanced guard rails with better user feedback */
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to book a session.",
        variant: "destructive",
      });
      return;
    }

    if (currentUser.role !== "student" && currentUser.role !== "parent") {
      toast({
        title: "Access Denied",
        description: "Only students and parents can book sessions.",
        variant: "destructive",
      });
      return;
    }

    if (currentUser.role === 'parent' && !currentUser.profileCompleted) {
      toast({
        title: "Complete Profile",
        description: "Please complete your parent profile before booking sessions.",
        variant: "destructive",
      });
      return;
    }

    if (currentUser.role === 'student' && !currentUser.profileCompleted) {
      toast({
        title: "Complete Profile",
        description: "Please complete your student profile before booking sessions.",
        variant: "destructive",
      });
      return;
    }

    /* Set selected course and open booking dialog */
    setSelectedCourse(course);
    setBookingDialogOpen(true);
  };

  /* ───────────────────────────────────────────────────
     JSX
  ──────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Heading */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Discover Amazing Courses
          </h1>
          <p className="text-gray-600">
            Learn from expert tutors and advance your knowledge in various subjects.
          </p>
        </div>

        {/* Enhanced Empty‑state */}
        {courses.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              No Courses Available Yet
            </h3>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              Courses will appear here once tutors create and publish them. Check back soon for exciting learning opportunities!
            </p>
            <p className="text-sm text-gray-500">
              We're building our course catalog. Be the first to know when new courses are available!
            </p>
          </div>
        ) : (
          <>
            {/* Enhanced Search and Filter Bar */}
            <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-blue-100">
              <div className="flex flex-col space-y-4">
                {/* Search Bar */}
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search courses by title, subject, or tutor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-blue-200 focus:border-blue-400"
                  />
                </div>

                {/* Subject Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                  {allSubjects.map((subject) => (
                    <Button
                      key={subject}
                      variant={selectedSubject === subject ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSubject(subject)}
                      className={
                        selectedSubject === subject
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                          : "border-blue-200 text-blue-700 hover:bg-blue-50"
                      }
                    >
                      {subject}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Courses grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <Card
                  key={course._id}
                  className="hover:shadow-xl transition-all duration-300 border-blue-100 bg-white/80 backdrop-blur-sm"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        {course.sub || "General"}
                      </Badge>
                      <Badge variant="outline" className="border-green-200 text-green-700">
                        {course.level}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl text-gray-900 line-clamp-2">
                      {course.courseName}
                    </CardTitle>
                    <CardDescription className="text-gray-600 line-clamp-3">
                      {course.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Enhanced Tutor Info */}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{course.tutorId?.name || "Unknown Tutor"}</p>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-gray-500">Expert Tutor</span>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Course Details */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Price per session:</span>
                        <span className="font-semibold text-blue-600">
                          {course.pricePerSession === 0 ? "Free" : `$${course.pricePerSession}`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Session Time:
                        </span>
                        <span className="font-semibold text-green-600">2:00PM - 3:00PM</span>
                      </div>
                    </div>

                    {/* Demo Video */}
                    {course.demoLink && (
                      <div className="w-full">
                        <h4 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                          <PlayCircle className="w-4 h-4 text-purple-600" />
                          Demo Video
                        </h4>
                        <div className="relative overflow-hidden rounded-lg shadow-sm">
                          <div className="relative pb-[56.25%] h-0">
                            <iframe
                              src={getYouTubeEmbedUrl(course.demoLink)}
                              title={`${course.courseName} Demo Video`}
                              className="absolute top-0 left-0 w-full h-full rounded-lg"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Enhanced Tags */}
                    {course.tag?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {course.tag.slice(0, 3).map((tag: string, idx: number) => (
                          <Badge
                            key={`${tag}-${idx}`}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {course.tag.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{course.tag.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Enhanced Action buttons */}
                    <div className="pt-2">
                      <Button
                        onClick={() => handleBookSession(course)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white mb-2"
                        disabled={currentUser.role !== 'student' && currentUser.role !== 'parent'}
                      >
                        {(currentUser.role === 'student' || currentUser.role === 'parent') ? 'Book Session' : 'Students/Parents Only'}
                      </Button>
                      
                      <Link to={`/tutor/${course.tutorId._id}`}>
                        <Button
                          variant="outline"
                          className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          View Tutor Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Enhanced No‑results state */}
            {filteredCourses.length === 0 && courses.length > 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No courses found
                </h3>
                <p className="text-gray-600">
                  {selectedSubject !== "All" 
                    ? `No courses found for ${selectedSubject}. Try selecting a different subject or adjusting your search.`
                    : "Try adjusting your search criteria to find the perfect course."
                  }
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Enhanced Booking Request Dialog */}
      <BookingRequestDialog
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
        course={selectedCourse}
      />
    </div>
  );
};

export default Courses;