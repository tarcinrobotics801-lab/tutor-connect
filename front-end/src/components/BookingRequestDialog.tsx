import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, User, Calendar } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

interface BookingRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: any;
}

const BookingRequestDialog = ({ open, onOpenChange, course }: BookingRequestDialogProps) => {
  const { currentUser, getCourseTimeSlots, createTimeSlots, createBookingRequest } = useApp();
  const { toast } = useToast();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && course) {
      console.log('Dialog opened for course:', course);
      setLoading(true);
      
      // Create time slots if they don't exist
      createTimeSlots(course.id, course.tutorId);
      
      // Small delay to ensure slots are created
      setTimeout(() => {
        const slots = getCourseTimeSlots(course.id);
        console.log('Retrieved time slots:', slots);
        setTimeSlots(slots);
        setLoading(false);
      }, 100);
    }
  }, [open, course]);

  const handleSlotSelect = (slotId: string) => {
    console.log('Selected slot:', slotId);
    setSelectedSlot(slotId);
  };

  const handleBookingSubmit = () => {
    if (!selectedSlot || !currentUser) {
      toast({
        title: "Error",
        description: "Please select a time slot",
        variant: "destructive"
      });
      return;
    }

    const slot = timeSlots.find(s => s.id === selectedSlot);
    if (!slot) {
      toast({
        title: "Error",
        description: "Selected slot not found",
        variant: "destructive"
      });
      return;
    }

    if (slot.currentMembers >= slot.maxMembers) {
      toast({
        title: "Slot Full",
        description: "This time slot is already full. Please select another slot.",
        variant: "destructive"
      });
      return;
    }

    console.log('Submitting booking request for slot:', slot);

    createBookingRequest({
      studentId: currentUser._id,
      studentName: currentUser.name,
      courseId: course._id,
      courseName: course.courseName,
      tutorId: course.tutorId,
      tutorName: course.tutorName,
      slotId: selectedSlot,
      slotDay: slot.day,
      slotTime: slot.time
    });

    toast({
      title: "Booking Request Sent!",
      description: "Your booking request has been sent to the tutor. You'll receive a notification once it's reviewed.",
    });

    onOpenChange(false);
    setSelectedSlot(null);
  };

  const isSlotAvailable = (slot: any) => slot.currentMembers < slot.maxMembers;

  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-purple-900">Book Session - {course.title}</DialogTitle>
          <DialogDescription>
            Select an available time slot for your session with {course.tutorName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Available Time Slots
            </h3>
            
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading available time slots...</p>
              </div>
            ) : timeSlots.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No time slots available for this course.</p>
                <p className="text-sm text-gray-500 mt-2">The tutor may not have set their availability yet.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {timeSlots.map((slot) => (
                  <Card 
                    key={slot.id} 
                    className={`cursor-pointer transition-all border-2 ${
                      selectedSlot === slot.id 
                        ? 'border-purple-500 bg-purple-50' 
                        : isSlotAvailable(slot)
                        ? 'border-gray-200 hover:border-purple-300'
                        : 'border-red-200 bg-red-50 cursor-not-allowed'
                    }`}
                    onClick={() => isSlotAvailable(slot) && handleSlotSelect(slot.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="font-semibold text-gray-900 capitalize">{slot.day}</p>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock className="h-3 w-3" />
                              {slot.time}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {slot.currentMembers}/{slot.maxMembers} enrolled
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isSlotAvailable(slot) ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              Available
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              Full
                            </Badge>
                          )}
                          
                          {selectedSlot === slot.id && (
                            <div className="w-3 h-3 bg-purple-500 rounded-full" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleBookingSubmit}
              disabled={!selectedSlot || loading}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Send Booking Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingRequestDialog;
