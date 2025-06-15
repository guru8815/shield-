
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Image, Video, Send } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import React from "react";

const SubmissionForm = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Submission Sent",
      description: "Your report has been securely and anonymously submitted for review. Thank you for your courage.",
      duration: 5000,
    });
    (e.target as HTMLFormElement).reset();
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
            <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
              Your Report (required)
            </label>
            <Textarea
              id="message"
              placeholder="Describe the incident in detail. Who, what, where, when..."
              className="min-h-[150px] bg-background"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label htmlFor="image-upload" className="block text-sm font-medium text-foreground mb-2">
                  Upload Image (optional)
                </label>
                <div className="relative">
                  <Input id="image-upload" type="file" accept="image/*" className="pl-10 file:text-muted-foreground" />
                  <Image className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <div>
                <label htmlFor="video-upload" className="block text-sm font-medium text-foreground mb-2">
                  Upload Video (optional)
                </label>
                <div className="relative">
                  <Input id="video-upload" type="file" accept="video/*" className="pl-10 file:text-muted-foreground" />
                  <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
          </div>
          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-6 transition-colors">
            <Send className="mr-2 h-5 w-5" />
            Submit Securely
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SubmissionForm;
