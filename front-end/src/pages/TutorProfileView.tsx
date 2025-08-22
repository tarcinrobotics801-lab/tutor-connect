import { useParams, useNavigate } from "react-router-dom";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	User,
	Mail,
	Phone,
	LinkIcon,
	Star,
	Calendar,
	ArrowLeft,
} from "lucide-react";
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
		if (!currentUser) {
			toast({
				title: "Login Required",
				description: "Please log in to view tutor profiles.",
				variant: "destructive",
			});
			navigate("/login");
		}
	}, [currentUser, navigate, toast]);

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
			<div>
				<Navigation />
				<div className="container mx-auto px-4 py-16">
					<div className="text-center">
						<h3 className="text-2xl font-semibold mb-3">Tutor Not Found</h3>
						<p className="text-muted-foreground">
							The tutor profile you're looking for doesn't exist.
						</p>
						<Button onClick={() => navigate("/tutors")} className="mt-4">
							Back to Tutors
						</Button>
					</div>
				</div>
			</div>
		);
	}

	if (!tutor.isApproved) {
		return (
			<div>
				<Navigation />
				<div className="container mx-auto px-4 py-16">
					<div className="text-center">
						<h3 className="text-2xl font-semibold mb-3">
							Tutor Not Approved
						</h3>
						<p className="text-muted-foreground">
							This tutor profile is not approved by admin yet.
						</p>
						<Button onClick={() => navigate("/tutors")} className="mt-4">
							Back to Tutors
						</Button>
					</div>
				</div>
			</div>
		);
	}

	const days = [
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
		"saturday",
		"sunday",
	];

	return (
		<div className="min-h-screen bg-background">
			<Navigation />
			<div className="container mx-auto px-4 py-8">
				<Button
					onClick={() => navigate("/Courses")}
					variant="ghost"
					className="mb-6"
				>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back to Courses
				</Button>

				<div className="grid lg:grid-cols-3 gap-8">
					{/* Profile Card */}
					<div className="lg:col-span-1">
						<Card>
							<CardHeader className="text-center">
								<div className="relative w-32 h-32 mx-auto mb-4">
									{tutor.photo ? (
										<img
											src={tutor.photo}
											alt={tutor.name}
											className="w-32 h-32 rounded-full object-cover border-4 border-primary"
										/>
									) : (
										<div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center border-4 border-primary/20">
											<User className="h-16 w-16 text-primary-foreground" />
										</div>
									)}
									<div className="absolute -bottom-1 -right-1 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
										<span className="text-white text-sm font-bold">✓</span>
									</div>
								</div>
								<CardTitle className="text-2xl">{tutor.name}</CardTitle>
								<CardDescription className="text-primary font-medium text-lg">
									{tutor.educationalQualification}
								</CardDescription>
							</CardHeader>

							<CardContent className="space-y-4">
								<div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
									<Star className="h-4 w-4 text-yellow-500" />
									<span>{tutor.yearsOfExperience} experience</span>
								</div>

								{tutor.gradeOrYear && (
									<div className="text-center text-sm">
										<strong>Grade/Year:</strong> {tutor.gradeOrYear}
									</div>
								)}

								{tutor.educationBoard && (
									<div className="text-center text-sm">
										<strong>Education Board:</strong> {tutor.educationBoard}
									</div>
								)}

								{tutor.linkedinLink && (
									<div className="flex items-center space-x-3">
										<LinkIcon className="h-4 w-4 text-muted-foreground" />
										<a
											href={
												tutor.linkedinLink.startsWith("http")
													? tutor.linkedinLink
													: `https://${tutor.linkedinLink}`
											}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm text-primary underline break-all"
										>
											{tutor.linkedinLink}
										</a>
									</div>
								)}

								<div>
									<p className="text-sm font-medium mb-2">Subjects:</p>
									<div className="flex flex-wrap gap-1">
										{tutor.subjects?.map((subject) => (
											<Badge key={subject} variant="secondary">
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
						<Card>
							<CardHeader>
								<CardTitle>About</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="leading-relaxed">{tutor.bio}</p>
							</CardContent>
						</Card>

						{/* Availability */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center space-x-2">
									<Calendar className="h-5 w-5" />
									<span>Availability</span>
								</CardTitle>
							</CardHeader>

							<CardContent>
								<div className="grid md:grid-cols-2 gap-3">
									{days.map((day) => (
										<div
											key={day}
											className="flex justify-between items-center p-3 rounded-lg bg-muted"
										>
											<span className="capitalize font-medium">{day}</span>
											<span className="text-sm text-muted-foreground">
												{tutor.availability?.[
													day as keyof typeof tutor.availability
												]?.available
													? tutor.availability?.[
															day as keyof typeof tutor.availability
													  ]?.timeSlots.join(", ") || "Available"
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