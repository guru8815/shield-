import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Upload, Camera, Video, MapPin, Music, MessageSquare, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

interface StoryCreatorProps {
  onClose: () => void;
  onStoryCreated: () => void;
}

interface InteractionElement {
  id: string;
  type: 'poll' | 'question' | 'location' | 'music';
  data: any;
  positionX: number;
  positionY: number;
}

const StoryCreator = ({ onClose, onStoryCreated }: StoryCreatorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [interactions, setInteractions] = useState<InteractionElement[]>([]);
  const [showInteractionOptions, setShowInteractionOptions] = useState(false);

  const handleMediaSelect = (file: File, type: 'image' | 'video') => {
    if (!file) return;

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 20MB",
        variant: "destructive",
      });
      return;
    }

    setMediaFile(file);
    setMediaType(type);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setMediaPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadMedia = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
    const bucketName = mediaType === 'image' ? 'evidence-images' : 'evidence-videos';

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const addInteraction = (type: 'poll' | 'question' | 'location' | 'music') => {
    const newInteraction: InteractionElement = {
      id: Date.now().toString(),
      type,
      data: getDefaultInteractionData(type),
      positionX: 0.5,
      positionY: 0.5,
    };
    
    setInteractions([...interactions, newInteraction]);
    setShowInteractionOptions(false);
  };

  const getDefaultInteractionData = (type: string) => {
    switch (type) {
      case 'poll':
        return {
          question: 'Your poll question?',
          options: ['Option 1', 'Option 2'],
        };
      case 'question':
        return {
          placeholder: 'Ask me anything...',
        };
      case 'location':
        return {
          name: location || 'Current location',
        };
      case 'music':
        return {
          title: 'Add music',
          artist: '',
        };
      default:
        return {};
    }
  };

  const removeInteraction = (id: string) => {
    setInteractions(interactions.filter(i => i.id !== id));
  };

  const handleCreateStory = async () => {
    if (!user || !mediaFile) {
      toast({
        title: "Missing requirements",
        description: "Please select an image or video for your story",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload media file
      const mediaUrl = await uploadMedia(mediaFile);

      // Create story
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          media_url: mediaUrl,
          media_type: mediaType,
          caption: caption.trim() || null,
          location: location.trim() || null,
        })
        .select()
        .single();

      if (storyError) throw storyError;

      // Add interactions
      if (interactions.length > 0) {
        const interactionInserts = interactions.map(interaction => ({
          story_id: story.id,
          interaction_type: interaction.type,
          interaction_data: interaction.data,
          position_x: interaction.positionX,
          position_y: interaction.positionY,
        }));

        const { error: interactionError } = await supabase
          .from('story_interactions')
          .insert(interactionInserts);

        if (interactionError) throw interactionError;
      }

      toast({
        title: "Story created",
        description: "Your story has been published successfully!",
      });

      onStoryCreated();
    } catch (error) {
      console.error('Error creating story:', error);
      toast({
        title: "Error",
        description: "Failed to create story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Story</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Media Upload */}
          <div className="space-y-4">
            <Label>Add Photo or Video</Label>
            
            {!mediaPreview ? (
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-32 flex-col space-y-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-8 h-8" />
                  <span>Upload Photo</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-32 flex-col space-y-2"
                  onClick={() => videoInputRef.current?.click()}
                >
                  <Video className="w-8 h-8" />
                  <span>Upload Video</span>
                </Button>
              </div>
            ) : (
              <div className="relative">
                {mediaType === 'image' ? (
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="w-full max-h-96 object-cover rounded-lg"
                  />
                ) : (
                  <video
                    src={mediaPreview}
                    className="w-full max-h-96 object-cover rounded-lg"
                    controls
                  />
                )}
                
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setMediaFile(null);
                    setMediaPreview('');
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>

                {/* Interaction Elements Overlay */}
                {interactions.map((interaction) => (
                  <div
                    key={interaction.id}
                    className="absolute bg-white/90 p-2 rounded-lg text-xs max-w-24 cursor-pointer"
                    style={{
                      left: `${interaction.positionX * 100}%`,
                      top: `${interaction.positionY * 100}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onClick={() => removeInteraction(interaction.id)}
                  >
                    {interaction.type === 'poll' && (
                      <div className="text-center">
                        <BarChart3 className="w-4 h-4 mx-auto mb-1" />
                        <div className="text-xs">Poll</div>
                      </div>
                    )}
                    {interaction.type === 'question' && (
                      <div className="text-center">
                        <MessageSquare className="w-4 h-4 mx-auto mb-1" />
                        <div className="text-xs">Question</div>
                      </div>
                    )}
                    {interaction.type === 'location' && (
                      <div className="text-center">
                        <MapPin className="w-4 h-4 mx-auto mb-1" />
                        <div className="text-xs">Location</div>
                      </div>
                    )}
                    {interaction.type === 'music' && (
                      <div className="text-center">
                        <Music className="w-4 h-4 mx-auto mb-1" />
                        <div className="text-xs">Music</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleMediaSelect(file, 'image');
              }}
            />
            
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleMediaSelect(file, 'video');
              }}
            />
          </div>

          {/* Interactive Elements */}
          {mediaPreview && (
            <div className="space-y-4">
              <Label>Add Interactive Elements</Label>
              
              <div className="grid grid-cols-4 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addInteraction('poll')}
                  className="flex-col h-auto py-3"
                >
                  <BarChart3 className="w-4 h-4 mb-1" />
                  <span className="text-xs">Poll</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addInteraction('question')}
                  className="flex-col h-auto py-3"
                >
                  <MessageSquare className="w-4 h-4 mb-1" />
                  <span className="text-xs">Question</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addInteraction('location')}
                  className="flex-col h-auto py-3"
                >
                  <MapPin className="w-4 h-4 mb-1" />
                  <span className="text-xs">Location</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addInteraction('music')}
                  className="flex-col h-auto py-3"
                >
                  <Music className="w-4 h-4 mb-1" />
                  <span className="text-xs">Music</span>
                </Button>
              </div>
            </div>
          )}

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">Caption (optional)</Label>
            <Textarea
              id="caption"
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location (optional)</Label>
            <Input
              id="location"
              placeholder="Add location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateStory} 
              disabled={!mediaFile || isUploading}
            >
              {isUploading ? 'Publishing...' : 'Share Story'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StoryCreator;