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
  role: "student" | "tutor" | "parent" |"admin";
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
  achievements?: { name: string; url: string; uploadedAt: string; type: string }[];
  educationBoard?:string;
  gradeOrYear?: string;
  // Student‑specific ------------------------------------------
  yearOfStudent?: number;
  department?: string;
  collegeName?: string;
  city?: string;
  state?: string;
  enrolledCourses?: string[];
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
  sessionTime: string;
  tag: string[];
  tutorId: string;
  tutorName?: string;
  classOrYear?: string;
  educationBoard?: string;
  createdAt: string;
  updatedAt: string;
}
export interface TimeSlot {
  _id: string;
  courseId: string;
  tutorId: string;
  day: string;
  time: string;
  maxMembers: number;
  currentMembers: number;
  enrolledUsers: string[];
}

export interface BookingRequest {
  _id: string;

  userId: string;    
  userName: string;                      // ✅ ID of student or parent
  requestedBy: 'student' | 'parent';   // ✅ Who made the request

  courseId: string;
  courseName: string;

  tutorId: string | { _id: string; name: string };
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
  id?: string;
  userId: string;
  type: 'booking_request' | 'booking_accepted' | 'booking_rejected';
  title: string;
  message: string;
  bookingRequestId?: string;
  createdAt: string;
  read: boolean;
}
interface Resource {
  id: string;
  title: string;
  description: string;
  subject: string;
  className: string;
  driveUrl: string;
  contents: string;
  tutorId: string;
  tutorName: string;
  uploadedAt: string;
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
  resources: Resource[];
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
  getCourseTimeSlots: (courseId: string) => Promise<TimeSlot[]>;
  createBookingRequest: (
    request: Omit<BookingRequest, '_id' | 'requestedAt' | 'status'>
  ) => Promise<{ success: boolean; error?: string }>;
  
  getTutorBookingRequests: (tutorId: string) => BookingRequest[];
  acceptBookingRequest: (requestId: string, meetingLink: string) => void;
  rejectBookingRequest: (requestId: string) => void;
  getUserNotifications: (userId: string) => Notification[];
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  clearAllNotifications: (userId: string) => Promise<void>;
  addResource: (resource: Resource) => void;
  removeTutor: (tutorId: string) => Promise<boolean>;
  getAppStats: () => { totalTutors: number; totalCourses: number; totalStudents: number; totalParents: number }
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
  const [resources, setResources] = useState<Resource[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  const removeTutor = async (tutorId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/tutors/${tutorId}`, {
        method: "DELETE",
      });
  
      if (!res.ok) throw new Error("Failed to delete tutor");
  
      // ✅ Backend deletion successful — do local state cleanup
      setTimeSlots((prev) => prev.filter((slot) => slot.tutorId !== tutorId));
      setBookingRequests((prev) =>
        prev.filter((request) =>
          typeof request.tutorId === "string"
            ? request.tutorId !== tutorId
            : request.tutorId._id !== tutorId
        )
      );
      setEnrollments((prev) => prev.filter((session) => session.tutorId !== tutorId));
      setNotifications((prev) => prev.filter((notif) => notif.userId !== tutorId));
      setUsers((prev) => prev.filter((u) => u._id !== tutorId));
      setCourses((prev) => prev.filter((c) => c.tutorId !== tutorId));
  
      return true;
    } catch (err) {
      console.error("Error deleting tutor:", err);
      return false;
    }
  };

  const getAppStats = () => {
    return {
      totalTutors: users.filter(user => user.role === 'tutor').length,
      totalCourses: courses.length,
      totalStudents: users.filter(user => user.role === 'student').length,
      totalParents: users.filter(user => user.role === 'parent').length
    };
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

  const createTimeSlots = async (courseId: string, tutorId: string): Promise<void> => {
  try {
    const res = await fetch("/api/timeslots/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, tutorId }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to create time slots");
    }
  } catch (err) {
    console.error("createTimeSlots error:", err);
    throw err;
  }
};


  const getCourseTimeSlots = async (courseId: string): Promise<TimeSlot[]> => {
  try {
    const res = await fetch(`/api/timeslots/${courseId}`);
    if (!res.ok) {
      throw new Error("Failed to fetch time slots");
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("getCourseTimeSlots error:", err);
    throw err;
  }
};

// Add these console logs in your AppContext createBookingRequest function
const createBookingRequest = async (
  request: Omit<BookingRequest, '_id' | 'requestedAt' | 'status'>
): Promise<{ success: boolean; error?: string }> => {
  console.log('🔄 Creating booking request:', request);

  const tutorId =
    typeof request.tutorId === 'object' ? request.tutorId._id : request.tutorId;

  const safeRequest = {
    ...request,
    tutorName: request.tutorName || "Tutor",
  };

  try {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(safeRequest),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("❌ Backend rejected booking request:", data.message);
      return { success: false, error: data.message || "Booking creation failed" };
    }

    const newRequest: BookingRequest = data.booking;

    setBookingRequests(prev => {
      const updated = [...prev, newRequest];
      console.log("📋 Booking requests after backend save:", updated);
      return updated;
    });

    const notification: Notification = {
      userId: tutorId,
      type: "booking_request",
      title: "New Booking Request",
      message: `${request.userName} has requested to book ${request.courseName} for ${request.slotDay} at ${request.slotTime}`,
      bookingRequestId: newRequest._id,
      createdAt: new Date().toISOString(),
      read: false,
    };
    console.log("📤 Sending notification to backend:", notification);

    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(notification),
    });

    setNotifications(prev => {
      const updated = [...prev, notification];
      console.log("📬 Notifications after booking:", updated);
      return updated;
    });

    console.log("✅ Booking request created & notification sent");
    return { success: true };
  } catch (err: any) {
    console.error("❌ Failed to create booking request:", err.message || err);
    return { success: false, error: err.message || "Network error" };
  }
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
      userName: request.userName,
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


const acceptBookingRequest = async (requestId: string, meetingLink: string) => {
  try {
    const res = await fetch("/api/bookings/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, meetingLink }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Accept failed");

    // 🔄 Update booking request in state
    const updatedRequests = bookingRequests.map(request =>
      request._id === requestId ? data.booking : request
    ).filter(request => request.status === "pending");

    setBookingRequests(updatedRequests);

    // ✅ Also sync to localStorage
    if (currentUser?.role === "tutor") {
      localStorage.setItem("tutorBookingRequests", JSON.stringify(updatedRequests));
    }

    // 👤 Dynamic user ID (student or parent)
    const recipientUserId =
      data.booking.userId || data.booking.studentId;

    const recipientName =
      data.booking.userName || data.booking.studentName || "User";

    // 🔔 Create notification
    const notification: Notification = {
      userId: recipientUserId,
      type: "booking_accepted",
      title: "Booking Accepted!",
      message: `Your booking for ${data.booking.courseName} has been accepted.

      Session Time: ${data.booking.slotDay || 'N/A'} at ${data.booking.slotTime || 'N/A'} 
      ${data.booking.sessionTime ? `(Session: ${data.booking.sessionTime})` : ''}

      Join the session here: ${data.booking.meetingLink || 'Link not available'}`,

      bookingRequestId: requestId,
      createdAt: new Date().toISOString(),
      read: false,
    };
    console.log("📤 Sending notification to backend:", notification);

    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(notification),
    });
    
    setNotifications(prev => [...prev, notification]);

    if (currentUser?._id === data.booking.userId) {
    try {
    const endpoint =
      currentUser.role === "tutor"
        ? `/api/auth/tutor/${currentUser._id}`
        : currentUser.role === "parent"
          ? `/api/auth/parent/${currentUser._id}`
          : `/api/auth/student/${currentUser._id}`;

    const updatedUserRes = await fetch(endpoint, {
      credentials: "include",
    });

    if (updatedUserRes.ok) {
      const updatedUser: User = await updatedUserRes.json();
      setCurrentUser(updatedUser);
    } else {
      console.warn("Failed to fetch updated user by role");
    }
  } catch (err) {
    console.error("Error fetching updated user:", err);
  }
}


  } catch (err) {
    const error = err instanceof Error ? err : new Error("Unknown error occurred");
    console.error("❌ Accept booking failed:", error.message);
  }
};



const rejectBookingRequest = async (requestId: string) => {
  try {
    const res = await fetch("/api/bookings/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Reject failed");

    // ✅ Update state with the rejected booking
    const updatedRequests = bookingRequests.map(request =>
      request._id === requestId ? data.booking : request
    ).filter(request => request.status === "pending");

    setBookingRequests(updatedRequests);

    // ✅ Also sync to localStorage
    if (currentUser?.role === "tutor") {
      localStorage.setItem("tutorBookingRequests", JSON.stringify(updatedRequests));
    }

    // ✅ Use correct userId from backend response
    const recipientUserId = data.booking.userId || data.booking.studentId || "";

    // 🔔 Create and push notification
    const notification: Notification = {
      userId: recipientUserId,
      type: "booking_rejected",
      title: "Booking Rejected",
      message: `Your booking request for ${data.booking.courseName} was rejected.`,
      bookingRequestId: requestId,
      createdAt: new Date().toISOString(),
      read: false,
    };
    console.log("📤 Sending notification to backend:", notification);

    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(notification),
    });
    
    setNotifications(prev => [...prev, notification]);
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Unknown error occurred");
    console.error("Reject booking failed:", error.message);
  }
};


  const getUserNotifications = (userId: string) => {
    return notifications.filter(notif => notif.userId === userId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    await fetch(`/api/notifications/${notificationId}/read`, {
      method: "PATCH",
    });

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  } catch (err) {
    console.error("Failed to mark notification as read", err);
  }
};

  
  const clearAllNotifications = async (userId: string): Promise<void> => {
    try {
      await fetch(`/api/notifications/clear/${userId}`, {
        method: "PATCH",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to clear notifications", err);
    }
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
  
      // Admin hardcoded login
      if (email === "admin@tarcin.in" && password === "Tarcin@12345") {
        const adminUser: User = {
          _id: "admin-1",
          name: "Admin",
          email: "admin@tarcin.in",
          role: "admin",
          profileCompleted: true,
        };
        setCurrentUser(adminUser);
        return adminUser;
      }
  
      const user: User = data.student || data.tutor || data.user;
      if (!user) {
        setError("Invalid login response format");
        return null;
      }
  
      setCurrentUser(user);
      localStorage.setItem("currentUser", JSON.stringify(user));
  
      // ✅ if tutor, store booking requests
      if (user.role === "tutor" && data.user.bookingRequests) {
        setBookingRequests(data.user.bookingRequests);
        localStorage.setItem(
          "tutorBookingRequests",
          JSON.stringify(data.user.bookingRequests)
        );
      }
  
      // ✅ Fetch notifications (students/parents only)
      if (user.role === "student" || user.role === "parent") {
        try {
          const notifRes = await fetch(`/api/notifications/${user._id}`);
          const notifData = await notifRes.json();
          if (notifRes.ok && notifData.notifications) {
            setNotifications(notifData.notifications);
          }
        } catch (err) {
          console.error("Failed to fetch notifications:", err);
        }
      }
  
      setUsers((prev) =>
        prev.some((u) => u._id === user._id) ? prev : [...prev, user]
      );
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
   
  };

  /* ---------------- queries / helpers -------------- */
  const getCompletedTutors = (): User[] =>
    users.filter((u) => u.role === "tutor" && u.profileCompleted);

  const getActiveCourses = (): Course[] => {
    const tutorIds = getCompletedTutors().map((t) => t._id);
    return courses.filter((c) => tutorIds.includes(c.tutorId));
  };
  const addResource = (resource: Resource) => {
    setResources([...resources, resource]);
  };

  const canStudentRegister = (): boolean =>
    getCompletedTutors().length >= 5 && getActiveCourses().length >= 4;

  const getStudentEnrollments = (studentId: string): Enrollment[] =>
    enrollments.filter((e) => e.studentId === studentId);

  const getTutorEnrollments = (tutorId: string): Enrollment[] =>
    enrollments.filter((e) => e.tutorId === tutorId);

  const clearError = (): void => setError(null);
  
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    const storedRequests = localStorage.getItem("tutorBookingRequests");
  
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser(parsedUser);
  
      if (parsedUser.role === "tutor" && storedRequests) {
        setBookingRequests(JSON.parse(storedRequests));
      }
  
      // ✅ Fetch notifications on page reload
      if (parsedUser.role === "student" || parsedUser.role === "parent") {
        fetch(`/api/notifications/${parsedUser._id}`)
          .then(res => res.json())
          .then(data => {
            if (data.notifications) {
              setNotifications(data.notifications);
            }
          })
          .catch(err => {
            console.error("Failed to fetch notifications on reload", err);
          });
      }
    }
  }, []);
  


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
      resources,
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
      markNotificationAsRead,
      clearAllNotifications,
      addResource,
      removeTutor,
      getAppStats
      }}
    >
      {children}
    </AppContext.Provider>
  );
};