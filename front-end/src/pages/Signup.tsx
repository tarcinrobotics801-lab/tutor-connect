// All other imports remain the same
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, User, GraduationCap, UserCheck, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

const isPasswordValid = (password: string) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
};

const isEmailValid = (email: string) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const isGmailValid = (email: string) => {
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  return gmailRegex.test(email);
};

const isPhoneNumberValid = (phoneNumber: string) => {
  // Remove all non-digit characters for validation
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Check for Indian phone number format
  // Can be 10 digits (without country code) or 12 digits (with 91 country code)
  const indianPhoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  
  return indianPhoneRegex.test(phoneNumber.replace(/\s/g, ''));
};

const formatPhoneNumber = (phoneNumber: string) => {
  // Remove all non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // If it starts with +91, keep it as is
  if (cleaned.startsWith('+91')) {
    return cleaned;
  }
  
  // If it starts with 91 and has 12 digits total, add +
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return '+' + cleaned;
  }
  
  // If it's 10 digits and starts with 6-9, add +91
  if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
    return '+91' + cleaned;
  }
  
  return cleaned;
};

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addUser, setCurrentUser } = useApp();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: ""
  });
  const [role, setRole] = useState("student");
  const [tutorCount, setTutorCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const canStudentRegister = tutorCount >= 0 && courseCount >= 0;
  const showStudentRestriction = role === "student" && !canStudentRegister;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Format phone number as user types
    if (e.target.name === 'phoneNumber') {
      value = formatPhoneNumber(value);
    }
    
    setFormData({ ...formData, [e.target.name]: value });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return false;
    }

    if (!formData.email.trim()) {
      toast({ title: "Error", description: "Email is required", variant: "destructive" });
      return false;
    }

    if (!isEmailValid(formData.email)) {
      toast({ 
        title: "Email Error", 
        description: "Please enter a valid email address", 
        variant: "destructive" 
      });
      return false;
    }

    // Optional: Uncomment if you want to enforce Gmail specifically
    // if (!isGmailValid(formData.email)) {
    //   toast({ 
    //     title: "Email Error", 
    //     description: "Please use a Gmail address", 
    //     variant: "destructive" 
    //   });
    //   return false;
    // }

    if (!formData.phoneNumber.trim()) {
      toast({ title: "Error", description: "Phone number is required", variant: "destructive" });
      return false;
    }

    if (!isPhoneNumberValid(formData.phoneNumber)) {
      toast({
        title: "Phone Number Error",
        description: "Please enter a valid Indian phone number (10 digits starting with 6-9)",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.password) {
      toast({ title: "Error", description: "Password is required", variant: "destructive" });
      return false;
    }

    if (!isPasswordValid(formData.password)) {
      toast({
        title: "Password Error",
        description: "Password must be at least 8 characters long and include uppercase, lowercase, digit, and special character.",
        variant: "destructive"
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Passwords don't match!", variant: "destructive" });
      return false;
    }

    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (role === "student" && !canStudentRegister) {
      toast({
        title: "Registration Unavailable",
        description: "Student registration is currently unavailable. Please check the requirements.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const signupData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        role
      };

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData)
      });

      const data = await response.json();

      if (response.ok && data.user) {
        addUser(data.user);
        setCurrentUser(data.user);
        toast({
          title: "Account Created",
          description: `Welcome ${data.user.name}!`,
        });

        switch (role) {
          case "tutor": navigate("/tutor-profile"); break;
          case "student": navigate("/student-profile"); break;
          case "parent": navigate("/parent-profile"); break;
          default: navigate("/parent-profile");
        }
      } else {
        toast({
          title: "Signup Error",
          description: data.message || "Failed to create account",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Network Error",
        description: "Unable to connect to server. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await fetch("/api/auth/counts");
        const data = await response.json();
        if (response.ok) {
          setTutorCount(data.tutorCount || 0);
          setCourseCount(data.courseCount || 0);
        }
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    fetchCounts();
  }, []);

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: ""
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-2xl font-bold text-gray-900">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span>Tutor Connect</span>
          </Link>
          <p className="text-gray-600 mt-2">Join our learning community today!</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Choose your role and fill in your details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={role} onValueChange={handleRoleChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="student"><User className="h-3 w-3" /> Student</TabsTrigger>
                <TabsTrigger value="tutor"><GraduationCap className="h-3 w-3" /> Tutor</TabsTrigger>
                <TabsTrigger value="parent"><UserCheck className="h-3 w-3" /> Parent</TabsTrigger>
              </TabsList>

              {["student", "tutor", "parent"].map((tabRole) => (
                <TabsContent key={tabRole} value={tabRole} className="mt-6">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${tabRole}-name`}>Full Name *</Label>
                      <Input 
                        id={`${tabRole}-name`} 
                        name="name" 
                        placeholder="Full Name" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        required 
                        disabled={isLoading || (tabRole === "student" && !canStudentRegister)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${tabRole}-email`}>Email *</Label>
                      <Input 
                        id={`${tabRole}-email`} 
                        name="email" 
                        type="email" 
                        placeholder="you@example.com" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        required 
                        disabled={isLoading || (tabRole === "student" && !canStudentRegister)} 
                      />
                      <p className="text-xs text-gray-500">
                        Please enter a valid email address
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${tabRole}-phone`}>Phone Number *</Label>
                      <Input 
                        id={`${tabRole}-phone`} 
                        name="phoneNumber" 
                        placeholder="+91 1234567890" 
                        value={formData.phoneNumber} 
                        onChange={handleInputChange} 
                        required 
                        disabled={isLoading || (tabRole === "student" && !canStudentRegister)} 
                      />
                      <p className="text-xs text-gray-500">
                        Enter Indian phone number (10 digits starting with 6-9)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${tabRole}-password`}>Password *</Label>
                      <Input 
                        id={`${tabRole}-password`} 
                        name="password" 
                        type="password" 
                        value={formData.password} 
                        onChange={handleInputChange} 
                        required 
                        disabled={isLoading || (tabRole === "student" && !canStudentRegister)} 
                      />
                      <p className="text-xs text-gray-500">
                        Password must be at least 8 characters, include uppercase, lowercase, digit, and special character.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${tabRole}-confirm`}>Confirm Password *</Label>
                      <Input 
                        id={`${tabRole}-confirm`} 
                        name="confirmPassword" 
                        type="password" 
                        value={formData.confirmPassword} 
                        onChange={handleInputChange} 
                        required 
                        disabled={isLoading || (tabRole === "student" && !canStudentRegister)} 
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className={`w-full ${tabRole === "tutor" ? "bg-teal-600 hover:bg-teal-700" : tabRole === "parent" ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"}`} 
                      disabled={isLoading || (tabRole === "student" && !canStudentRegister)}
                    >
                      {isLoading ? "Creating Account..." : `Create ${tabRole.charAt(0).toUpperCase() + tabRole.slice(1)} Account`}
                    </Button>
                  </form>
                </TabsContent>
              ))}

              {showStudentRestriction && (
                <Alert className="mt-4 border-amber-200 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    Student registration is currently unavailable. We need at least 5 tutors and 4 courses.
                    Current: {tutorCount} tutors, {courseCount} courses.
                  </AlertDescription>
                </Alert>
              )}
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;