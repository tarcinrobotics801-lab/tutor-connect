import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Plus, Trash2, Search, Bell, Calendar, Check, X } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Child {
  id: string;
  name: string;
  age: number;
  class: string;
  schoolName: string;
  place: string;
}

const ParentProfileForm = () => {
  const { currentUser, updateUser, getUserNotifications, markNotificationAsRead } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState(currentUser?.profileCompleted ? "courses" : "profile");
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || "",
    occupation: currentUser?.occupation || "",
    parentType: currentUser?.parentType || "father",
    phoneNumber: currentUser?.phoneNumber || ""
  });
  
  const [children, setChildren] = useState<Child[]>(currentUser?.children || []);

  const notifications = currentUser ? getUserNotifications(currentUser._id) : [];
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addChild = () => {
    const newChild: Child = {
      id: Date.now().toString(),
      name: "",
      age: 0,
      class: "",
      schoolName: "",
      place: ""
    };
    setChildren(prev => [...prev, newChild]);
  };

  const updateChild = (id: string, field: keyof Child, value: string | number) => {
    setChildren(prev => prev.map(child => 
      child.id === id ? { ...child, [field]: value } : child
    ));
  };

  const removeChild = (id: string) => {
    setChildren(prev => prev.filter(child => child.id !== id));
  };

  const handleSaveProfile = () => {
    if (!profileData.name || !profileData.occupation || children.length === 0) {
      toast({
        title: "Incomplete Profile",
        description: "Please fill in all required fields and add at least one child.",
        variant: "destructive"
      });
      return;
    }

    const hasIncompleteChild = children.some(child => 
      !child.name || !child.age || !child.class || !child.schoolName || !child.place
    );

    if (hasIncompleteChild) {
      toast({
        title: "Incomplete Child Information",
        description: "Please complete all children details.",
        variant: "destructive"
      });
      return;
    }

    if (currentUser) {
      updateUser(currentUser._id, {
        ...profileData,
        children,
        profileCompleted: true
      });

      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully!",
      });

      setActiveTab("courses");
    }
  };

  const handleSearchCourses = () => {
    navigate("/courses");
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_request':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'booking_accepted':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'booking_rejected':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notificationId: string) => {
    markNotificationAsRead(notificationId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 max-w-md bg-white/80 backdrop-blur-sm border border-purple-200">
            <TabsTrigger 
              value="profile" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
            >
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="courses" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
              disabled={!currentUser?.profileCompleted}
            >
              <Search className="h-4 w-4" />
              Search Courses
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
              disabled={!currentUser?.profileCompleted}
            >
              <Bell className="h-4 w-4" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-8">
            <Card className="shadow-xl border-purple-100 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Parent Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => handleProfileChange("name", e.target.value)}
                      placeholder="Enter your full name"
                      className="border-purple-200 focus:border-purple-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation *</Label>
                    <Input
                      id="occupation"
                      value={profileData.occupation}
                      onChange={(e) => handleProfileChange("occupation", e.target.value)}
                      placeholder="e.g., Software Engineer, Doctor"
                      className="border-purple-200 focus:border-purple-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parentType">Parent Type *</Label>
                    <Select value={profileData.parentType} onValueChange={(value) => handleProfileChange("parentType", value)}>
                      <SelectTrigger className="border-purple-200 focus:border-purple-400">
                        <SelectValue placeholder="Select parent type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="father">Father</SelectItem>
                        <SelectItem value="mother">Mother</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={profileData.phoneNumber}
                      onChange={(e) => handleProfileChange("phoneNumber", e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="border-purple-200 focus:border-purple-400"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Children Details *</h3>
                    <Button 
                      onClick={addChild}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Child
                    </Button>
                  </div>

                  {children.map((child, index) => (
                    <Card key={child.id} className="p-4 border-purple-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Child {index + 1}</h4>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeChild(child.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Name *</Label>
                          <Input
                            value={child.name}
                            onChange={(e) => updateChild(child.id, "name", e.target.value)}
                            placeholder="Child's name"
                            className="border-purple-200 focus:border-purple-400"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Age *</Label>
                          <Input
                            type="number"
                            value={child.age || ""}
                            onChange={(e) => updateChild(child.id, "age", parseInt(e.target.value) || 0)}
                            placeholder="Age"
                            className="border-purple-200 focus:border-purple-400"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Class *</Label>
                          <Input
                            value={child.class}
                            onChange={(e) => updateChild(child.id, "class", e.target.value)}
                            placeholder="e.g., 5th Grade, Class 10"
                            className="border-purple-200 focus:border-purple-400"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>School Name *</Label>
                          <Input
                            value={child.schoolName}
                            onChange={(e) => updateChild(child.id, "schoolName", e.target.value)}
                            placeholder="School name"
                            className="border-purple-200 focus:border-purple-400"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label>Place *</Label>
                          <Input
                            value={child.place}
                            onChange={(e) => updateChild(child.id, "place", e.target.value)}
                            placeholder="City, State"
                            className="border-purple-200 focus:border-purple-400"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}

                  {children.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No children added yet. Click "Add Child" to get started.</p>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleSaveProfile}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Save Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="mt-8">
            <Card className="shadow-xl border-purple-100 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Search Courses
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-16">
                <Search className="h-16 w-16 text-purple-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Ready to Find Courses for Your Children?
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Browse through our extensive catalog of courses and find the perfect learning opportunities for your children.
                </p>
                <Button 
                  onClick={handleSearchCourses}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search Courses
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-8">
            <Card className="shadow-xl border-purple-100 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Bell className="h-6 w-6" />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="h-6 w-6 flex items-center justify-center p-0 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Stay updated with your children's booking requests and tutor responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  {notifications.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                      <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg">No notifications yet</p>
                      <p className="text-sm">You'll see updates here when tutors respond to your children's booking requests</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notifications.map((notification) => (
                        <Card 
                          key={notification.id}
                          className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                            !notification.read ? 'border-purple-200 bg-purple-50' : 'border-gray-200'
                          }`}
                          onClick={() => handleNotificationClick(notification.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {getNotificationIcon(notification.type)}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-sm text-gray-900">
                                    {notification.title}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs text-gray-400">
                                      {formatDate(notification.createdAt)}
                                    </p>
                                    {!notification.read && (
                                      <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0" />
                                    )}
                                  </div>
                                </div>
                                <div className="text-sm text-gray-600 mt-1 whitespace-pre-line">
  {notification.message}

  {/* Show Join Meeting button below the link */}
  {(() => {
    const urlMatch = notification.message.match(/https?:\/\/[^\s]+/);
    if (urlMatch && urlMatch[0]) {
      return (
        <div className="mt-3">
          <Button
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={(e) => {
              e.stopPropagation(); // don't trigger mark-as-read click
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

export default ParentProfileForm;
