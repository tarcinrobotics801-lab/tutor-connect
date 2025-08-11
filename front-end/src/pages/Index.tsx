import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Calendar, Award, GraduationCap, Search, User, Settings, LogOut, UserCheck, BookOpenCheck, Target, Zap, TrendingUp, Heart, Clock, Shield, Star, MapPin, DollarSign, ChevronRight, Filter } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { currentUser, setCurrentUser } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
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
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900 relative overflow-hidden">
      {/* Professional Background Image Overlay */}
      <div 
        className="absolute inset-0 opacity-10 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')"
        }}
      ></div>
      {/* Enhanced floating background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl animate-pulse animation-delay-0"></div>
        <div className="absolute top-40 right-32 w-32 h-32 bg-blue-500/25 rounded-full blur-2xl animate-pulse animation-delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 right-20 w-36 h-36 bg-violet-500/25 rounded-full blur-2xl animate-pulse animation-delay-500"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-400/15 rounded-full blur-3xl animate-pulse animation-delay-3000"></div>
        
        {/* Additional floating orbs */}
        <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl animate-bounce animation-delay-1500"></div>
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-purple-400/25 rounded-full blur-xl animate-bounce animation-delay-2500"></div>
      </div>

      {/* Promotional Banner */}
      <div className="bg-purple-600 text-white py-2 text-center text-sm relative z-10">
        <p className="animate-bounce">
          🎓 EXCLUSIVE DEAL: Enroll your courses free now! Limited time offer
        </p>
      </div>

      {/* Header - Updated Navigation */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 relative z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">TUTOR</span>
              <span className="text-xl font-light text-purple-300 ml-1">CONNECT</span>
              <div className="text-xs text-purple-200">NETWORK</div>
            </div>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-white hover:text-purple-300 transition-colors font-bold">Home</Link>
            <Link to="/courses" className="text-white hover:text-purple-300 transition-colors font-bold">Discover Courses & Tutors</Link>
            <Link to="/resources" className="text-white hover:text-purple-300 transition-colors font-bold">Free Tutor Notes</Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
              <Input
                placeholder="Search..."
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm"
              />
            </div>
            
            {/* Dynamic Authentication Section */}
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-white/20">
                    <Avatar className="h-8 w-8">
                      {currentUser.photo ? (
                        <AvatarImage src={currentUser.photo} alt={currentUser.name} />
                      ) : (
                        <AvatarFallback className="bg-white/20 text-white border-0">
                          {getInitials(currentUser.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{currentUser.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground capitalize">
                        {currentUser.role}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  {currentUser.role === 'tutor' && (
                    <DropdownMenuItem asChild>
                      <Link to="/tutor-profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile & Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {currentUser.role === 'student' && (
                    <DropdownMenuItem asChild>
                      <Link to="/student-profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile & Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {currentUser.role === 'parent' && (
                    <DropdownMenuItem asChild>
                      <Link to="/parent-profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>My Account</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {currentUser.role === 'admin' && (
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
                  <Button variant="outline" className="bg-purple-600 hover:bg-purple-700 text-white border-purple-500">
                    Log In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            WELCOME TO
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-400 to-purple-300">
              Tutor Connect Network
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-purple-100 mb-4 font-medium">
            "Connecting Minds Worldwide"
          </p>
          <p className="text-lg text-purple-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            Experience the power of education with us. We offer a seamless blend of 
            technology and learning, providing interactive lessons, virtual classrooms, and 
            personalized feedback.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 px-10 py-4 text-lg font-semibold rounded-lg shadow-2xl">
                Get Started
              </Button>
            </Link>
            <Link to="/courses">
              <Button size="lg" variant="outline" className="bg-purple-600 hover:bg-purple-700 px-10 py-4 text-lg font-semibold rounded-lg shadow-2xl">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Network Visualization Effect */}
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 opacity-30">
        <div className="relative w-96 h-96">
          {/* Geometric network pattern */}
          <div className="absolute inset-0">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              <defs>
                <linearGradient id="networkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A855F7" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>
              {/* Network lines */}
              <path d="M50,50 L150,80 L250,60 L350,90 M80,150 L180,120 L280,140 L380,110" 
                    stroke="url(#networkGradient)" strokeWidth="2" fill="none" opacity="0.6" />
              <path d="M50,200 L150,230 L250,210 L350,240 M80,300 L180,270 L280,290 L380,260" 
                    stroke="url(#networkGradient)" strokeWidth="2" fill="none" opacity="0.6" />
              {/* Network nodes */}
              <circle cx="50" cy="50" r="4" fill="#A855F7" opacity="0.8" />
              <circle cx="150" cy="80" r="4" fill="#7C3AED" opacity="0.8" />
              <circle cx="250" cy="60" r="4" fill="#A855F7" opacity="0.8" />
              <circle cx="350" cy="90" r="4" fill="#7C3AED" opacity="0.8" />
            </svg>
          </div>
        </div>
      </div>

      {/* Interactive Sections for Tutors and Students */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <h2 className="text-5xl font-bold text-center text-white mb-4">
          Choose Your Path
        </h2>
        <p className="text-xl text-center text-purple-200 mb-16">
          Whether you're here to learn or teach, we have the perfect solution for you
        </p>
        
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8 max-w-7xl mx-auto">
          {/* For Students */}
          <Card 
            className={`bg-white/90 backdrop-blur-xl border-2 border-blue-200/50 hover:border-blue-300/80 transition-all duration-700 hover:shadow-2xl hover:shadow-blue-500/30 transform hover:scale-105 hover:-translate-y-2 cursor-pointer group ${hoveredCard === 'students' ? 'scale-105 -translate-y-2 shadow-2xl shadow-blue-500/30' : ''}`}
            onMouseEnter={() => setHoveredCard('students')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl w-fit shadow-lg group-hover:shadow-2xl group-hover:shadow-blue-500/40 transition-all duration-500 group-hover:rotate-6">
                <BookOpenCheck className="h-12 w-12 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              <CardTitle className="text-2xl text-gray-800 mb-3 font-bold group-hover:text-blue-700 transition-colors duration-300">For Students</CardTitle>
              <CardDescription className="text-gray-600 text-sm font-medium group-hover:text-gray-700 transition-colors duration-300">
                Unlock your potential with personalized learning experiences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-all duration-300 hover:translate-x-2 group/item">
                  <Target className="h-5 w-5 text-blue-500 group-hover/item:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-semibold">Personalized Learning Paths</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-all duration-300 hover:translate-x-2 group/item">
                  <Users className="h-5 w-5 text-blue-500 group-hover/item:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-semibold">Expert Tutors Worldwide</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-all duration-300 hover:translate-x-2 group/item">
                  <Zap className="h-5 w-5 text-blue-500 group-hover/item:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-semibold">Interactive Learning Tools</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-all duration-300 hover:translate-x-2 group/item">
                  <Award className="h-5 w-5 text-blue-500 group-hover/item:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-semibold">Certified Achievements</span>
                </div>
              </div>
              <div className="pt-4">
                <Link to="/signup" className="block">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 text-base font-semibold rounded-lg shadow-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 hover:scale-105">
                    Start Learning Today
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* For Tutors */}
          <Card 
            className={`bg-white/90 backdrop-blur-xl border-2 border-purple-200/50 hover:border-purple-300/80 transition-all duration-700 hover:shadow-2xl hover:shadow-purple-500/30 transform hover:scale-105 hover:-translate-y-2 cursor-pointer group ${hoveredCard === 'tutors' ? 'scale-105 -translate-y-2 shadow-2xl shadow-purple-500/30' : ''}`}
            onMouseEnter={() => setHoveredCard('tutors')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl w-fit shadow-lg group-hover:shadow-2xl group-hover:shadow-purple-500/40 transition-all duration-500 group-hover:rotate-6">
                <UserCheck className="h-12 w-12 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              <CardTitle className="text-2xl text-gray-800 mb-3 font-bold group-hover:text-purple-700 transition-colors duration-300">For Tutors</CardTitle>
              <CardDescription className="text-gray-600 text-sm font-medium group-hover:text-gray-700 transition-colors duration-300">
                Share your expertise and build a thriving teaching career
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-700 hover:text-purple-600 transition-all duration-300 hover:translate-x-2 group/item">
                  <TrendingUp className="h-5 w-5 text-purple-500 group-hover/item:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-semibold">Grow Your Income</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700 hover:text-purple-600 transition-all duration-300 hover:translate-x-2 group/item">
                  <Calendar className="h-5 w-5 text-purple-500 group-hover/item:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-semibold">Flexible Schedule</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700 hover:text-purple-600 transition-all duration-300 hover:translate-x-2 group/item">
                  <BookOpen className="h-5 w-5 text-purple-500 group-hover/item:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-semibold">Create Custom Courses</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700 hover:text-purple-600 transition-all duration-300 hover:translate-x-2 group/item">
                  <Star className="h-5 w-5 text-purple-500 group-hover/item:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-semibold">Build Your Reputation</span>
                </div>
              </div>
              <div className="pt-4">
                <Link to="/signup" className="block">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-2.5 text-base font-semibold rounded-lg shadow-lg hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 hover:scale-105">
                    Become a Tutor
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          {/* For Parents */}
          <Card 
            className={`bg-white/90 backdrop-blur-xl border-2 border-green-200/50 hover:border-green-300/80 transition-all duration-700 hover:shadow-2xl hover:shadow-green-500/30 transform hover:scale-105 hover:-translate-y-2 cursor-pointer group ${hoveredCard === 'parents' ? 'scale-105 -translate-y-2 shadow-2xl shadow-green-500/30' : ''}`}
            onMouseEnter={() => setHoveredCard('parents')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl w-fit shadow-lg group-hover:shadow-2xl group-hover:shadow-green-500/40 transition-all duration-500 group-hover:rotate-6">
                <Heart className="h-12 w-12 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              <CardTitle className="text-2xl text-gray-800 mb-3 font-bold group-hover:text-green-700 transition-colors duration-300">For Parents</CardTitle>
              <CardDescription className="text-gray-600 text-sm font-medium group-hover:text-gray-700 transition-colors duration-300">
                Support your child's educational journey with confidence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-700 hover:text-green-600 transition-all duration-300 hover:translate-x-2 group/item">
                  <TrendingUp className="h-5 w-5 text-green-500 group-hover/item:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-semibold">Track Learning Progress</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700 hover:text-green-600 transition-all duration-300 hover:translate-x-2 group/item">
                  <Shield className="h-5 w-5 text-green-500 group-hover/item:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-semibold">Verified Tutor Profiles</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700 hover:text-green-600 transition-all duration-300 hover:translate-x-2 group/item">
                  <Clock className="h-5 w-5 text-green-500 group-hover/item:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-semibold">Flexible Scheduling</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700 hover:text-green-600 transition-all duration-300 hover:translate-x-2 group/item">
                  <Star className="h-5 w-5 text-green-500 group-hover/item:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-semibold">Safety & Security</span>
                </div>
              </div>
              <div className="pt-4">
                <Link to="/signup" className="block">
                  <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2.5 text-base font-semibold rounded-lg shadow-lg hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-500 hover:scale-105">
                    Get Started
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <h2 className="text-4xl font-bold text-center text-white mb-16">
          Why Choose Tutor Connect?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-purple-300 mx-auto mb-4" />
              <CardTitle className="text-white">Expert Tutors</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-purple-100">
                Learn from qualified professionals with proven track records in their fields.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/20">
            <CardHeader className="text-center">
              <Calendar className="h-12 w-12 text-violet-300 mx-auto mb-4" />
              <CardTitle className="text-white">Flexible Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-purple-100">
                Book sessions that fit your schedule with our easy-to-use booking system.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20">
            <CardHeader className="text-center">
              <BookOpen className="h-12 w-12 text-green-300 mx-auto mb-4" />
              <CardTitle className="text-white">Diverse Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-purple-100">
                Access a wide range of subjects from mathematics to languages and beyond.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20">
            <CardHeader className="text-center">
              <Award className="h-12 w-12 text-purple-300 mx-auto mb-4" />
              <CardTitle className="text-white">Track Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-purple-100">
                Monitor your learning journey with detailed analytics and progress reports.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Expert Tutors Section - New Section */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        
        {/* Tutors Display Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="text-center py-16">
            <Users className="h-24 w-24 text-purple-300 mx-auto mb-6 opacity-60" />
            <h3 className="text-2xl font-semibold text-white mb-4">
              Discover Amazing Tutors
            </h3>
            <p className="text-lg text-purple-200 mb-8 max-w-2xl mx-auto">
              Browse through our extensive network of qualified tutors across various subjects. 
              Find the perfect match for your learning needs and start your educational journey today.
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <BookOpen className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <h4 className="text-white font-semibold mb-2">All Subjects</h4>
                <p className="text-purple-200 text-sm">Mathematics, Science, Languages, Arts & more</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <Star className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
                <h4 className="text-white font-semibold mb-2">Verified Experts</h4>
                <p className="text-purple-200 text-sm">Background-checked & certified professionals</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <MapPin className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h4 className="text-white font-semibold mb-2">Global Reach</h4>
                <p className="text-purple-200 text-sm">Connect with tutors from around the world</p>
              </div>
            </div>
            <Link to="/ExpertTutors" >
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 hover:scale-105">
                View All Tutors
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 text-blue-900 text-center">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            <span className="inline-block text-white font-bold drop-shadow-sm">Efficiency.</span>{' '}
            <span className="inline-block text-white font-bold drop-shadow-sm">Security.</span>{' '}
            <span className="inline-block text-white font-bold drop-shadow-sm">Success.</span>
          </h2>
          <div className="w-20 h-1 mx-auto bg-white rounded-full mb-6"></div>

          <p className="text-lg md:text-xl text-white/80 font-light">
            That's what you get with <span className="font-semibold">Connect Education</span>.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-md text-white py-16 border-t border-white/10 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="h-6 w-6 text-purple-300" />
                <span className="text-xl font-bold">Tutor Connect</span>
              </div>
              <p className="text-purple-200">
                Connecting students with expert tutors for personalized learning experiences.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-purple-300">For Students</h3>
              <ul className="space-y-2 text-purple-100">
                <li><Link to="/courses" className="hover:text-white transition-colors">Browse Courses</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-purple-300">For Tutors</h3>
              <ul className="space-y-2 text-purple-100">
                <li><Link to="/signup" className="hover:text-white transition-colors">Become a Tutor</Link></li>
                <li><Link to="/tutor-profile" className="hover:text-white transition-colors">Tutor Dashboard</Link></li>
                <li><Link to="/Tutors" className="hover:text-white transition-colors">View All Tutors</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-purple-300">Support</h3>
              <ul className="space-y-2 text-purple-100">
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/signup" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-purple-200">
            <p>&copy; 2025 Tutor Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;