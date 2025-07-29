
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Image, Video, Send, Upload, X } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface UploadedFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

const SubmissionForm = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateFile = (file: File): string | null => {
    const maxImageSize = 50 * 1024 * 1024; // 50MB
    const maxVideoSize = 100 * 1024 * 1024; // 100MB
    
    if (file.type.startsWith('image/')) {
      if (file.size > maxImageSize) return 'Image file must be less than 50MB';
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        return 'Only JPEG, PNG, GIF, and WebP images are allowed';
      }
    } else if (file.type.startsWith('video/')) {
      if (file.size > maxVideoSize) return 'Video file must be less than 100MB';
      if (!['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'].includes(file.type)) {
        return 'Only MP4, MPEG, QuickTime, and AVI videos are allowed';
      }
    } else {
      return 'Only image and video files are allowed';
    }
    
    return null;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        toast({
          title: "File Error",
          description: error,
          variant: "destructive"
        });
        return;
      }

      const preview = URL.createObjectURL(file);
      setUploadedFiles(prev => [...prev, { file, preview, type }]);
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadToSupabase = async (file: File, type: 'image' | 'video'): Promise<string> => {
    const bucket = type === 'image' ? 'evidence-images' : 'evidence-videos';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a description of the incident.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload files to Supabase Storage
      const mediaUrls: string[] = [];
      for (const { file, type } of uploadedFiles) {
        const url = await uploadToSupabase(file, type);
        mediaUrls.push(url);
      }

      // Create the post in database
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          title: title || 'Anonymous Report',
          content,
          location,
          media_urls: mediaUrls,
          user_id: user?.id || null,
          submission_type: 'anonymous',
          is_anonymous: true,
          status: 'active'
        });

      if (postError) throw postError;

      toast({
        title: "Submission Sent",
        description: "Your report has been securely submitted for review. Thank you for your courage.",
        duration: 5000,
      });

      // Reset form
      setTitle('');
      setContent('');
      setLocation('');
      setUploadedFiles([]);
      (e.target as HTMLFormElement).reset();

    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-card/50 backdrop-blur-sm border-2 border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <FileText className="mr-3 h-7 w-7" />
          Submit an Anonymous Report
        </CardTitle>
        <CardDescription>
          Your identity is protected. Share information about corruption without fear. All submissions are reviewed before publishing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title" className="block text-foreground mb-2">
              Report Title (optional)
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief title for your report"
              className="bg-background"
            />
          </div>
          
          <div>
            <Label htmlFor="message" className="block text-foreground mb-2">
              Your Report (required)
            </Label>
            <Textarea
              id="message"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe the incident in detail. Who, what, where, when..."
              className="min-h-[150px] bg-background"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="location" className="block text-foreground mb-2">
              District / Location (optional)
            </Label>
            <Select onValueChange={setLocation}>
              <SelectTrigger id="location" className="w-full bg-background">
                <SelectValue placeholder="Select a district" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="downtown">Downtown</SelectItem>
                <SelectItem value="financial-district">Financial District</SelectItem>
                <SelectItem value="waterfront">Waterfront</SelectItem>
                <SelectItem value="suburbs">Suburbs</SelectItem>
                <SelectItem value="industrial-zone">Industrial Zone</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="image-upload" className="block text-foreground mb-2">
                Upload Images (optional)
              </Label>
              <div className="relative">
                <Input 
                  id="image-upload" 
                  type="file" 
                  accept="image/jpeg,image/png,image/gif,image/webp" 
                  multiple
                  onChange={(e) => handleFileUpload(e, 'image')}
                  className="pl-10 file:text-muted-foreground" 
                />
                <Image className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Max 50MB, JPEG/PNG/GIF/WebP</p>
            </div>
            
            <div>
              <Label htmlFor="video-upload" className="block text-foreground mb-2">
                Upload Videos (optional)
              </Label>
              <div className="relative">
                <Input 
                  id="video-upload" 
                  type="file" 
                  accept="video/mp4,video/mpeg,video/quicktime,video/x-msvideo" 
                  multiple
                  onChange={(e) => handleFileUpload(e, 'video')}
                  className="pl-10 file:text-muted-foreground" 
                />
                <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Max 100MB, MP4/MPEG/MOV/AVI</p>
            </div>
          </div>

          {/* File Preview Section */}
          {uploadedFiles.length > 0 && (
            <div>
              <Label className="block text-foreground mb-2">Uploaded Files</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border border-border">
                      {file.type === 'image' ? (
                        <img 
                          src={file.preview} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video 
                          src={file.preview} 
                          className="w-full h-full object-cover"
                          controls
                        />
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {file.file.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <Button 
            type="submit" 
            disabled={isSubmitting || !content.trim()}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-6 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Upload className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Submit Securely
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SubmissionForm;
