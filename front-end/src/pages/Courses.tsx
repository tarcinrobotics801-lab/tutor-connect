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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
	if (lower.includes("1st year") || lower.includes("first year"))
		return "1st year";
	if (lower.includes("2nd year") || lower.includes("second year"))
		return "2nd year";
	if (lower.includes("3rd year") || lower.includes("third year"))
		return "3rd year";
	if (lower.includes("4th year") || lower.includes("fourth year"))
		return "4th year";

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
		if (currentUser.role !== "student" && currentUser.role !== "parent")
			return false;
		if (
			(currentUser.role === "student" || currentUser.role === "parent") &&
			!currentUser.profileCompleted
		)
			return false;
		return true;
	};

	const allSubjects = [
		"All",
		...Array.from(new Set(courses.map((course) => course.sub || "General"))),
	];

	const filteredCourses = courses.filter((course) => {
		const term = searchTerm.toLowerCase();

		const matchesSearch =
			(course.courseName?.toLowerCase() || "").includes(term) ||
			(course.sub?.toLowerCase() || "").includes(term) ||
			(course.description?.toLowerCase() || "").includes(term) ||
			(course.tutorId?.name?.toLowerCase() || "").includes(term);

		const matchesSubject =
			selectedSubject === "All" ||
			(course.sub || "General") === selectedSubject;

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

		if (
			(currentUser.role === "parent" || currentUser.role === "student") &&
			!currentUser.profileCompleted
		) {
			toast({
				title: "Complete Profile",
				description: "Please complete your profile before booking sessions.",
				variant: "destructive",
			});
			if (currentUser.role === "student") {
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
		if (currentUser.role !== "student" && currentUser.role !== "parent")
			return "Students/Parents Only";
		if (
			(currentUser.role === "student" || currentUser.role === "parent") &&
			!currentUser.profileCompleted
		)
			return "Complete Profile to Book";
		return "Book Session";
	};

	const getBookButtonIcon = () => {
		if (!currentUser || !canBookSession())
			return <Lock className="h-4 w-4 mr-2" />;
		return null;
	};

	return (
		<div className="min-h-screen bg-background">
			<Navigation />

			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<span className="text-4xl font-bold text-primary">
						Discover Amazing Courses
					</span>
					<p className="text-muted-foreground">
						Learn from expert tutors and advance your knowledge in various
						subjects.
					</p>
					{!currentUser && (
						<div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
							<p className="text-primary/80 text-sm">
								<strong>Browse freely!</strong> You can view all available
								courses. To book a session, please{" "}
								<Link
									to="/login"
									className="underline font-semibold hover:text-primary"
								>
									login
								</Link>{" "}
								or{" "}
								<Link
									to="/signup"
									className="underline font-semibold hover:text-primary"
								>
									sign up
								</Link>
								.
							</p>
						</div>
					)}
				</div>

				{loading ? (
					<CustomLoader />
				) : courses.length === 0 ? (
					<div className="text-center py-16">
						<div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
							<BookOpen className="h-12 w-12 text-primary" />
						</div>
						<h3 className="text-2xl font-semibold mb-3">
							No Courses Available Yet
						</h3>
						<p className="text-muted-foreground mb-4 max-w-md mx-auto">
							Courses will appear here once tutors create and publish them. Check
							back soon for exciting learning opportunities!
						</p>
						<p className="text-sm text-muted-foreground/80">
							We're building our course catalog. Be the first to know when new
							courses are available!
						</p>
					</div>
				) : (
					<>
						{/* Filters */}
						<div className="bg-card p-6 rounded-xl shadow-lg mb-8 border">
							<div className="flex flex-col space-y-4">
								<div className="relative max-w-md">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
									<Input
										placeholder="Search courses by title, subject, or tutor..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-10"
									/>
								</div>

								{/* Subject Filter */}
								<div className="flex flex-wrap gap-2">
									{allSubjects.map((subject) => (
										<Button
											key={subject}
											variant={
												selectedSubject === subject ? "default" : "outline"
											}
											size="sm"
											onClick={() => setSelectedSubject(subject)}
										>
											{subject}
										</Button>
									))}
								</div>

								{/* Education Board & Grade Filters */}
								<div className="flex flex-wrap gap-4 mt-2">
									<Select
										onValueChange={(value) => {
											setSelectedBoard(value);
											setSelectedGradeYear("All");
										}}
										value={selectedBoard}
									>
										<SelectTrigger className="w-[180px]">
											<SelectValue placeholder="All Boards" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="All">All Boards</SelectItem>
											<SelectItem value="State">State</SelectItem>
											<SelectItem value="CBSE">CBSE</SelectItem>
											<SelectItem value="ICSE">ICSE</SelectItem>
											<SelectItem value="College">College</SelectItem>
										</SelectContent>
									</Select>

									{selectedBoard !== "All" && (
										<Select
											onValueChange={setSelectedGradeYear}
											value={selectedGradeYear}
										>
											<SelectTrigger className="w-[180px]">
												<SelectValue placeholder="All Grades/Years" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="All">All Grades/Years</SelectItem>
												{selectedBoard === "College" ? (
													<>
														<SelectItem value="1st Year">1st Year</SelectItem>
														<SelectItem value="2nd Year">2nd Year</SelectItem>
														<SelectItem value="3rd Year">3rd Year</SelectItem>
														<SelectItem value="4th Year">4th Year</SelectItem>
													</>
												) : (
													<>
														<SelectItem value="Grade 6">Grade 6</SelectItem>
														<SelectItem value="Grade 7">Grade 7</SelectItem>
														<SelectItem value="Grade 8">Grade 8</SelectItem>
														<SelectItem value="Grade 9">Grade 9</SelectItem>
														<SelectItem value="Grade 10">Grade 10</SelectItem>
														<SelectItem value="Grade 11">Grade 11</SelectItem>
														<SelectItem value="Grade 12">Grade 12</SelectItem>
													</>
												)}
											</SelectContent>
										</Select>
									)}
								</div>
							</div>
						</div>

						{/* Course Cards */}
						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-[1fr]">
							{filteredCourses.map((course) => (
								<Card
									key={course._id}
									className="flex flex-col justify-between h-full hover:shadow-xl transition-all duration-300"
								>
									<CardHeader>
										<div className="flex justify-between items-start mb-2">
											<Badge variant="secondary">{course.sub || "General"}</Badge>
											<Badge variant="outline">{course.level}</Badge>
										</div>
										<CardTitle className="text-xl line-clamp-2">
											{course.courseName}
										</CardTitle>
										<CardDescription className="line-clamp-3 min-h-[60px]">
											{course.description}
										</CardDescription>
									</CardHeader>

									<CardContent className="flex flex-col gap-4 mt-auto">
										<div className="flex items-center space-x-3">
											<div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
												<User className="h-5 w-5 text-primary-foreground" />
											</div>
											<div>
												<p className="font-medium">
													{course.tutorId?.name || "Unknown Tutor"}
												</p>
												<div className="flex items-center space-x-1">
													<Star className="h-3 w-3 text-yellow-500 fill-current" />
													<span className="text-xs text-muted-foreground">
														Expert Tutor
													</span>
												</div>
											</div>
										</div>

										{/* Show Education Board and Grade/Year */}
										<div className="space-y-1">
											<div className="flex justify-between text-sm text-muted-foreground">
												<span>Board:</span>
												<span className="font-medium text-foreground">
													{course.educationBoard || "N/A"}
												</span>
											</div>
											<div className="flex justify-between text-sm text-muted-foreground">
												<span>Grade / Year:</span>
												<span className="font-medium text-foreground">
													{course.classOrYear || "N/A"}
												</span>
											</div>
										</div>

										<div className="space-y-2">
											<div className="flex justify-between items-center">
												<span className="text-sm text-muted-foreground">
													Price per session:
												</span>
												<span className="font-semibold text-primary">
													{course.pricePerSession === 0
														? "Free"
														: `$${course.pricePerSession}`}
												</span>
											</div>
											<div className="flex justify-between items-center">
												<span className="text-sm text-muted-foreground flex items-center gap-1">
													<Clock className="h-3 w-3" />
													Session Time:
												</span>
												<span className="font-semibold text-green-600">
													{course.sessionTime}
												</span>
											</div>
										</div>

										{course.demoLink && (
											<div className="w-full">
												<h4 className="text-sm font-semibold mb-1 flex items-center gap-1">
													<PlayCircle className="w-4 h-4 text-primary" />
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

										<div className="pt-2">
											<Button
												onClick={() => handleBookSession(course)}
												className="w-full mb-2"
												disabled={!canBookSession()}
											>
												{getBookButtonIcon()}
												{getBookButtonText()}
											</Button>
											<Link to={`/tutor/${course.tutorId._id}`}>
												<Button variant="outline" className="w-full">
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
								<BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
								<h3 className="text-lg font-medium mb-2">
									No courses found
								</h3>
								<p className="text-muted-foreground">
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