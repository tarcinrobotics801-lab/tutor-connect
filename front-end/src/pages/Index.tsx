import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	BookOpen,
	Users,
	Calendar,
	Award,
	GraduationCap,
	User,
	LogOut,
	UserCheck,
	BookOpenCheck,
	Target,
	Zap,
	TrendingUp,
	Heart,
	Clock,
	Shield,
	Star,
	ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const Index = () => {
	const { currentUser, setCurrentUser } = useApp();
	const { toast } = useToast();
	const navigate = useNavigate();

	const handleLogout = () => {
		setCurrentUser(null);
		toast({
			title: "Logged out successfully",
			description: "You have been logged out of your account.",
		});
		navigate("/");
	};

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((word) => word.charAt(0))
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<div className="min-h-screen bg-background">
			<header className="border-b">
				<div className="container mx-auto px-4 py-4 flex justify-between items-center">
					<Link to="/" className="flex items-center space-x-2">
						<GraduationCap className="h-8 w-8 text-primary" />
						<div>
							<span className="text-2xl font-bold">TUTOR</span>
							<span className="text-xl font-light text-primary ml-1">
								CONNECT
							</span>
							<div className="text-xs text-muted-foreground">NETWORK</div>
						</div>
					</Link>

					<NavigationMenu>
						<NavigationMenuList>
							<NavigationMenuItem>
								<Link to="/" legacyBehavior passHref>
									<NavigationMenuLink className={navigationMenuTriggerStyle()}>
										Home
									</NavigationMenuLink>
								</Link>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<Link to="/courses" legacyBehavior passHref>
									<NavigationMenuLink className={navigationMenuTriggerStyle()}>
										Discover Courses & Tutors
									</NavigationMenuLink>
								</Link>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<Link to="/resources" legacyBehavior passHref>
									<NavigationMenuLink className={navigationMenuTriggerStyle()}>
										Free Tutor Notes
									</NavigationMenuLink>
								</Link>
							</NavigationMenuItem>
						</NavigationMenuList>
					</NavigationMenu>

					<div className="flex justify-end items-center space-x-4">
						{currentUser ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="relative h-8 w-8 rounded-full"
									>
										<Avatar className="h-8 w-8">
											{currentUser.photo ? (
												<AvatarImage
													src={currentUser.photo}
													alt={currentUser.name}
												/>
											) : (
												<AvatarFallback>
													{getInitials(currentUser.name)}
												</AvatarFallback>
											)}
										</Avatar>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56" align="end" forceMount>
									<div className="flex items-center justify-start gap-2 p-2">
										<div className="flex flex-col space-y-1 leading-none">
											<p className="font-medium">{currentUser.name}</p>
											<p className="w-[200px] truncate text-sm text-muted-foreground capitalize">
												{currentUser.role}
											</p>
										</div>
									</div>
									<DropdownMenuSeparator />
									{currentUser.role === "tutor" && (
										<DropdownMenuItem asChild>
											<Link to="/tutor-profile" className="flex items-center">
												<User className="mr-2 h-4 w-4" />
												<span>Profile & Dashboard</span>
											</Link>
										</DropdownMenuItem>
									)}
									{currentUser.role === "student" && (
										<DropdownMenuItem asChild>
											<Link
												to="/student-profile"
												className="flex items-center"
											>
												<User className="mr-2 h-4 w-4" />
												<span>Profile & Dashboard</span>
											</Link>
										</DropdownMenuItem>
									)}
									{currentUser.role === "parent" && (
										<DropdownMenuItem asChild>
											<Link to="/parent-profile" className="flex items-center">
												<User className="mr-2 h-4 w-4" />
												<span>My Account</span>
											</Link>
										</DropdownMenuItem>
									)}
									{currentUser.role === "admin" && (
										<DropdownMenuItem asChild>
											<Link to="/admin" className="flex items-center">
												<User className="mr-2 h-4 w-4" />
												<span>Dashboard</span>
											</Link>
										</DropdownMenuItem>
									)}
									<DropdownMenuSeparator />
									<DropdownMenuItem
										className="text-red-600 focus:text-red-600 cursor-pointer"
										onClick={handleLogout}
									>
										<LogOut className="mr-2 h-4 w-4" />
										<span>Log out</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<div className="flex items-center space-x-2">
								<Link to="/login">
									<Button variant="outline">Log In</Button>
								</Link>
								<Link to="/signup">
									<Button>Sign Up</Button>
								</Link>
							</div>
						)}
					</div>
				</div>
			</header>

			<section className="container mx-auto px-4 py-20">
				<div className="text-center max-w-5xl mx-auto">
					<h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
						WELCOME TO
						<br />
						<span className="text-primary">Tutor Connect Network</span>
					</h1>
					<p className="text-xl md:text-2xl text-muted-foreground mb-4 font-bold">
						Connecting Minds Worldwide
					</p>
					<p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
						Experience the power of education with us. We offer a seamless blend
						of technology and learning, providing interactive lessons, virtual
						classrooms, and personalized feedback.
					</p>
					<div className="flex flex-col sm:flex-row gap-6 justify-center">
						<Link to="/signup">
							<Button size="lg">Get Started</Button>
						</Link>
						<Link to="/courses">
							<Button size="lg" variant="outline">
								Learn More
							</Button>
						</Link>
					</div>
				</div>
			</section>

			<section className="container mx-auto px-4 py-20">
				<h2 className="text-5xl font-bold text-center mb-4">
					Choose Your Path
				</h2>
				<p className="text-xl text-center text-muted-foreground mb-16">
					Whether you're here to learn or teach, we have the perfect solution
					for you
				</p>

				<div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8 max-w-7xl mx-auto">
					<Card>
						<CardHeader className="text-center pb-6">
							<div className="mx-auto mb-4 p-3 bg-primary rounded-2xl w-fit">
								<BookOpenCheck className="h-12 w-12 text-primary-foreground" />
							</div>
							<CardTitle className="text-2xl mb-3 font-bold">
								For Students
							</CardTitle>
							<CardDescription className="text-sm font-medium">
								Unlock your potential with personalized learning experiences
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-3">
								<div className="flex items-center space-x-3">
									<Target className="h-5 w-5 text-primary" />
									<span className="text-sm font-semibold">
										Personalized Learning Paths
									</span>
								</div>
								<div className="flex items-center space-x-3">
									<Users className="h-5 w-5 text-primary" />
									<span className="text-sm font-semibold">
										Expert Tutors Worldwide
									</span>
								</div>
								<div className="flex items-center space-x-3">
									<Zap className="h-5 w-5 text-primary" />
									<span className="text-sm font-semibold">
										Interactive Learning Tools
									</span>
								</div>
								<div className="flex items-center space-x-3">
									<Award className="h-5 w-5 text-primary" />
									<span className="text-sm font-semibold">
										Certified Achievements
									</span>
								</div>
							</div>
							<div className="pt-4">
								<Link to="/signup" className="block">
									<Button className="w-full">Start Learning Today</Button>
								</Link>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="text-center pb-6">
							<div className="mx-auto mb-4 p-3 bg-primary rounded-2xl w-fit">
								<UserCheck className="h-12 w-12 text-primary-foreground" />
							</div>
							<CardTitle className="text-2xl mb-3 font-bold">
								For Tutors
							</CardTitle>
							<CardDescription className="text-sm font-medium">
								Share your expertise and build a thriving teaching career
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-3">
								<div className="flex items-center space-x-3">
									<TrendingUp className="h-5 w-5 text-primary" />
									<span className="text-sm font-semibold">
										Grow Your Income
									</span>
								</div>
								<div className="flex items-center space-x-3">
									<Calendar className="h-5 w-5 text-primary" />
									<span className="text-sm font-semibold">
										Flexible Schedule
									</span>
								</div>
								<div className="flex items-center space-x-3">
									<BookOpen className="h-5 w-5 text-primary" />
									<span className="text-sm font-semibold">
										Create Custom Courses
									</span>
								</div>
								<div className="flex items-center space-x-3">
									<Star className="h-5 w-5 text-primary" />
									<span className="text-sm font-semibold">
										Build Your Reputation
									</span>
								</div>
							</div>
							<div className="pt-4">
								<Link to="/signup" className="block">
									<Button className="w-full">Become a Tutor</Button>
								</Link>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="text-center pb-6">
							<div className="mx-auto mb-4 p-3 bg-primary rounded-2xl w-fit">
								<Heart className="h-12 w-12 text-primary-foreground" />
							</div>
							<CardTitle className="text-2xl mb-3 font-bold">
								For Parents
							</CardTitle>
							<CardDescription className="text-sm font-medium">
								Support your child's educational journey with confidence
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-3">
								<div className="flex items-center space-x-3">
									<TrendingUp className="h-5 w-5 text-primary" />
									<span className="text-sm font-semibold">
										Track Learning Progress
									</span>
								</div>
								<div className="flex items-center space-x-3">
									<Shield className="h-5 w-5 text-primary" />
									<span className="text-sm font-semibold">
										Verified Tutor Profiles
									</span>
								</div>
								<div className="flex items-center space-x-3">
									<Clock className="h-5 w-5 text-primary" />
									<span className="text-sm font-semibold">
										Flexible Scheduling
									</span>
								</div>
								<div className="flex items-center space-x-3">
									<Star className="h-5 w-5 text-primary" />
									<span className="text-sm font-semibold">
										Safety & Security
									</span>
								</div>
							</div>
							<div className="pt-4">
								<Link to="/signup" className="block">
									<Button className="w-full">Get Started</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>

			<section className="container mx-auto px-4 py-20">
				<h2 className="text-4xl font-bold text-center mb-16">
					Why Choose Tutor Connect?
				</h2>
				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
					<Card>
						<CardHeader className="text-center">
							<Users className="h-12 w-12 text-primary mx-auto mb-4" />
							<CardTitle>Expert Tutors</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription>
								Learn from qualified professionals with proven track records in
								their fields.
							</CardDescription>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="text-center">
							<Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
							<CardTitle>Flexible Scheduling</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription>
								Book sessions that fit your schedule with our easy-to-use
								booking system.
							</CardDescription>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="text-center">
							<BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
							<CardTitle>Diverse Courses</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription>
								Access a wide range of subjects from mathematics to languages
								and beyond.
							</CardDescription>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="text-center">
							<Award className="h-12 w-12 text-primary mx-auto mb-4" />
							<CardTitle>Track Progress</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription>
								Monitor your learning journey with detailed analytics and
								progress reports.
							</CardDescription>
						</CardContent>
					</Card>
				</div>
			</section>

			<section className="container mx-auto px-4 py-20">
				<div className="bg-muted rounded-2xl p-8">
					<div className="text-center py-16">
						<Users className="h-24 w-24 text-primary mx-auto mb-6 opacity-60" />
						<h3 className="text-2xl font-semibold mb-4">
							Discover Amazing Tutors
						</h3>
						<p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
							Browse through our extensive network of qualified tutors across
							various subjects. Find the perfect match for your learning needs
							and start your educational journey today.
						</p>
						<div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
							<div className="bg-background rounded-lg p-6">
								<BookOpen className="h-8 w-8 text-primary mx-auto mb-3" />
								<h4 className="font-semibold mb-2">All Subjects</h4>
								<p className="text-muted-foreground text-sm">
									Mathematics, Science, Languages, Arts & more
								</p>
							</div>
							<div className="bg-background rounded-lg p-6">
								<Star className="h-8 w-8 text-primary mx-auto mb-3" />
								<h4 className="font-semibold mb-2">Verified Experts</h4>
								<p className="text-muted-foreground text-sm">
									Background-checked & certified professionals
								</p>
							</div>
							<div className="bg-background rounded-lg p-6">
								<Shield className="h-8 w-8 text-primary mx-auto mb-3" />
								<h4 className="font-semibold mb-2">Global Reach</h4>
								<p className="text-muted-foreground text-sm">
									Connect with tutors from around the world
								</p>
							</div>
						</div>
						<Link to="/ExpertTutors">
							<Button size="lg">
								View All Tutors
								<ChevronRight className="ml-2 h-5 w-5" />
							</Button>
						</Link>
					</div>
				</div>
			</section>

			<footer className="bg-muted py-16">
				<div className="container mx-auto px-4">
					<div className="grid md:grid-cols-4 gap-8">
						<div>
							<div className="flex items-center space-x-2 mb-4">
								<GraduationCap className="h-6 w-6 text-primary" />
								<span className="text-xl font-bold">Tutor Connect</span>
							</div>
							<p className="text-muted-foreground">
								Connecting students with expert tutors for personalized learning
								experiences.
							</p>
						</div>
						<div>
							<h3 className="font-semibold mb-4">For Students</h3>
							<ul className="space-y-2">
								<li>
									<Link to="/courses" className="hover:text-primary">
										Browse Courses
									</Link>
								</li>
								<li>
									<Link to="/dashboard" className="hover:text-primary">
										Dashboard
									</Link>
								</li>
								<li>
									<Link to="/signup" className="hover:text-primary">
										Sign Up
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h3 className="font-semibold mb-4">For Tutors</h3>
							<ul className="space-y-2">
								<li>
									<Link to="/signup" className="hover:text-primary">
										Become a Tutor
									</Link>
								</li>
								<li>
									<Link to="/tutor-profile" className="hover:text-primary">
										Tutor Dashboard
									</Link>
								</li>
								<li>
									<Link to="/Tutors" className="hover:text-primary">
										View All Tutors
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h3 className="font-semibold mb-4">Support</h3>
							<ul className="space-y-2">
								<li>
									<Link to="/login" className="hover:text-primary">
										Login
									</Link>
								</li>
								<li>
									<Link to="/signup" className="hover:text-primary">
										Contact Us
									</Link>
								</li>
							</ul>
						</div>
					</div>
					<div className="border-t mt-12 pt-8 text-center text-muted-foreground">
						<p>&copy; 2025 Tutor Connect. All rights reserved.</p>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default Index;