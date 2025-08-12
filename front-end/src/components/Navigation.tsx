import { Button } from "@/components/ui/button";
import { BookOpen, User, LogOut,GraduationCap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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

const Navigation = () => {
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
    <nav className="bg-gradient-to-r from-violet-600 to-violet-600 shadow-lg border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="py-3 grid grid-cols-3 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 group-hover:shadow-2xl group-hover:shadow-purple-500/30 transition-all duration-300">
              <GraduationCap className="h-8 w-8 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
          <div>
              <span className="text-2xl font-bold text-white group-hover:text-purple-200 transition-colors duration-300">TUTOR</span>
              <span className="text-xl font-light text-purple-300 ml-1 group-hover:text-purple-200 transition-colors duration-300">CONNECT</span>
              <div className="text-xs text-purple-200 group-hover:text-purple-100 transition-colors duration-300">NETWORK</div>
            </div>
          </Link>

          {/* Main Navigation (always visible) */}
          <div className="flex items-center space-x-8">
            {(!currentUser || currentUser.role === "student" || currentUser.role === "parent" || currentUser.role === "tutor" ) && (
              <>
                <Link to="/" className="text-white hover:text-purple-300 transition-colors font-bold">
                  Home
                </Link>
                <Link to="/courses" className="text-white hover:text-purple-300 transition-colors font-bold">
                  Discover Courses & Tutors
                </Link>
                <Link to="/resources" className="text-white hover:text-purple-300 transition-colors font-bold">
                  Free Tutor Notes
                </Link>
              </>
            )}
          </div>
          {/* User Menu or Auth Links */}
          <div className="flex justify-end items-center space-x-4">
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
                      <Link to="/student-profile" className="flex items-center">
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
                  <Button variant="ghost" className="text-white hover:bg-white/20">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-white text-blue-600 hover:bg-gray-100">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navigation;
