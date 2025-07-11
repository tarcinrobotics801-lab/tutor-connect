import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Trophy, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AchievementUploadProps {
  onUpload: (achievement: { name: string; url: string; uploadedAt: string; type: string }) => void;
}

const AchievementUpload = ({ onUpload }: AchievementUploadProps) => {
  const [driveUrl, setDriveUrl] = useState("");
  const [achievementName, setAchievementName] = useState("");
  const [achievementType, setAchievementType] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const achievementTypes = [
    "NPTEL Course Completion",
    "Online Course Certificate",
    "Workshop Certificate",
    "Seminar Certificate",
    "Training Certificate",
    "Competition Award",
    "Research Publication",
    "Other Achievement"
  ];

  const validateGoogleDriveUrl = (url: string) => {
    const driveRegex = /^https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)/;
    return driveRegex.test(url);
  };

  const convertToDirectLink = (shareUrl: string) => {
    const fileId = shareUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    if (fileId) {
      return `https://drive.google.com/file/d/${fileId}/view`;
    }
    return shareUrl;
  };

  const handleUpload = async () => {
    if (!driveUrl.trim() || !achievementName.trim() || !achievementType) {
      toast({
        title: "Missing Information",
        description: "Please provide achievement name, type, and Google Drive URL.",
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
      await new Promise(resolve => setTimeout(resolve, 1000));

      const directUrl = convertToDirectLink(driveUrl);
      
      onUpload({
        name: achievementName,
        url: directUrl,
        uploadedAt: new Date().toISOString(),
        type: achievementType
      });

      // Reset form
      setDriveUrl("");
      setAchievementName("");
      setAchievementType("");

      toast({
        title: "Achievement Added",
        description: "Your achievement certificate has been successfully linked to your profile.",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to add achievement certificate. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="border-dashed border-2 border-yellow-300">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Trophy className="h-5 w-5 text-yellow-600" />
          <span>Upload Achievement Certificate</span>
        </CardTitle>
        <CardDescription>
          Share your NPTEL courses and other achievement certificates via Google Drive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="achievement-name">Achievement Name</Label>
          <Input
            id="achievement-name"
            value={achievementName}
            onChange={(e) => setAchievementName(e.target.value)}
            placeholder="e.g., Machine Learning Course - NPTEL"
          />
        </div>

        <div>
          <Label htmlFor="achievement-type">Achievement Type</Label>
          <Select onValueChange={setAchievementType} value={achievementType}>
            <SelectTrigger>
              <SelectValue placeholder="Select achievement type" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {achievementTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="drive-url">Google Drive Share URL</Label>
          <Input
            id="drive-url"
            value={driveUrl}
            onChange={(e) => setDriveUrl(e.target.value)}
            placeholder="https://drive.google.com/file/d/your-file-id/view"
          />
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-2">How to get Google Drive share URL:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Upload your achievement certificate to Google Drive</li>
                <li>Right-click the file and select "Share"</li>
                <li>Change permission to "Anyone with the link can view"</li>
                <li>Copy the share link and paste it above</li>
              </ol>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleUpload} 
          disabled={isUploading || !driveUrl.trim() || !achievementName.trim() || !achievementType}
          className="w-full bg-yellow-600 hover:bg-yellow-700"
        >
          {isUploading ? (
            <>
              <Upload className="h-4 w-4 mr-2 animate-spin" />
              Adding Achievement...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Add Achievement Certificate
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AchievementUpload;