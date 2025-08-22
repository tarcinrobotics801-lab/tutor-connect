import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { User, Search, Star, BookOpen } from "lucide-react";
import CustomLoader from "@/components/CustomLoader";

const Tutors = () => {
	const [tutors, setTutors] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedSubject, setSelectedSubject] = useState("All");
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchTutors = async () => {
			try {
				const response = await fetch("/api/auth/completed-tutors");
				const data = await response.json();
				if (response.ok) {
					setTutors(data.tutors);
				}
				setLoading(false);
			} catch (error) {
				console.error("Error fetching tutors:", error);
			}
		};

		fetchTutors();
	}, []);

	// Get unique subjects for filter buttons from all tutors' subjects
	const allSubjects = ["All"];
	tutors.forEach((tutor) => {
		if (tutor.subjects) {
			tutor.subjects.forEach((subject) => {
				if (!allSubjects.includes(subject)) {
					allSubjects.push(subject);
				}
			});
		}
	});

	const filteredTutors = tutors.filter((tutor) => {
		const matchesSearch =
			tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			tutor.subjects?.some((subject) =>
				subject.toLowerCase().includes(searchTerm.toLowerCase())
			) ||
			tutor.educationalQualification
				?.toLowerCase()
				.includes(searchTerm.toLowerCase());

		const matchesSubject =
			selectedSubject === "All" ||
			tutor.subjects?.some((subject) => subject === selectedSubject);

		return matchesSearch && matchesSubject;
	});

	const handleViewProfile = (tutorId: string) => {
		navigate(`/tutor/${tutorId}`);
	};

	return (
		<div className="min-h-screen bg-background">
			<Navigation />
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-primary mb-2">
						Find Your Perfect Tutor
					</h1>
					<p className="text-muted-foreground">
						Connect with experienced educators ready to help you succeed.
					</p>
				</div>

				{loading ? (
					<CustomLoader />
				) : tutors.length === 0 ? (
					<div className="text-center py-16">
						<div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
							<User className="h-12 w-12 text-primary" />
						</div>
						<h3 className="text-2xl font-semibold mb-3">
							No Tutors Available Yet
						</h3>
						<p className="text-muted-foreground mb-4 max-w-md mx-auto">
							Tutors will appear here once they complete their profiles and
							become available for teaching.
						</p>
						<p className="text-sm text-muted-foreground/80">
							We're building our community of expert educators. Check back soon!
						</p>
					</div>
				) : (
					<>
						{/* Search and Filter Bar */}
						<div className="bg-card p-6 rounded-xl shadow-lg mb-8 border">
							<div className="flex flex-col space-y-4">
								{/* Search Bar */}
								<div className="relative max-w-md">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
									<Input
										placeholder="Search tutors by name, subject, or qualification..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-10"
									/>
								</div>

								{/* Subject Filter Buttons */}
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
							</div>
						</div>

						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
							{filteredTutors.map((tutor) => (
								<Card
									key={tutor._id}
									className="hover:shadow-xl transition-all duration-300"
								>
									<CardHeader className="text-center">
										<div className="relative w-24 h-24 mx-auto mb-4">
											{tutor.photo ? (
												<img
													src={tutor.photo}
													alt={tutor.name}
													className="w-24 h-24 rounded-full object-cover border-4 border-primary"
												/>
											) : (
												<div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center border-4 border-primary/20">
													<User className="h-12 w-12 text-primary-foreground" />
												</div>
											)}
											<div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
												<span className="text-white text-xs font-bold">
													✓
												</span>
											</div>
										</div>
										<CardTitle className="text-xl">{tutor.name}</CardTitle>
										<CardDescription className="text-primary font-medium">
											{tutor.educationalQualification}
										</CardDescription>
									</CardHeader>

									<CardContent className="space-y-4">
										<div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
											<Star className="h-4 w-4 text-yellow-500" />
											<span>{tutor.yearsOfExperience} experience</span>
										</div>

										<p className="text-sm text-muted-foreground text-center line-clamp-3">
											{tutor.bio}
										</p>

										<div>
											<p className="text-sm font-medium mb-2">Subjects:</p>
											<div className="flex flex-wrap gap-1 justify-center">
												{tutor.subjects?.map((subject) => (
													<Badge key={subject} variant="secondary">
														{subject}
													</Badge>
												))}
											</div>
										</div>

										<div className="text-center">
											<p className="text-xs text-muted-foreground">
												Available for sessions
											</p>
										</div>

										<div className="pt-2">
											<Button
												onClick={() => handleViewProfile(tutor._id)}
												className="w-full"
											>
												View Profile
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>

						{filteredTutors.length === 0 && tutors.length > 0 && (
							<div className="text-center py-12">
								<BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
								<h3 className="text-lg font-medium mb-2">
									No tutors found
								</h3>
								<p className="text-muted-foreground">
									{selectedSubject !== "All"
										? `No tutors found for ${selectedSubject}. Try selecting a different subject or adjusting your search.`
										: "Try adjusting your search criteria."}
								</p>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default Tutors;