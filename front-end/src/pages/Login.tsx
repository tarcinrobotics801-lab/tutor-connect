import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { toast } = useToast();
	const navigate = useNavigate();
	const { loginUser } = useApp();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const user = await loginUser(email, password);
			if (user) {
				console.log("📦 Login response data:", user);

				toast({
					title: "Welcome back!",
					description: `Successfully logged in as ${user.name}`,
				});

				if (user.role === "admin") {
					navigate("/admin");
				} else if (user.role === "tutor") {
					navigate("/tutor-profile");
				} else if (user.role === "student") {
					navigate("/student-profile");
				} else if (user.role === "parent") {
					navigate("/parent-profile");
				}
			} else {
				toast({
					title: "Login Failed",
					description: "Invalid email or password. Please try again.",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Something went wrong. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<div className="flex justify-center mb-8">
					<Link to="/" className="flex items-center space-x-2">
						<GraduationCap className="h-10 w-10 text-primary" />
						<span className="text-2xl font-bold">Tutor Connect</span>
					</Link>
				</div>

				<Card>
					<CardHeader className="space-y-1 text-center">
						<CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
						<CardDescription>
							Sign in to your account to continue learning or teaching
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<div className="relative">
									<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
									<Input
										id="email"
										type="email"
										placeholder="Enter your email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="pl-10"
										required
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
									<Input
										id="password"
										type="password"
										placeholder="Enter your password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="pl-10"
										required
									/>
								</div>
							</div>

							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? "Signing In..." : "Sign In"}
							</Button>
						</form>

						<div className="mt-6 text-center">
							<p className="text-sm text-muted-foreground">
								Don't have an account?{" "}
								<Link to="/signup" className="text-primary hover:underline">
									Sign up here
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default Login;