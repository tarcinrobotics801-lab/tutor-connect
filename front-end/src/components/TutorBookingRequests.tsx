import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock, User, LinkIcon, Check, X } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

const TutorBookingRequests = () => {
  const { currentUser, getTutorBookingRequests, acceptBookingRequest, rejectBookingRequest } = useApp();
  const { toast } = useToast();
  const [meetingLinks, setMeetingLinks] = useState<Record<string, string>>({});
  const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({});

  if (!currentUser || currentUser.role !== 'tutor') return null;

  const bookingRequests = getTutorBookingRequests(currentUser._id);
  const pendingRequests = bookingRequests.filter(req => req.status === 'pending');

  const handleAcceptRequest = (requestId: string) => {
    const meetingLink = meetingLinks[requestId];
    if (!meetingLink?.trim()) {
      toast({
        title: "Meeting Link Required",
        description: "Please provide a meeting link before accepting the request.",
        variant: "destructive"
      });
      return;
    }

    acceptBookingRequest(requestId, meetingLink);
    setOpenDialogs(prev => ({ ...prev, [requestId]: false }));
    setMeetingLinks(prev => ({ ...prev, [requestId]: '' }));
    
    toast({
      title: "Request Accepted!",
      description: "The booking request has been accepted and the student has been notified.",
    });
  };

  const handleRejectRequest = (requestId: string) => {
    rejectBookingRequest(requestId);
    toast({
      title: "Request Rejected",
      description: "The booking request has been rejected.",
    });
  };

  const handleMeetingLinkChange = (requestId: string, link: string) => {
    setMeetingLinks(prev => ({ ...prev, [requestId]: link }));
  };

  const setDialogOpen = (requestId: string, open: boolean) => {
    setOpenDialogs(prev => ({ ...prev, [requestId]: open }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Booking Requests</h2>
        {pendingRequests.length > 0 && (
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            {pendingRequests.length} pending
          </Badge>
        )}
      </div>

      {pendingRequests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
            <p className="text-gray-600">You don't have any pending booking requests at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingRequests.map((request) => (
            <Card key={request._id} className="border-purple-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-purple-600" />
                    {request.userName}
                  </CardTitle>
                  <Badge className="bg-yellow-100 text-yellow-700">
                    Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Course</p>
                    <p className="font-medium">{request.courseName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Requested Time</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="capitalize">{request.slotDay}</span>
                      <Clock className="h-4 w-4 text-gray-500 ml-2" />
                      <span>{request.slotTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Dialog 
                    open={openDialogs[request._id] || false} 
                    onOpenChange={(open) => setDialogOpen(request._id, open)}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        <Check className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Accept Booking Request</DialogTitle>
                        <DialogDescription>
                          Please provide a meeting link for the session with {request.userName}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="meetingLink">Meeting Link</Label>
                          <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              id="meetingLink"
                              placeholder="https://meet.google.com/xxx-xxxx-xxx"
                              value={meetingLinks[request._id] || ''}
                              onChange={(e) => handleMeetingLinkChange(request._id, e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3">
                          <Button 
                            variant="outline" 
                            onClick={() => setDialogOpen(request._id, false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => handleAcceptRequest(request._id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Accept & Send Link
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button 
                    variant="destructive"
                    onClick={() => handleRejectRequest(request._id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorBookingRequests;
