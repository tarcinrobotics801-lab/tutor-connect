import { Button } from "@/components/ui/button";
import { BookOpen, User, LogOut } from "lucide-react";
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
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between items-center h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">Tutor Connect</span>
          </Link>

          {/* Main Navigation (always visible) */}
          <div className="flex items-center space-x-8">
            {(!currentUser || currentUser.role === "student" || currentUser.role === "parent") && (
              <>
                <Link to="/" className="text-white hover:text-white transition-colors font-bold">
                  Home
                </Link>
                <Link to="/courses" className="text-white hover:text-white transition-colors font-bold">
                  Courses
                </Link>
                <Link to="/resources" className="text-white hover:text-white transition-colors font-bold">
                  Resources
                </Link>
              </>
            )}
          </div>
          {/* User Menu or Auth Links */}
          <div className="flex items-center space-x-4">
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
