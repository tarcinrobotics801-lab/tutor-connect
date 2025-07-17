import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";

interface ResourceUploadProps {
  onUpload: () => void;
  tutorId: string;
  tutorName: string;
}

const ResourceUpload = ({ onUpload, tutorId, tutorName }: ResourceUploadProps) => {
  
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  
  const [resourceData, setResourceData] = useState({
    title: "",
    description: "",
    subject: "",
    className: "",
    driveUrl: "",
    contents: ""
  });

  const subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "History", "Computer Science", "Economics"];
  const classes = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12", "Undergraduate", "Postgraduate"];

  const validateGoogleDriveUrl = (url: string) => {
    const driveRegex = /^https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)/;
    return driveRegex.test(url);
  };

  const handleInputChange = (field: string, value: string) => {
    setResourceData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpload = async () => {
    const { title, subject, className, driveUrl, description } = resourceData;
    
    if (!title.trim() || !subject || !className || !driveUrl.trim() || !description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!validateGoogleDriveUrl(driveUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please provide a valid Google Drive share URL.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // Simulate upload delay
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          subject,
          className,
          driveUrl,
          contents: resourceData.contents,
          tutorId,
          tutorName,
          uploadedAt: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload resource");
      }
      

      toast({
        title: "Resource Uploaded",
        description: "Your learning resource has been uploaded successfully!",
      });

      onUpload();
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload resource. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Resource Title *</Label>
        <Input
          id="title"
          value={resourceData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          placeholder="e.g., Algebra Chapter 1 - Linear Equations"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="subject">Subject *</Label>
          <Select onValueChange={(value) => handleInputChange("subject", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {subjects.map(subject => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="class">Class/Level *</Label>
          <Select onValueChange={(value) => handleInputChange("className", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {classes.map(className => (
                <SelectItem key={className} value={className}>
                  {className}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={resourceData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Describe what this resource covers and how it will help students..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="contents">Contents Overview</Label>
        <Textarea
          id="contents"
          value={resourceData.contents}
          onChange={(e) => handleInputChange("contents", e.target.value)}
          placeholder="List the main topics, chapters, or concepts covered in this resource..."
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="drive-url">Google Drive Share URL *</Label>
        <Input
          id="drive-url"
          value={resourceData.driveUrl}
          onChange={(e) => handleInputChange("driveUrl", e.target.value)}
          placeholder="https://drive.google.com/file/d/your-file-id/view"
        />
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">How to share your resource:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Upload your notes/materials to Google Drive</li>
              <li>Right-click the file and select "Share"</li>
              <li>Change permission to "Anyone with the link can view"</li>
              <li>Copy the share link and paste it above</li>
            </ol>
          </div>
        </div>
      </div>

      <Button 
        onClick={handleUpload} 
        disabled={isUploading}
        className="w-full bg-purple-600 hover:bg-purple-700"
      >
        {isUploading ? (
          <>
            <Upload className="h-4 w-4 mr-2 animate-spin" />
            Uploading Resource...
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Upload Resource
          </>
        )}
      </Button>
    </div>
  );
};

export default ResourceUpload;