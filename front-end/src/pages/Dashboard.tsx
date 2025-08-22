import React from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	User,
	Mail,
	Phone,
	MapPin,
	GraduationCap,
	BookOpen,
	Calendar,
	Building2,
} from "lucide-react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
} from "recharts";
import { useApp } from "@/contexts/AppContext";

const StudentDashboard = () => {
	const { currentUser } = useApp();
	console.log("Student enrolledCourses:", currentUser?.enrolledCourses);

	if (!currentUser || currentUser.role !== "student") {
		return (
			<div className="text-center py-12">
				<h3 className="text-xl font-medium mb-2">Access Denied</h3>
				<p className="text-muted-foreground">
					Please log in as a student to access the dashboard.
				</p>
			</div>
		);
	}

	if (!currentUser.profileCompleted) {
		return (
			<div className="text-center py-12">
				<User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
				<h3 className="text-xl font-medium mb-2">Complete Your Profile</h3>
				<p className="text-muted-foreground">
					Please complete your profile setup to access your dashboard.
				</p>
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

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	return (
		<div className="space-y-8 p-8">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Welcome back, {studentName}!</h1>
					<p className="text-muted-foreground mt-2">
						Here's your academic profile and course enrollment overview.
					</p>
				</div>
			</div>

			{/* Key Metrics */}
			<div className="grid md:grid-cols-4 gap-6">
				{/* Enrolled Courses */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Enrolled Courses
						</CardTitle>
						<BookOpen className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{enrolledCourses.length}
						</div>
						<p className="text-xs text-muted-foreground">Active courses</p>
					</CardContent>
				</Card>

				{/* Academic Year/Grade */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Academic Year/Grade
						</CardTitle>
						<GraduationCap className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{studentYear}</div>
					</CardContent>
				</Card>

				{/* Department */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Department / Interested Subjects
						</CardTitle>
						<Building2 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-lg font-bold">{studentDepartment}</div>
						<p className="text-xs text-muted-foreground">Study program</p>
					</CardContent>
				</Card>

				{/* Profile Status */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Profile Status
						</CardTitle>
						<User className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-lg font-bold">Complete</div>
						<p className="text-xs text-muted-foreground">
							All fields filled
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Profile Information */}
			<div className="grid lg:grid-cols-3 gap-8">
				{/* Personal Information */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle className="flex items-center space-x-2">
							<User className="h-5 w-5 text-primary" />
							<span>Profile Information</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid md:grid-cols-2 gap-4">
							<div>
								<label className="text-sm font-medium">Name</label>
								<p>{studentName}</p>
							</div>
							<div>
								<label className="text-sm font-medium">Email</label>
								<p className="flex items-center">
									<Mail className="h-4 w-4 mr-2 text-muted-foreground" />
									{studentEmail}
								</p>
							</div>
							{studentPhone && (
								<div>
									<label className="text-sm font-medium">Phone Number</label>
									<p className="flex items-center">
										<Phone className="h-4 w-4 mr-2 text-muted-foreground" />
										{studentPhone}
									</p>
								</div>
							)}
							<div>
								<label className="text-sm font-medium">Location</label>
								<p className="flex items-center">
									<MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
									{studentCity}, {studentState}
								</p>
							</div>
							<div>
								<label className="text-sm font-medium">
									College / School Name
								</label>
								<p className="flex items-center">
									<Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
									{studentCollege}
								</p>
							</div>
						</div>
						{currentUser.createdAt && (
							<div>
								<label className="text-sm font-medium">Member Since</label>
								<p className="flex items-center">
									<Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
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
							<BookOpen className="h-5 w-5 text-primary" />
							<span>Enrolled Courses</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						{enrolledCourses.length > 0 ? (
							<div className="space-y-3">
								{enrolledCourses.map((course, index) => (
									<div
										key={index}
										className="p-3 bg-muted rounded-lg border-l-4 border-primary"
									>
										<div className="flex items-center justify-between">
											<div>
												<h4 className="font-semibold">{course}</h4>
												<p className="text-sm text-muted-foreground">
													Course {index + 1}
												</p>
											</div>
										</div>
									</div>
								))}
								<div className="mt-4 p-3 bg-muted rounded-lg text-center">
									<p className="text-sm font-semibold text-primary">
										Total Enrolled: {enrolledCourses.length}
									</p>
								</div>
							</div>
						) : (
							<div className="text-center py-8">
								<BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
								<p className="text-muted-foreground">
									No courses enrolled yet
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default StudentDashboard;