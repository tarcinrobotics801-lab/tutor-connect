import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CertificateUploadProps {
  onUpload: (certificate: { name: string; url: string; uploadedAt: string }) => void;
}
const CertificateUpload = ({ onUpload }: CertificateUploadProps) => {
  const [driveUrl, setDriveUrl] = useState("");
  const [certificateName, setCertificateName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

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
    if (!driveUrl.trim() || !certificateName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both certificate name and Google Drive URL.",
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
        name: certificateName,
        url: directUrl,
        uploadedAt: new Date().toISOString()
      });

      // Reset form
      setDriveUrl("");
      setCertificateName("");

      toast({
        title: "Certificate Added",
        description: "Your certificate has been successfully linked to your profile.",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to add certificate. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="border-dashed border-2 border-gray-300">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Upload className="h-5 w-5" />
          <span>Upload Certificate</span>
        </CardTitle>
        <CardDescription>
          Share your degree certificate via Google Drive and paste the link here
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="cert-name">Certificate Name</Label>
          <Input
            id="cert-name"
            value={certificateName}
            onChange={(e) => setCertificateName(e.target.value)}
            placeholder="e.g., Bachelor's Degree in Mathematics"
          />
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

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">How to get Google Drive share URL:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Upload your certificate to Google Drive</li>
                <li>Right-click the file and select "Share"</li>
                <li>Change permission to "Anyone with the link can view"</li>
                <li>Copy the share link and paste it above</li>
              </ol>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleUpload} 
          disabled={isUploading || !driveUrl.trim() || !certificateName.trim()}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Upload className="h-4 w-4 mr-2 animate-spin" />
              Adding Certificate...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Add Certificate
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CertificateUpload;
