import { useApp } from "@/contexts/AppContext";
import { User } from "lucide-react";
import Navigation from "@/components/Navigation";
import ParentProfileForm from "@/components/ParentProfileForm";

const ParentProfile = () => {
	const { currentUser } = useApp();

	if (!currentUser || currentUser.role !== "parent") {
		return (
			<div className="min-h-screen bg-background">
				<Navigation />
				<div className="container mx-auto px-4 py-16">
					<div className="text-center">
						<div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
							<User className="h-12 w-12 text-primary" />
						</div>
						<h3 className="text-2xl font-semibold mb-3">Access Denied</h3>
						<p className="text-muted-foreground">
							Please sign up as a parent to access this page.
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<Navigation />
			<ParentProfileForm />
		</div>
	);
};

export default ParentProfile;
