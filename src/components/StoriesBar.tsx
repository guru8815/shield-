import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import StoryViewer from './StoryViewer';
import StoryCreator from './StoryCreator';

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

const StoriesBar = () => {
  const { user } = useAuth();
  const [userStories, setUserStories] = useState<UserStories[]>([]);
  const [selectedStories, setSelectedStories] = useState<UserStories | null>(null);
  const [showCreator, setShowCreator] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStories = async () => {
    if (!user) return;

    try {
      // First get all active stories
      const { data: stories, error } = await supabase
        .from('stories')
        .select('*')
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!stories || stories.length === 0) {
        setUserStories([]);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(stories.map(story => story.user_id))];

      // Fetch profiles for those users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Create a map of profiles for quick lookup
      const profilesMap = (profiles || []).reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>);

      // Group stories by user
      const groupedStories: { [key: string]: UserStories } = {};
      
      stories.forEach((story) => {
        const userId = story.user_id;
        const profile = profilesMap[userId];
        
        if (!groupedStories[userId]) {
          groupedStories[userId] = {
            userId,
            username: profile?.username || 'Unknown User',
            displayName: profile?.display_name,
            avatarUrl: profile?.avatar_url,
            stories: [],
            hasUnviewedStories: true, // For now, assume all are unviewed
          };
        }
        groupedStories[userId].stories.push(story);
      });

      setUserStories(Object.values(groupedStories));
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [user]);

  const handleStoryCreated = () => {
    setShowCreator(false);
    fetchStories();
  };

  if (loading) {
    return (
      <div className="flex space-x-4 p-4 overflow-x-auto">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex space-x-4 p-4 overflow-x-auto scrollbar-hide">
        {/* Add Story Button */}
        {user && (
          <div className="flex-shrink-0 text-center">
            <Button
              variant="outline"
              size="icon"
              className="w-16 h-16 rounded-full border-2 border-dashed border-primary/50 hover:border-primary"
              onClick={() => setShowCreator(true)}
            >
              <Plus className="w-6 h-6" />
            </Button>
            <p className="text-xs mt-2 text-muted-foreground">Your Story</p>
          </div>
        )}

        {/* User Stories */}
        {userStories.map((userStory) => (
          <div
            key={userStory.userId}
            className="flex-shrink-0 text-center cursor-pointer"
            onClick={() => setSelectedStories(userStory)}
          >
            <div className={`p-0.5 rounded-full ${
              userStory.hasUnviewedStories 
                ? 'bg-gradient-to-tr from-yellow-400 to-pink-600' 
                : 'bg-muted'
            }`}>
              <Avatar className="w-14 h-14 border-2 border-background">
                <AvatarImage src={userStory.avatarUrl} />
                <AvatarFallback>
                  {userStory.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <p className="text-xs mt-2 text-foreground max-w-[4rem] truncate">
              {userStory.displayName || userStory.username}
            </p>
          </div>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {selectedStories && (
        <StoryViewer
          userStories={selectedStories}
          onClose={() => setSelectedStories(null)}
          onStoryViewed={fetchStories}
        />
      )}

      {/* Story Creator Modal */}
      {showCreator && (
        <StoryCreator
          onClose={() => setShowCreator(false)}
          onStoryCreated={handleStoryCreated}
        />
      )}
    </>
  );
};

export default StoriesBar;