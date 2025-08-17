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
  PlayCircle,
  Star,
  Lock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import CustomLoader from "@/components/CustomLoader";

// Normalize grade/year text for consistent comparison
const normalizeGrade = (value: string): string => {
  if (!value) return "";
  const lower = value.toLowerCase().trim();

  // Normalize school grades (1–12)
  if (lower.includes("1")) return "grade 1";
  if (lower.includes("2")) return "grade 2";
  if (lower.includes("3")) return "grade 3";
  if (lower.includes("4")) return "grade 4";
  if (lower.includes("5")) return "grade 5";
  if (lower.includes("6")) return "grade 6";
  if (lower.includes("7")) return "grade 7";
  if (lower.includes("8")) return "grade 8";
  if (lower.includes("9")) return "grade 9";
  if (lower.includes("10")) return "grade 10";
  if (lower.includes("11")) return "grade 11";
  if (lower.includes("12")) return "grade 12";

  // Normalize college years (1st–4th)
  if (lower.includes("1st year") || lower.includes("first year")) return "1st year";
  if (lower.includes("2nd year") || lower.includes("second year")) return "2nd year";
  if (lower.includes("3rd year") || lower.includes("third year")) return "3rd year";
  if (lower.includes("4th year") || lower.includes("fourth year")) return "4th year";

  return lower;
};

const getYouTubeEmbedUrl = (url: string): string => {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/
  );
  if (!match) return "";
  const videoId = match[1];
  return `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&modestbranding=1&rel=0`;
};

const Courses = () => {
  const { currentUser } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedBoard, setSelectedBoard] = useState("All");
  const [selectedGradeYear, setSelectedGradeYear] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/auth/courses");
        const data = await response.json();
        if (response.ok) setCourses(data.courses);
        else console.error("Failed to fetch courses:", data.message);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Check if user can book sessions
  const canBookSession = () => {
    if (!currentUser) return false;
    if (currentUser.role !== "student" && currentUser.role !== "parent") return false;
    if ((currentUser.role === 'student' || currentUser.role === 'parent') && !currentUser.profileCompleted) return false;
    return true;
  };

  const allSubjects = ["All", ...Array.from(new Set(courses.map(course => course.sub || "General")))];

  const filteredCourses = courses.filter((course) => {
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      (course.courseName?.toLowerCase() || "").includes(term) ||
      (course.sub?.toLowerCase() || "").includes(term) ||
      (course.description?.toLowerCase() || "").includes(term) ||
      (course.tutorId?.name?.toLowerCase() || "").includes(term);

    const matchesSubject =
      selectedSubject === "All" || (course.sub || "General") === selectedSubject;

    const matchesBoard =
      selectedBoard === "All" || course.educationBoard === selectedBoard;

    const matchesGradeYear =
      selectedGradeYear === "All" ||
      normalizeGrade(course.classOrYear) === normalizeGrade(selectedGradeYear);

    return matchesSearch && matchesSubject && matchesBoard && matchesGradeYear;
  });

  const handleBookSession = (course: any) => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to book a session.",
        variant: "destructive",
      });
      navigate("/login");
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
    
    if ((currentUser.role === 'parent' || currentUser.role === 'student') && !currentUser.profileCompleted) {
      toast({
        title: "Complete Profile",
        description: "Please complete your profile before booking sessions.",
        variant: "destructive",
      });
      if (currentUser.role === 'student') {
        navigate("/student-profile");
      } else {
        navigate("/parent-profile");
      }
      return;
    }
    
    setSelectedCourse(course);
    setBookingDialogOpen(true);
  };

  const getBookButtonText = () => {
    if (!currentUser) return "Login to Book Session";
    if (currentUser.role !== "student" && currentUser.role !== "parent") return "Students/Parents Only";
    if ((currentUser.role === 'student' || currentUser.role === 'parent') && !currentUser.profileCompleted) return "Complete Profile to Book";
    return "Book Session";
  };

  const getBookButtonIcon = () => {
    if (!currentUser || !canBookSession()) return <Lock className="h-4 w-4 mr-2" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Discover Amazing Courses
          </span>
          <p className="text-gray-600">
            Learn from expert tutors and advance your knowledge in various subjects.
          </p>
          {!currentUser && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-sm">
                <strong>Browse freely!</strong> You can view all available courses. To book a session, please{" "}
                <Link to="/login" className="underline font-semibold hover:text-blue-800">
                  login
                </Link>{" "}
                or{" "}
                <Link to="/signup" className="underline font-semibold hover:text-blue-800">
                  sign up
                </Link>.
              </p>
            </div>
          )}
        </div>

        {loading ? (
          <CustomLoader />
        ) : courses.length === 0 ? (
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
            {/* Filters */}
            <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-blue-100">
              <div className="flex flex-col space-y-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search courses by title, subject, or tutor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-blue-200 focus:border-blue-400"
                  />
                </div>

                {/* Subject Filter */}
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

                {/* Education Board & Grade Filters */}
                <div className="flex flex-wrap gap-4 mt-2">
                  <select
                    value={selectedBoard}
                    onChange={(e) => {
                      setSelectedBoard(e.target.value);
                      setSelectedGradeYear("All");
                    }}
                    className="border border-blue-300 rounded px-3 py-2"
                  >
                    <option value="All">All Boards</option>
                    <option value="State">State</option>
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="College">College</option>
                  </select>

                  {selectedBoard !== "All" && (
                    <select
                      value={selectedGradeYear}
                      onChange={(e) => setSelectedGradeYear(e.target.value)}
                      className="border border-blue-300 rounded px-3 py-2"
                    >
                      <option value="All">All Grades/Years</option>
                      {selectedBoard === "College" ? (
                        <>
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                        </>
                      ) : (
                        <>
                          <option value="Grade 6">Grade 6</option>
                          <option value="Grade 7">Grade 7</option>
                          <option value="Grade 8">Grade 8</option>
                          <option value="Grade 9">Grade 9</option>
                          <option value="Grade 10">Grade 10</option>
                          <option value="Grade 11">Grade 11</option>
                          <option value="Grade 12">Grade 12</option>
                        </>
                      )}
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Course Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-[1fr]">
              {filteredCourses.map((course) => (
                <Card
                  key={course._id}
                  className="flex flex-col justify-between h-full hover:shadow-xl transition-all duration-300 border-blue-100 bg-white/80 backdrop-blur-sm"
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
                    <CardDescription className="text-gray-600 line-clamp-3 min-h-[60px]">
                      {course.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex flex-col gap-4 mt-auto">
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

                    {/* Show Education Board and Grade/Year */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Board:</span>
                        <span className="font-medium text-gray-900">{course.educationBoard || "N/A"}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Grade / Year:</span>
                        <span className="font-medium text-gray-900">{course.classOrYear || "N/A"}</span>
                      </div>
                    </div>

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
                        <span className="font-semibold text-green-600">{course.sessionTime}</span>
                      </div>
                    </div>

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

                    {course.tag?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {course.tag.slice(0, 3).map((tag: string, idx: number) => (
                          <Badge key={`${tag}-${idx}`} variant="outline" className="text-xs">
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

                    <div className="pt-2">
                      <Button
                        onClick={() => handleBookSession(course)}
                        className={`w-full mb-2 ${
                          canBookSession()
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300"
                        }`}
                        disabled={!canBookSession()}
                      >
                        {getBookButtonIcon()}
                        {getBookButtonText()}
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

            {filteredCourses.length === 0 && courses.length > 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No courses found
                </h3>
                <p className="text-gray-600">
                  {selectedSubject !== "All"
                    ? `No courses found for ${selectedSubject}. Try selecting a different subject or adjusting your search.`
                    : "Try adjusting your search criteria to find the perfect course."}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <BookingRequestDialog
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
        course={selectedCourse}
      />
    </div>
  );
};

export default Courses;