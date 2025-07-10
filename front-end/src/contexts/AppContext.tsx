// src/context/AppContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

/* ------------------------------------------------------------------ */
/*                               TYPES                                */
/* ------------------------------------------------------------------ */
interface Child {
  id: string;
  name: string;
  age: number;
  class: string;
  schoolName: string;
  place: string;
}
interface Certificate {
  name: string;
  url: string;
  uploadedAt: string;
}
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "student" | "tutor" | "parent";
  profileCompleted: boolean;
  phoneNumber?: string;

  // Tutor‑specific --------------------------------------------
  bio?: string;
  educationalQualification?: string;
  yearsOfExperience?: string;
  subjects?: string[];
  availability?: {
    monday: { available: boolean; timeSlots: string[] };
    tuesday: { available: boolean; timeSlots: string[] };
    wednesday: { available: boolean; timeSlots: string[] };
    thursday: { available: boolean; timeSlots: string[] };
    friday: { available: boolean; timeSlots: string[] };
    saturday: { available: boolean; timeSlots: string[] };
    sunday: { available: boolean; timeSlots: string[] };
  };
  linkedinLink?: string;
  photo?: string;
  courseNames?: string[];
  certificates?: Certificate[];
  // Student‑specific ------------------------------------------
  yearOfStudent?: number;
  department?: string;
  collegeName?: string;
  city?: string;
  state?: string;
  enrolledCourses: string[];
  parentId?: string;

  // Timestamps -------------------------------------------------
  createdAt?: Date;
  updatedAt?: Date;

  occupation?: string;
  parentType?: 'father' | 'mother';
  children?: Child[];
}

export interface Course {
  _id: string;
  courseName: string;
  sub: string;
  level: string;
  pricePerSession: number;
  description: string;
  tag: string[];
  tutorId: string;
  tutorName?: string;
  createdAt: string;
  updatedAt: string;
}
interface TimeSlot {
  id: string;
  courseId: string;
  tutorId: string;
  day: string;
  time: string;
  maxMembers: number;
  currentMembers: number;
  enrolledUsers: string[];
}

interface BookingRequest {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  tutorId: string | { _id: string; name: string }; // ✅ Accept both formats
  tutorName: string;
  slotId: string;
  slotDay: string;
  slotTime: string;
  requestedAt: string;
  status: 'pending' | 'accepted' | 'rejected';
  meetingLink?: string;
  acceptedAt?: string;
}


interface Notification {
  id: string;
  userId: string;
  type: 'booking_request' | 'booking_accepted' | 'booking_rejected';
  title: string;
  message: string;
  bookingRequestId?: string;
  createdAt: string;
  read: boolean;
}


export interface Enrollment {
  _id: string;
  tutorId: string;
  courseId: string;
  studentId: string;
  courseName: string;
  enrollmentDate: string;
  status: "active" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

/** Payload sent when a student clicks “BookSession”. */
export type SessionPayload = Omit<
  Enrollment,
  "_id" | "status" | "createdAt" | "updatedAt" | "enrollmentDate"
> & { enrollmentDate?: string };

/* ------------------------------------------------------------------ */
/*                        CONTEXT INTERFACE                           */
/* ------------------------------------------------------------------ */

interface AppContextType {
  /* ---- global state ---- */
  users: User[];
  courses: Course[];
  enrollments: Enrollment[];
  timeSlots: TimeSlot[];
  bookingRequests: BookingRequest[];
  notifications: Notification[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;

  /* ---- user CRUD ---- */
  addUser: (user: User) => void;
  updateUser: (
    userId: string,
    updates: Partial<User>,
    opts?: { sendToServer?: boolean }
  ) => Promise<boolean>;
  setCurrentUser: (user: User | null) => void;
  loginUser: (email: string, password: string) => Promise<User | null>;
  logoutUser: () => void;

  /* ---- course CRUD ---- */
  addCourse: (course: Course) => void;
  updateCourse: (courseId: string, updates: Partial<Course>) => void;

  /* ---- enrollment CRUD ---- */
  addEnrollment: (enrollment: Enrollment) => void;
  updateEnrollment: (
    enrollmentId: string,
    updates: Partial<Enrollment>
  ) => void;

  /** Create a session → enrollment */
  addSession: (payload: SessionPayload) => Promise<boolean>;

  /* ---- queries/helpers ---- */
  getCompletedTutors: () => User[];
  getActiveCourses: () => Course[];
  canStudentRegister: () => boolean;
  getStudentEnrollments: (studentId: string) => Enrollment[];
  getTutorEnrollments: (tutorId: string) => Enrollment[];
  createTimeSlots: (courseId: string, tutorId: string) => void;
  getCourseTimeSlots: (courseId: string) => TimeSlot[];
  createBookingRequest: (request: Omit<BookingRequest, 'id' | 'requestedAt' | 'status'>) => void;
  getTutorBookingRequests: (tutorId: string) => BookingRequest[];
  acceptBookingRequest: (requestId: string, meetingLink: string) => void;
  rejectBookingRequest: (requestId: string) => void;
  getUserNotifications: (userId: string) => Notification[];
  markNotificationAsRead: (notificationId: string) => void;
  clearError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

/* ------------------------------------------------------------------ */
/*                           PROVIDER                                 */
/* ------------------------------------------------------------------ */

export const AppProvider = ({ children }: { children: ReactNode }) => {
  /* ---- top‑level state ---- */
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- localStorage I/O ----------------- */
  useEffect(() => {
    try {
      const u = localStorage.getItem("tutorConnect_users");
      const c = localStorage.getItem("tutorConnect_courses");
      const e = localStorage.getItem("tutorConnect_enrollments");
      const cu = localStorage.getItem("tutorConnect_currentUser");
      const savedTimeSlots = localStorage.getItem('tutorConnect_timeSlots');
      const savedBookingRequests = localStorage.getItem('tutorConnect_bookingRequests');
      const savedNotifications = localStorage.getItem('tutorConnect_notifications');

      if (u) setUsers(JSON.parse(u));
      if (c) setCourses(JSON.parse(c));
      if (e) setEnrollments(JSON.parse(e));
      if (cu) setCurrentUser(JSON.parse(cu));
      if (savedTimeSlots) setTimeSlots(JSON.parse(savedTimeSlots));
      if (savedBookingRequests) setBookingRequests(JSON.parse(savedBookingRequests));
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    } catch (err) {
      console.error("load localStorage:", err);
      setError("Failed to load saved data");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tutorConnect_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("tutorConnect_courses", JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem("tutorConnect_enrollments", JSON.stringify(enrollments));
  }, [enrollments]);

  useEffect(() => {
    localStorage.setItem('tutorConnect_timeSlots', JSON.stringify(timeSlots));
  }, [timeSlots]);

  useEffect(() => {
    localStorage.setItem('tutorConnect_bookingRequests', JSON.stringify(bookingRequests));
  }, [bookingRequests]);

  useEffect(() => {
    localStorage.setItem('tutorConnect_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (currentUser)
      localStorage.setItem("tutorConnect_currentUser", JSON.stringify(currentUser));
    else localStorage.removeItem("tutorConnect_currentUser");
  }, [currentUser]);

  /* ------------------ user CRUD ------------------ */
  const addUser = (user: User): void => setUsers((p) => [...p, user]);

  const updateUser = async (
    userId: string,
    updates: Partial<User>,
    opts: { sendToServer?: boolean } = { sendToServer: true }
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      /* optimistic update */
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, ...updates } : u))
      );
      if (currentUser && currentUser._id === userId)
        setCurrentUser({ ...currentUser, ...updates });

      if (opts.sendToServer) {
        const endpoint =
          currentUser?.role === "tutor"
            ? `/api/auth/tutor/${userId}/profile`
            : currentUser?.role === "parent"
              ? `/api/auth/parent/${userId}/profile`
              : `/api/auth/student/${userId}/profile`;

        const res = await fetch(endpoint, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updates),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `Server error: ${res.status}`);

        const updatedUser: User =
          data.student || data.tutor || data.user || { ...updates, _id: userId };

        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? updatedUser : u))
        );
        if (currentUser && currentUser._id === userId) setCurrentUser(updatedUser);
      }

      return true;
    } catch (err: any) {
      console.error("User update failed:", err);
      setError(err.message || "Update failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ course CRUD ------------------ */
  const addCourse = (course: Course): void => setCourses((p) => [...p, course]);

  const updateCourse = (courseId: string, updates: Partial<Course>): void =>
    setCourses((p) => p.map((c) => (c._id === courseId ? { ...c, ...updates } : c)));

  /* ---------------- enrollment CRUD ---------------- */
  const addEnrollment = (enrollment: Enrollment): void =>
    setEnrollments((p) => [...p, enrollment]);

  const updateEnrollment = (enrollmentId: string, updates: Partial<Enrollment>): void =>
    setEnrollments((p) =>
      p.map((e) => (e._id === enrollmentId ? { ...e, ...updates } : e))
    );

  /* -------------- NEW: addSession helper ------------ */
  /* -------------- addSession helper ------------ */
  const addSession = async (payload: SessionPayload): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to book session");

      const newEnrollment: Enrollment = data.enrollment;
      addEnrollment(newEnrollment);            // ✅ push into enrollments array

      /* ---------- KEEP currentUser.enrolledCourses IN‑SYNC ---------- */
      if (currentUser?.role === "student") {
        setCurrentUser((prev) =>
          prev
            ? {
              ...prev,
              enrolledCourses: Array.from(
                new Set([...(prev.enrolledCourses ?? []), newEnrollment.courseName])
              ),
            }
            : prev
        );

        // Optional: also reflect the change in the global `users` array
        setUsers((prev) =>
          prev.map((u) =>
            u._id === currentUser._id
              ? {
                ...u,
                enrolledCourses: Array.from(
                  new Set([...(u.enrolledCourses ?? []), newEnrollment.courseName])
                ),
              }
              : u
          )
        );
      }
      /* ---------------------------------------------------------------- */

      return true;
    } catch (err: any) {
      console.error("addSession error:", err);
      setError(err.message || "Session booking failed");
      return false;
    } finally {
      setLoading(false);
    }
  };
  const getDefaultTimeSlots = () => {
    return [
      { label: 'Morning Session', time: '9:00 AM - 12:00 PM' },
      { label: 'Afternoon Session', time: '1:00 PM - 4:00 PM' }
    ];
  };

  const createTimeSlots = (courseId: string, tutorId: string) => {
    console.log('Creating default time slots for course:', courseId, 'tutor:', tutorId);
    
    // Check if slots already exist for this course
    const existingSlots = timeSlots.filter(slot => slot.courseId === courseId);
    if (existingSlots.length > 0) {
      console.log('Time slots already exist for this course');
      return;
    }

    const newSlots: TimeSlot[] = [];
    const defaultSlots = getDefaultTimeSlots();
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    // Create slots for each day of the week with default time slots
    daysOfWeek.forEach((day) => {
      defaultSlots.forEach((slot, index) => {
        const slotId = `${courseId}-${day}-${index}-${Date.now()}`;
        newSlots.push({
          id: slotId,
          courseId,
          tutorId,
          day: day.charAt(0).toUpperCase() + day.slice(1), // Capitalize first letter
          time: slot.time,
          maxMembers: 10,
          currentMembers: 0,
          enrolledUsers: []
        });
      });
    });

    console.log('Created default slots:', newSlots);
    setTimeSlots(prev => [...prev, ...newSlots]);
  };

  const getCourseTimeSlots = (courseId: string) => {
    return timeSlots.filter(slot => slot.courseId === courseId);
  };
// Add these console logs in your AppContext createBookingRequest function
const createBookingRequest = (request: Omit<BookingRequest, 'id' | 'requestedAt' | 'status'>) => {
  console.log('🔄 Creating booking request:', request);
  
  const newRequest: BookingRequest = {
    ...request,
    id: Date.now().toString(),
    requestedAt: new Date().toISOString(),
    status: 'pending'
  };
  console.log('✅ New booking request created:', newRequest);
  
  setBookingRequests(prev => {
    const updated = [...prev, newRequest];
    console.log('📋 All booking requests after update:', updated);
    return updated;
  });
  const tutorId = typeof request.tutorId === 'object' 
    ? request.tutorId._id 
    : request.tutorId;
  
  // Create notification for tutor
  const notification: Notification = {
    id: `notif-${Date.now()}`,
    userId: tutorId, // ✅ Use the extracted tutorId
    type: 'booking_request',
    title: 'New Booking Request',
    message: `${request.studentName} has requested to book ${request.courseName} for ${request.slotDay} at ${request.slotTime}`,
    bookingRequestId: newRequest.id,
    createdAt: new Date().toISOString(),
    read: false
  };
  
  console.log('🔔 Creating notification for tutor:', notification);
  
  setNotifications(prev => {
    const updated = [...prev, notification];
    console.log('📬 All notifications after update:', updated);
    return updated;
  });
  
  console.log('✅ Booking request created and notification sent');
};

// Also add this to getTutorBookingRequests
// Add this debug code to your getTutorBookingRequests function to see the actual tutorId values:

const getTutorBookingRequests = (tutorId: string) => {
  console.log('🔍 Looking for tutor ID:', tutorId);
  console.log('🔍 All booking requests with their tutorIds:');
  
  bookingRequests.forEach((request, index) => {
    console.log(`Request ${index}:`, {
      tutorId: request.tutorId,
      tutorId_id: typeof request.tutorId === 'object' ? request.tutorId._id : request.tutorId,
      tutorName: typeof request.tutorId === 'object' ? request.tutorId.name : 'N/A',
      studentName: request.studentName,
      courseName: request.courseName
    });
  });
  
  const requests = bookingRequests.filter(request => {
    const requestTutorId = typeof request.tutorId === 'object' 
      ? request.tutorId._id 
      : request.tutorId;
    
    console.log(`Comparing: ${requestTutorId} === ${tutorId} = ${requestTutorId === tutorId}`);
    return requestTutorId === tutorId;
  });
  
  console.log(`📋 Found ${requests.length} requests for tutor ${tutorId}`);
  return requests;
};

  const acceptBookingRequest = (requestId: string, meetingLink: string) => {
    console.log('Accepting booking request:', requestId, 'with meeting link:', meetingLink);
    
    setBookingRequests(prev => prev.map(request => 
      request.id === requestId 
        ? { ...request, status: 'accepted' as const, meetingLink, acceptedAt: new Date().toISOString() }
        : request
    ));

    const request = bookingRequests.find(r => r.id === requestId);
    if (request) {
      // Update slot
      setTimeSlots(prev => prev.map(slot => 
        slot.id === request.slotId 
          ? { 
              ...slot, 
              currentMembers: slot.currentMembers + 1,
              enrolledUsers: [...slot.enrolledUsers, request.studentId]
            }
          : slot
      ));

      // Create notification for student/parent
      const notification: Notification = {
        id: `notif-${Date.now()}`,
        userId: request.studentId,
        type: 'booking_accepted',
        title: 'Booking Accepted!',
        message: `Your booking for ${request.courseName} has been accepted. Meeting link: ${meetingLink}`,
        bookingRequestId: requestId,
        createdAt: new Date().toISOString(),
        read: false
      };
      
      setNotifications(prev => [...prev, notification]);
    }
  };

  const rejectBookingRequest = (requestId: string) => {
    setBookingRequests(prev => prev.map(request => 
      request.id === requestId 
        ? { ...request, status: 'rejected' as const }
        : request
    ));

    const request = bookingRequests.find(r => r.id === requestId);
    if (request) {
      // Create notification for student/parent
      const notification: Notification = {
        id: `notif-${Date.now()}`,
        userId: request.studentId,
        type: 'booking_rejected',
        title: 'Booking Rejected',
        message: `Your booking request for ${request.courseName} has been rejected.`,
        bookingRequestId: requestId,
        createdAt: new Date().toISOString(),
        read: false
      };
      
      setNotifications(prev => [...prev, notification]);
    }
  };

  const getUserNotifications = (userId: string) => {
    return notifications.filter(notif => notif.userId === userId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };



  /* ---------------- auth helpers ------------------ */
  const loginUser = async (email: string, password: string): Promise<User | null> => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Login failed");
        return null;
      }

      const user: User = data.student || data.tutor || data.user;
      if (!user) {
        setError("Invalid login response format");
        return null;
      }

      setCurrentUser(user);
      setUsers((prev) => (prev.some((u) => u._id === user._id) ? prev : [...prev, user]));
      return user;
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = (): void => {
    setCurrentUser(null);
    setError(null);
    localStorage.removeItem("tutorConnect_currentUser");
  };

  /* ---------------- queries / helpers -------------- */
  const getCompletedTutors = (): User[] =>
    users.filter((u) => u.role === "tutor" && u.profileCompleted);

  const getActiveCourses = (): Course[] => {
    const tutorIds = getCompletedTutors().map((t) => t._id);
    return courses.filter((c) => tutorIds.includes(c.tutorId));
  };

  const canStudentRegister = (): boolean =>
    getCompletedTutors().length >= 5 && getActiveCourses().length >= 4;

  const getStudentEnrollments = (studentId: string): Enrollment[] =>
    enrollments.filter((e) => e.studentId === studentId);

  const getTutorEnrollments = (tutorId: string): Enrollment[] =>
    enrollments.filter((e) => e.tutorId === tutorId);

  const clearError = (): void => setError(null);

  /* ---------------- provider ----------------------- */
  return (
    <AppContext.Provider
      value={{
        /* state */
        users,
        courses,
        enrollments,
        timeSlots,
      bookingRequests,
      notifications,
        currentUser,
        loading,
        error,

        /* user CRUD */
        addUser,
        updateUser,
        setCurrentUser,
        loginUser,
        logoutUser,

        /* course CRUD */
        addCourse,
        updateCourse,

        /* enrollment CRUD */
        addEnrollment,
        updateEnrollment,
        addSession,

        /* helpers */
        getCompletedTutors,
        getActiveCourses,
        canStudentRegister,
        getStudentEnrollments,
        getTutorEnrollments,
        clearError,
      createTimeSlots,
      getCourseTimeSlots,
      createBookingRequest,
      getTutorBookingRequests,
      acceptBookingRequest,
      rejectBookingRequest,
      getUserNotifications,
      markNotificationAsRead
      }}
    >
      {children}
    </AppContext.Provider>
  );
};