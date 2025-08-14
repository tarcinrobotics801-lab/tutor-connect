import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Users,
  BookOpen,
  GraduationCap,
  UserCheck,
  Search,
  Trash2,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { X, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { currentUser, removeTutor } = useApp();
  const [tutors, setTutors] = useState([]);
  const [pendingTutors, setPendingTutors] = useState([]);
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tutorRes, pendingTutorRes, studentRes, parentRes, courseRes] = await Promise.all([
          fetch("/api/admin/tutors"),
          fetch("/api/admin/pending-tutors"),
          fetch("/api/admin/students"),
          fetch("/api/admin/parents"),
          fetch("/api/admin/courses"),
        ]);

        const tutorsData = await tutorRes.json();
        const pendingTutorsData = await pendingTutorRes.json();
        const studentsData = await studentRes.json();
        const parentsData = await parentRes.json();
        const coursesData = await courseRes.json();

        setTutors(tutorsData.tutors || []);
        setPendingTutors(pendingTutorsData.tutors || []);
        setStudents(studentsData.students || []);
        setParents(parentsData.parents || []);
        setCourses(coursesData.courses || []);
      } catch (err) {
        console.error("Error loading admin data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  // Approve tutor handler
  const openReviewModal = (tutor: any) => {
    setSelectedTutor(tutor);
    setReviewModalOpen(true);
  };
  const closeReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedTutor(null);
  };
  const handleApproveTutor = async (tutorId: string) => {
    try {
      const res = await fetch(`/api/admin/approve-tutor/${tutorId}`, { method: "PATCH" });
      if (res.ok) {
        setPendingTutors((prev) => prev.filter((t) => t._id !== tutorId));
        toast({ title: "Tutor Approved", description: "Tutor has been approved." });
        // Optionally, refetch tutors to update the main list
      } else {
        toast({ title: "Error", description: "Failed to approve tutor.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to approve tutor.", variant: "destructive" });
    }
  };

  // Reject tutor handler (no delete, PATCH with optional reason)
  const handleRejectTutor = async (tutorId: string) => {
    const rejectionReason = window.prompt("Are you sure you want to reject this tutor? Optionally, enter a rejection reason:");
    if (rejectionReason === null) return; // Cancelled
    try {
      const res = await fetch(`/api/admin/reject-tutor/${tutorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason }),
      });
      if (res.ok) {
        setPendingTutors((prev) => prev.filter((t) => t._id !== tutorId));
        toast({ title: "Tutor Rejected", description: "Tutor has been rejected.", variant: "destructive" });
      } else {
        toast({ title: "Error", description: "Failed to reject tutor.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to reject tutor.", variant: "destructive" });
    }
  };

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Access Denied</h3>
            <p className="text-gray-600">You need admin privileges to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="p-10 text-center text-gray-600">Loading dashboard...</div>;
  }

  const stats = {
    totalTutors: tutors.length,
    totalCourses: courses.length,
    totalStudents: students.length,
    totalParents: parents.length,
  };

  const filteredTutors = tutors.filter((tutor) =>
    tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tutor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tutor.subjects?.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredParents = parents.filter((parent) =>
    parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCourses = courses.filter((course) =>
    course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.sub.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.tutorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // make the handler async so we can await
  const handleRemoveTutor = async (tutorId: string, tutorName: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to remove tutor "${tutorName}"? This will also remove all their courses.`
    );
    if (!confirmDelete) return;
  
    const success = await removeTutor(tutorId); // ✅ returns boolean now
    if (success) {
      setTutors((prev) => prev.filter((t) => t._id !== tutorId));
      setCourses((prev) => prev.filter((c) => c.tutorId !== tutorId));
      toast({
        title: "Tutor Removed",
        description: `${tutorName} and all their courses have been deleted.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to remove tutor. Try again later.",
        variant: "destructive",
      });
    }
  
  
};

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Manage your Tutor Connect platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tutors</CardTitle>
              <GraduationCap className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.totalTutors}</div>
            </CardContent>
          </Card>

          <Card className="border-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">{stats.totalCourses}</div>
            </CardContent>
          </Card>

          <Card className="border-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalStudents}</div>
            </CardContent>
          </Card>

          <Card className="border-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Parents</CardTitle>
              <UserCheck className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.totalParents}</div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users, courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-purple-200 focus:border-purple-400"
            />
          </div>
        </div>


        <Tabs defaultValue="tutors" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-xl">
            <TabsTrigger value="tutors">Tutors</TabsTrigger>
            <TabsTrigger value="tutor-requests">Tutor Requests</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="parents">Parents</TabsTrigger>
          </TabsList>
          <TabsContent value="tutor-requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Tutor Requests</CardTitle>
                <CardDescription>Approve or reject tutors before they can add courses</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Qualification</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Subjects</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingTutors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-400">No pending tutor requests.</TableCell>
                      </TableRow>
                    ) : (
                      pendingTutors.map((tutor) => (
                        <TableRow key={tutor._id}>
                          <TableCell className="font-medium">{tutor.name}</TableCell>
                          <TableCell>{tutor.email}</TableCell>
                          <TableCell>{tutor.educationalQualification || "-"}</TableCell>
                          <TableCell>{tutor.yearsOfExperience || "-"}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {(tutor.subjects || []).map((subject) => (
                                <Badge key={subject} variant="secondary" className="text-xs">
                                  {subject}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={tutor.approvalStatus === "pending" ? "secondary" : tutor.approvalStatus === "approved" ? "default" : "destructive"}>
                              {tutor.approvalStatus ? tutor.approvalStatus.charAt(0).toUpperCase() + tutor.approvalStatus.slice(1) : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openReviewModal(tutor)}>
                              <Eye className="h-4 w-4 mr-1" /> Review
                            </Button>
                            <Button size="sm" variant="default" onClick={() => handleApproveTutor(tutor._id)}>
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleRejectTutor(tutor._id)}>
                              Reject
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                {/* Review Modal */}
                <Dialog open={reviewModalOpen} onOpenChange={closeReviewModal}>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Tutor Profile Review</DialogTitle>
                      <Button variant="ghost" className="absolute top-2 right-2" onClick={closeReviewModal}><X /></Button>
                    </DialogHeader>
                    {selectedTutor && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left: Profile Card */}
                        <div className="col-span-1 flex flex-col items-center border rounded-lg p-4 bg-gray-50">
                          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                            {/* Profile photo if available */}
                            <span className="text-4xl text-gray-400">{selectedTutor.name?.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="font-bold text-lg">{selectedTutor.name}</div>
                          <div className="text-sm text-gray-500 mb-1">{selectedTutor.educationalQualification}</div>
                          <Badge variant="secondary" className="mb-2">{selectedTutor.approvalStatus ? selectedTutor.approvalStatus.charAt(0).toUpperCase() + selectedTutor.approvalStatus.slice(1) : "Pending"}</Badge>
                          <div className="text-xs text-gray-600">{selectedTutor.email}</div>
                          <div className="text-xs text-gray-600">{selectedTutor.phoneNumber}</div>
                          <div className="text-xs text-gray-600">{selectedTutor.yearsOfExperience} years of exp.</div>
                          {selectedTutor.linkedinLink && <div className="text-xs text-blue-600"><a href={selectedTutor.linkedinLink} target="_blank" rel="noopener noreferrer">Meeting Link Available</a></div>}
                        </div>
                        {/* Middle: Details */}
                        <div className="col-span-2 grid gap-4">
                          <div className="border rounded-lg p-3">
                            <div className="font-semibold mb-1">Biography</div>
                            <div className="text-gray-700 text-sm">{selectedTutor.bio || "-"}</div>
                          </div>
                          <div className="border rounded-lg p-3">
                            <div className="font-semibold mb-1">Subjects</div>
                            <div className="flex flex-wrap gap-2">
                              {(selectedTutor.subjects || []).map((subject: string) => (
                                <Badge key={subject} variant="secondary">{subject}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="border rounded-lg p-3">
                            <div className="font-semibold mb-1">Availability</div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                              {selectedTutor.availability && Object.entries(selectedTutor.availability).map(([day, info]: any) => (
                                <div key={day}>
                                  <span className="font-semibold capitalize">{day}:</span> {info.available ? info.timeSlots?.join(", ") : "unavailable"}
                                </div>
                              ))}
                            </div>
                          </div>
                          {selectedTutor.linkedinLink && (
                            <div className="border rounded-lg p-3">
                              <div className="font-semibold mb-1">Meeting Information</div>
                              <div className="text-blue-600 text-xs"><a href={selectedTutor.linkedinLink} target="_blank" rel="noopener noreferrer">{selectedTutor.linkedinLink}</a></div>
                            </div>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border rounded-lg p-3">
                              <div className="font-semibold mb-1">Degree Certificates ({selectedTutor.certificates?.length || 0})</div>
                              <ul className="text-xs text-gray-700">
                                {(selectedTutor.certificates || []).map((cert: any, idx: number) => (
                                  <li key={idx} className="flex items-center gap-2 mb-1">
                                    <span>{cert.name}</span>
                                    <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">View</a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="border rounded-lg p-3">
                              <div className="font-semibold mb-1">Achievement Certificates ({selectedTutor.achievements?.length || 0})</div>
                              <ul className="text-xs text-gray-700">
                                {(selectedTutor.achievements || []).map((ach: any, idx: number) => (
                                  <li key={idx} className="flex items-center gap-2 mb-1">
                                    <span>{ach.name}</span>
                                    <a href={ach.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">View</a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <DialogFooter className="flex justify-end gap-2 mt-4">
                      <Button variant="secondary" onClick={closeReviewModal}>Cancel</Button>
                      {selectedTutor && <Button variant="destructive" onClick={() => { handleRejectTutor(selectedTutor._id); closeReviewModal(); }}>Reject</Button>}
                      {selectedTutor && <Button variant="default" onClick={() => { handleApproveTutor(selectedTutor._id); closeReviewModal(); }}>Approve</Button>}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tutors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tutors Management</CardTitle>
                <CardDescription>Manage registered tutors and their profiles</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Subjects</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTutors.map((tutor) => (
                      <TableRow key={tutor._id}>
                        <TableCell className="font-medium">{tutor.name}</TableCell>
                        <TableCell>{tutor.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(tutor.subjects || []).slice(0, 2).map((subject) => (
                              <Badge key={subject} variant="secondary" className="text-xs">
                                {subject}
                              </Badge>
                            ))}
                            {tutor.subjects?.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{tutor.subjects.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={tutor.profileCompleted ? "default" : "secondary"}>
                            {tutor.profileCompleted ? "Complete" : "Incomplete"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveTutor(tutor._id, tutor.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Courses Management</CardTitle>
                <CardDescription>View all courses available on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Title</TableHead>
                      <TableHead>Tutor</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCourses.map((course) => (
                      <TableRow key={course._id}>
                        <TableCell className="font-medium">{course.courseName}</TableCell>
                        <TableCell>{course.tutorName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{course.sub}</Badge>
                        </TableCell>
                        <TableCell>{course.level}</TableCell>
                        <TableCell>{course.pricePerSession}</TableCell>
                        <TableCell>
                          <Badge variant={course.pricePerSession === 0 ? "secondary" : "default"}>
                            {course.pricePerSession === 0 ? "Free" : "Paid"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Students Management</CardTitle>
                <CardDescription>View registered students</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>College</TableHead>
                      <TableHead>Status</TableHead>
                     
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student._id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.collegeName || "Not specified"}</TableCell>
                        <TableCell>
                          <Badge variant={student.profileCompleted ? "default" : "secondary"}>
                            {student.profileCompleted ? "Complete" : "Incomplete"}
                          </Badge>
                        </TableCell>
                      
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Parents Management</CardTitle>
                <CardDescription>View registered parents</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Occupation</TableHead>
                      <TableHead>Children</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParents.map((parent) => (
                      <TableRow key={parent._id}>
                        <TableCell className="font-medium">{parent.name}</TableCell>
                        <TableCell>{parent.email}</TableCell>
                        <TableCell>{parent.occupation || "Not specified"}</TableCell>
                        <TableCell>{parent.children?.length || 0}</TableCell>
                        <TableCell>
                          <Badge variant={parent.profileCompleted ? "default" : "secondary"}>
                            {parent.profileCompleted ? "Complete" : "Incomplete"}
                          </Badge>
                        </TableCell>
                        
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;