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
  const [selectedTutor, setSelectedTutor] = useState(null);
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
  const openReviewModal = (tutor) => {
    setSelectedTutor(tutor);
    setReviewModalOpen(true);
  };
  
  const closeReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedTutor(null);
  };
  
  const handleApproveTutor = async (tutorId) => {
    try {
      const res = await fetch(`/api/admin/approve-tutor/${tutorId}`, { method: "PATCH" });
      if (res.ok) {
        setPendingTutors((prev) => prev.filter((t) => t._id !== tutorId));
        toast({ title: "Tutor Approved", description: "Tutor has been approved." });
      } else {
        toast({ title: "Error", description: "Failed to approve tutor.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to approve tutor.", variant: "destructive" });
    }
  };

  // Reject tutor handler (no delete, PATCH with optional reason)
  const handleRejectTutor = async (tutorId) => {
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
  const handleRemoveTutor = async (tutorId, tutorName) => {
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

                {/* Enhanced Scrollable Review Modal */}
                <Dialog open={reviewModalOpen} onOpenChange={closeReviewModal}>
                  <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
                    <DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
                      <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-semibold">Tutor Profile Review</DialogTitle>
                        <Button variant="ghost" size="sm" onClick={closeReviewModal}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </DialogHeader>
                    
                    {selectedTutor && (
                      <div className="flex-1 overflow-hidden">
                        <div className="h-full overflow-y-auto px-6 pb-6">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                            {/* Left: Profile Card - Fixed */}
                            <div className="lg:col-span-1">
                              <div className="sticky top-0 bg-white">
                                <div className="border rounded-lg p-6 bg-gradient-to-br from-gray-50 to-white shadow-sm">
                                  <div className="text-center">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center mx-auto mb-4">
                                      <span className="text-2xl font-bold text-purple-600">
                                        {selectedTutor.name?.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 mb-2">{selectedTutor.name}</h3>
                                    <p className="text-sm text-gray-600 mb-3">{selectedTutor.educationalQualification}</p>
                                    <Badge 
                                      variant={selectedTutor.approvalStatus === "pending" ? "secondary" : selectedTutor.approvalStatus === "approved" ? "default" : "destructive"}
                                      className="mb-4"
                                    >
                                      {selectedTutor.approvalStatus ? selectedTutor.approvalStatus.charAt(0).toUpperCase() + selectedTutor.approvalStatus.slice(1) : "Pending"}
                                    </Badge>
                                    
                                    <div className="space-y-2 text-sm text-gray-600">
                                      <div className="flex items-center justify-center gap-2">
                                        <span>📧</span>
                                        <span className="truncate">{selectedTutor.email}</span>
                                      </div>
                                      {selectedTutor.phoneNumber && (
                                        <div className="flex items-center justify-center gap-2">
                                          <span>📱</span>
                                          <span>{selectedTutor.phoneNumber}</span>
                                        </div>
                                      )}
                                      <div className="flex items-center justify-center gap-2">
                                        <span>🎓</span>
                                        <span>{selectedTutor.yearsOfExperience} years experience</span>
                                      </div>
                                      {selectedTutor.linkedinLink && (
                                        <div className="mt-3">
                                          <a 
                                            href={selectedTutor.linkedinLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-blue-600 hover:text-blue-800 text-xs underline"
                                          >
                                            🔗 LinkedIn Link Available
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Right: Scrollable Details */}
                            <div className="lg:col-span-2 space-y-6">
                              {/* Biography */}
                              <div className="border rounded-lg p-4 bg-white shadow-sm">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <span>📝</span>
                                  Biography
                                </h4>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                  {selectedTutor.bio || "No biography provided."}
                                </p>
                              </div>

                              {/* Subjects */}
                              <div className="border rounded-lg p-4 bg-white shadow-sm">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <span>📚</span>
                                  Subjects
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {(selectedTutor.subjects || []).map((subject) => (
                                    <Badge key={subject} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                      {subject}
                                    </Badge>
                                  ))}
                                  {(!selectedTutor.subjects || selectedTutor.subjects.length === 0) && (
                                    <span className="text-gray-400 text-sm">No subjects specified</span>
                                  )}
                                </div>
                              </div>

                              {/* Availability */}
                              <div className="border rounded-lg p-4 bg-white shadow-sm">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <span>📅</span>
                                  Availability
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {selectedTutor.availability && Object.entries(selectedTutor.availability).map(([day, info]) => (
                                    <div key={day} className="bg-gray-50 p-3 rounded-md">
                                      <div className="font-medium text-sm text-gray-900 capitalize mb-1">{day}</div>
                                      <div className="text-xs text-gray-600">
                                        {(info as { available: boolean; timeSlots?: string[] }).available ? (
                                          (info as { available: boolean; timeSlots?: string[] }).timeSlots?.length > 0 ? (
                                            <div className="space-y-1">
                                              {(info as { available: boolean; timeSlots?: string[] }).timeSlots.map((slot, idx) => (
                                                <div key={idx} className="bg-white px-2 py-1 rounded text-xs">
                                                  {slot}
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            "Available (no time slots specified)"
                                          )
                                        ) : (
                                          <span className="text-gray-400">Unavailable</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                  {(!selectedTutor.availability || Object.keys(selectedTutor.availability).length === 0) && (
                                    <span className="text-gray-400 text-sm col-span-2">No availability information provided</span>
                                  )}
                                </div>
                              </div>

                              {/* Meeting Information */}
                              {selectedTutor.linkedinLink && (
                                <div className="border rounded-lg p-4 bg-white shadow-sm">
                                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <span>🔗</span>
                                    LinkedIn Profile
                                  </h4>
                                  <div className="bg-blue-50 p-3 rounded-md">
                                    <a 
                                      href={selectedTutor.linkedinLink} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="text-blue-600 hover:text-blue-800 text-sm underline break-all"
                                    >
                                      {selectedTutor.linkedinLink}
                                    </a>
                                  </div>
                                </div>
                              )}


                              {/* Certificates and Achievements */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Degree Certificates */}
                                <div className="border rounded-lg p-4 bg-white shadow-sm">
                                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <span>🎓</span>
                                    Degree Certificates ({selectedTutor.certificates?.length || 0})
                                  </h4>
                                  <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {(selectedTutor.certificates || []).map((cert, idx) => (
                                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-medium text-blue-600">📄</span>
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium text-gray-900">{cert.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                              Uploaded on {new Date(cert.uploadedAt || Date.now()).toLocaleDateString()}
                                            </p>
                                          </div>
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => window.open(cert.url, '_blank')}
                                          className="p-2"
                                        >
                                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                          </svg>
                                        </Button>
                                      </div>
                                    ))}
                                    {(!selectedTutor.certificates || selectedTutor.certificates.length === 0) && (
                                      <span className="text-gray-400 text-sm">No certificates uploaded</span>
                                    )}
                                  </div>
                                </div>

                                {/* Achievement Certificates */}
                                <div className="border rounded-lg p-4 bg-white shadow-sm">
                                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <span>🏆</span>
                                    Achievement Certificates ({selectedTutor.achievements?.length || 0})
                                  </h4>
                                  <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {(selectedTutor.achievements || []).map((ach, idx) => (
                                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-medium text-yellow-600">🏆</span>
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium text-gray-900">{ach.name}</p>
                                            <Badge variant="secondary" className="text-xs mt-1">
                                              {ach.type || 'Achievement'}
                                            </Badge>
                                            <p className="text-xs text-gray-500 mt-1">
                                              Uploaded on {new Date(ach.uploadedAt || Date.now()).toLocaleDateString()}
                                            </p>
                                          </div>
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => window.open(ach.url, '_blank')}
                                          className="p-2"
                                        >
                                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                          </svg>
                                        </Button>
                                      </div>
                                    ))}
                                    {(!selectedTutor.achievements || selectedTutor.achievements.length === 0) && (
                                      <span className="text-gray-400 text-sm">No achievements uploaded</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <DialogFooter className="p-6 pt-4 border-t bg-gray-50 flex-shrink-0">
                      <div className="flex justify-end gap-3 w-full">
                        <Button variant="outline" onClick={closeReviewModal}>
                          Cancel
                        </Button>
                        {selectedTutor && (
                          <>
                            <Button 
                              variant="destructive" 
                              onClick={() => { 
                                handleRejectTutor(selectedTutor._id); 
                                closeReviewModal(); 
                              }}
                            >
                              Reject
                            </Button>
                            <Button 
                              variant="default" 
                              onClick={() => { 
                                handleApproveTutor(selectedTutor._id); 
                                closeReviewModal(); 
                              }}
                            >
                              Approve
                            </Button>
                          </>
                        )}
                      </div>
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