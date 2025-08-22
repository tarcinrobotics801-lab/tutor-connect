import { useState } from "react";
import { User, BarChart3, Bell, Calendar, Check, X } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StudentProfileForm from "@/components/StudentProfileForm";
import StudentDashboard from "@/pages/Dashboard";
import { useApp } from "@/contexts/AppContext";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

const StudentProfile = () => {
	const {
		currentUser,
		notifications,
		markNotificationAsRead,
		clearAllNotifications,
	} = useApp();
	const [activeTab, setActiveTab] = useState(
		currentUser?.profileCompleted ? "dashboard" : "profile"
	);

	if (!currentUser || currentUser.role !== "student") {
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
							Please sign up as a student to access this page.
						</p>
					</div>
				</div>
			</div>
		);
	}

	const getNotificationIcon = (type: string) => {
		switch (type) {
			case "booking_request":
				return <Calendar className="h-4 w-4 text-blue-500" />;
			case "booking_accepted":
				return <Check className="h-4 w-4 text-green-500" />;
			case "booking_rejected":
				return <X className="h-4 w-4 text-red-500" />;
			default:
				return <Bell className="h-4 w-4 text-gray-500" />;
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInHours = Math.floor(
			(now.getTime() - date.getTime()) / (1000 * 60 * 60)
		);
		if (diffInHours < 1) return "Just now";
		if (diffInHours < 24) return `${diffInHours}h ago`;
		return date.toLocaleDateString();
	};

	const handleNotificationClick = (notificationId: string) => {
		markNotificationAsRead(notificationId);
	};

	const unreadCount = notifications.filter((n) => !n.read).length;

	return (
		<div className="min-h-screen bg-background">
			<Navigation />
			<div className="container mx-auto px-4 py-8">
				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="w-full"
				>
					<TabsList className="grid w-full grid-cols-3 max-w-md">
						<TabsTrigger
							value="dashboard"
							className="flex items-center gap-2"
							disabled={!currentUser.profileCompleted}
						>
							<BarChart3 className="h-4 w-4" />
							Dashboard
						</TabsTrigger>
						<TabsTrigger value="profile" className="flex items-center gap-2">
							<User className="h-4 w-4" />
							Profile Settings
						</TabsTrigger>
						<TabsTrigger
							value="notifications"
							className="flex items-center gap-2"
							disabled={!currentUser.profileCompleted}
						>
							<Bell className="h-4 w-4" />
							Notifications
							{unreadCount > 0 && (
								<Badge
									variant="destructive"
									className="ml-1 h-4 w-4 text-xs p-0 flex items-center justify-center"
								>
									{unreadCount}
								</Badge>
							)}
						</TabsTrigger>
					</TabsList>

					<TabsContent value="dashboard" className="mt-8">
						<StudentDashboard />
					</TabsContent>

					<TabsContent value="profile" className="mt-8">
						<StudentProfileForm />
					</TabsContent>

					<TabsContent value="notifications" className="mt-8">
						<Card>
							<CardHeader>
								<div className="flex justify-between items-center">
									<CardTitle className="text-2xl font-bold flex items-center gap-2">
										<Bell className="h-6 w-6" />
										Notifications
										{unreadCount > 0 && (
											<Badge
												variant="destructive"
												className="h-6 w-6 flex items-center justify-center p-0 text-xs"
											>
												{unreadCount}
											</Badge>
										)}
									</CardTitle>

									{notifications.length > 0 && (
										<Button
											onClick={() => clearAllNotifications(currentUser._id)}
											variant="destructive"
											size="sm"
										>
											Clear All
										</Button>
									)}
								</div>
								<CardDescription>
									Stay updated with booking requests and tutor responses
								</CardDescription>
							</CardHeader>

							<CardContent>
								<ScrollArea className="h-80">
									{notifications.length === 0 ? (
										<div className="text-center py-16 text-muted-foreground">
											<Bell className="h-16 w-16 mx-auto mb-4" />
											<p className="text-lg">No notifications yet</p>
											<p className="text-sm">
												You’ll see updates here when tutors respond to your
												booking requests
											</p>
										</div>
									) : (
										<div className="space-y-4">
											{notifications.map((notification) => (
												<Card
													key={notification._id}
													className={`cursor-pointer hover:bg-muted/50 transition-colors ${
														!notification.read
															? "border-primary/50 bg-primary/10"
															: ""
													}`}
													onClick={() =>
														handleNotificationClick(notification._id)
													}
												>
													<CardContent className="p-4">
														<div className="flex items-start gap-3">
															{getNotificationIcon(notification.type)}
															<div className="flex-1 min-w-0">
																<div className="flex items-center justify-between">
																	<p className="font-medium text-sm">
																		{notification.title}
																	</p>
																	<div className="flex items-center gap-2">
																		<p className="text-xs text-muted-foreground">
																			{formatDate(notification.createdAt)}
																		</p>
																		{!notification.read && (
																			<div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
																		)}
																	</div>
																</div>
																<div className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
																	{notification.message}
																	{(() => {
																		const urlMatch =
																			notification.message.match(
																				/https?:\/\/[^\s]+/
																			);
																		if (urlMatch && urlMatch[0]) {
																			return (
																				<div className="mt-3">
																					<Button
																						size="sm"
																						onClick={(e) => {
																							e.stopPropagation();
																							window.open(urlMatch[0], "_blank");
																						}}
																					>
																						Join Meeting
																					</Button>
																				</div>
																			);
																		}
																		return null;
																	})()}
																</div>
															</div>
														</div>
													</CardContent>
												</Card>
											))}
										</div>
									)}
								</ScrollArea>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
};

export default StudentProfile;
