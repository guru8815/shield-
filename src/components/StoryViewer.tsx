import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import StoryInteractions from './StoryInteractions';

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  caption?: string;
  location?: string;
  expires_at: string;
  created_at: string;
}

interface UserStories {
  userId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  stories: Story[];
  hasUnviewedStories: boolean;
}

interface StoryViewerProps {
  userStories: UserStories;
  onClose: () => void;
  onStoryViewed?: () => void;
  onNextUser?: () => void;
}

const StoryViewer = ({ userStories, onClose, onStoryViewed, onNextUser }: StoryViewerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentStory = userStories.stories[currentStoryIndex];
  const storyDuration = 5000; // 5 seconds per story

  const recordStoryView = async (storyId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('story_views')
        .upsert({
          story_id: storyId,
          viewer_id: user.id,
        });
      
      // Update view count
      const { data: currentStory } = await supabase
        .from('stories')
        .select('view_count')
        .eq('id', storyId)
        .single();
        
      if (currentStory) {
        await supabase
          .from('stories')
          .update({ view_count: (currentStory.view_count || 0) + 1 })
          .eq('id', storyId);
      }
        
      onStoryViewed?.();
    } catch (error) {
      console.error('Error recording story view:', error);
    }
  };

  const startProgress = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / storyDuration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        nextStory();
      }
    }, 50);
  };

  const pauseProgress = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const nextStory = () => {
    if (currentStoryIndex < userStories.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
    } else {
      // All stories of this user done, move to next user if available
      if (onNextUser) {
        onNextUser();
      } else {
        onClose();
      }
    }
  };

  const previousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(0);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (currentStory?.media_type === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const checkIfLiked = async (storyId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('story_interactions')
        .select('id, interaction_data')
        .eq('story_id', storyId)
        .eq('interaction_type', 'like');

      if (error) {
        console.error('Error checking like status:', error);
        return;
      }

      // Check if current user has liked
      const userLike = data?.find((interaction: any) => 
        interaction.interaction_data?.user_id === user.id
      );
      setIsLiked(!!userLike);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const fetchLikeCount = async (storyId: string) => {
    try {
      const { count, error } = await supabase
        .from('story_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('story_id', storyId)
        .eq('interaction_type', 'like');

      if (error) {
        console.error('Error fetching like count:', error);
      } else {
        setLikeCount(count || 0);
      }
    } catch (error) {
      console.error('Error fetching like count:', error);
    }
  };

  const toggleLike = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to like stories",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isLiked) {
        // Unlike: delete the interaction
        // First find the interaction id
        const { data: interactions } = await supabase
          .from('story_interactions')
          .select('id, interaction_data')
          .eq('story_id', currentStory.id)
          .eq('interaction_type', 'like');

        const userInteraction = interactions?.find((i: any) => 
          i.interaction_data?.user_id === user.id
        );

        if (userInteraction) {
          const { error } = await supabase
            .from('story_interactions')
            .delete()
            .eq('id', userInteraction.id);

          if (error) throw error;
        }
        
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        // Like: insert interaction
        const { error } = await supabase
          .from('story_interactions')
          .insert({
            story_id: currentStory.id,
            interaction_type: 'like',
            interaction_data: { user_id: user.id },
            position_x: 0.5,
            position_y: 0.5,
          });

        if (error) throw error;
        
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (currentStory) {
      recordStoryView(currentStory.id);
      checkIfLiked(currentStory.id);
      fetchLikeCount(currentStory.id);
      setProgress(0);
      
      if (isPlaying) {
        startProgress();
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentStoryIndex, isPlaying]);

  // Reset to first story when user changes
  useEffect(() => {
    setCurrentStoryIndex(0);
    setProgress(0);
  }, [userStories.userId]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft') previousStory();
      if (e.code === 'ArrowRight') nextStory();
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      }
      if (e.code === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentStoryIndex, isPlaying]);

  if (!currentStory) return null;

  const timeLeft = Math.ceil((storyDuration - (progress * storyDuration / 100)) / 1000);

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/90" onClick={onClose} />
      
      {/* Story Container */}
      <div className="relative w-full max-w-md h-full max-h-[90vh] bg-black rounded-lg overflow-hidden">
        {/* Progress bars */}
        <div className="absolute top-4 left-4 right-4 z-20 flex space-x-1">
          {userStories.stories.map((_, index) => (
            <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{
                  width: index < currentStoryIndex ? '100%' : 
                         index === currentStoryIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-4 right-4 z-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={userStories.avatarUrl} />
              <AvatarFallback>
                {userStories.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white text-sm font-medium">
                {userStories.displayName || userStories.username}
              </p>
              <p className="text-white/70 text-xs">
                {new Date(currentStory.created_at).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {currentStory.media_type === 'video' && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Media Content */}
        <div className="relative w-full h-full flex items-center justify-center">
          {currentStory.media_type === 'image' ? (
            <img
              src={currentStory.media_url}
              alt="Story"
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Failed to load story image');
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          ) : (
            <video
              ref={videoRef}
              src={currentStory.media_url}
              className="w-full h-full object-cover"
              autoPlay={isPlaying}
              muted={isMuted}
              loop={false}
              onEnded={nextStory}
              onPlay={() => pauseProgress()}
              onPause={() => startProgress()}
            />
          )}

          {/* Story Interactions */}
          <StoryInteractions storyId={currentStory.id} />

          {/* Like Button */}
          <div className="absolute bottom-24 right-4 z-20 flex flex-col items-center space-y-1">
            <Button
              variant="ghost"
              size="icon"
              className={`text-white hover:bg-white/20 transition-all ${isLiked ? 'scale-110' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleLike();
              }}
            >
              <Heart 
                className={`w-7 h-7 ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
              />
            </Button>
            {likeCount > 0 && (
              <span className="text-white text-xs font-medium">{likeCount}</span>
            )}
          </div>

          {/* Caption */}
          {currentStory.caption && (
            <div className="absolute bottom-20 left-4 right-4 z-10">
              <p className="text-white text-sm bg-black/50 rounded-lg px-3 py-2">
                {currentStory.caption}
              </p>
            </div>
          )}

          {/* Location */}
          {currentStory.location && (
            <div className="absolute bottom-4 left-4 z-10">
              <p className="text-white/80 text-xs">📍 {currentStory.location}</p>
            </div>
          )}
        </div>

        {/* Navigation Areas */}
        <div className="absolute inset-0 flex">
          <div 
            className="w-1/3 h-full cursor-pointer" 
            onClick={previousStory}
          />
          <div 
            className="w-1/3 h-full cursor-pointer" 
            onClick={togglePlayPause}
          />
          <div 
            className="w-1/3 h-full cursor-pointer" 
            onClick={nextStory}
          />
        </div>

        {/* Navigation Buttons */}
        {currentStoryIndex > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
            onClick={previousStory}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        )}
        
        {currentStoryIndex < userStories.stories.length - 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
            onClick={nextStory}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default StoryViewer;