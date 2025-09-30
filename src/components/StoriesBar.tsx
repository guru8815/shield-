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

interface Profile {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
}

interface UserStories {
  userId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  stories: Story[];
  hasUnviewedStories: boolean;
}

// TEMPORARY TEST DATA - Remove after testing
const MOCK_STORIES: UserStories[] = [
  {
    userId: 'test-user-1',
    username: 'emma_wilson',
    displayName: 'Emma Wilson',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    stories: [
      {
        id: 'story-1',
        user_id: 'test-user-1',
        media_url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400',
        media_type: 'image',
        caption: 'Beautiful sunset today! 🌅',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
      }
    ],
    hasUnviewedStories: true,
  },
  {
    userId: 'test-user-2',
    username: 'john_doe',
    displayName: 'John Doe',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    stories: [
      {
        id: 'story-2',
        user_id: 'test-user-2',
        media_url: 'https://images.unsplash.com/photo-1682687221038-404cb8830901?w=400',
        media_type: 'image',
        caption: 'Coffee time ☕',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
      }
    ],
    hasUnviewedStories: true,
  },
  {
    userId: 'test-user-3',
    username: 'sarah_jane',
    displayName: 'Sarah Jane',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    stories: [
      {
        id: 'story-3',
        user_id: 'test-user-3',
        media_url: 'https://images.unsplash.com/photo-1682687982107-14492010e05e?w=400',
        media_type: 'image',
        caption: 'Weekend vibes 🎉',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
      }
    ],
    hasUnviewedStories: false,
  },
];

const StoriesBar = () => {
  const { user } = useAuth();
  const [userStories, setUserStories] = useState<UserStories[]>(MOCK_STORIES); // Using mock data
  const [selectedStories, setSelectedStories] = useState<UserStories | null>(null);
  const [showCreator, setShowCreator] = useState(false);
  const [loading, setLoading] = useState(false); // Changed to false for testing

  const fetchStories = async () => {
    try {
      // First get all active stories
      const { data: stories, error } = await supabase
        .from('stories')
        .select('*')
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching stories:', error);
        throw error;
      }

      if (!stories || stories.length === 0) {
        setUserStories([]);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(stories.map((story: Story) => story.user_id))];

      // Fetch profiles for those users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Create a map of profiles for quick lookup
      const profilesMap = (profiles || []).reduce((acc: Record<string, Profile>, profile: Profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {});

      // Group stories by user
      const groupedStories: { [key: string]: UserStories } = {};
      
      stories.forEach((story: Story) => {
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
      console.error('Error in fetchStories:', error);
      setUserStories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Commented out for testing with mock data
    // fetchStories();
    
    // Using mock data for testing
    setUserStories(MOCK_STORIES);
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
      <div className="flex gap-4 p-4 overflow-x-auto scrollbar-hide bg-card/80 backdrop-blur-sm">
        {/* Add Story Button */}
        {user && (
          <div className="flex-shrink-0 text-center">
            <div className="relative">
              <div className="p-1 rounded-full bg-gradient-to-tr from-primary/20 to-primary/10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-16 h-16 rounded-full bg-background hover:bg-muted transition-colors"
                  onClick={() => setShowCreator(true)}
                >
                  <Plus className="w-6 h-6 text-primary" />
                </Button>
              </div>
            </div>
            <p className="text-xs mt-1.5 text-muted-foreground font-medium">Your Story</p>
          </div>
        )}

        {/* User Stories */}
        {userStories.map((userStory) => (
          <div
            key={userStory.userId}
            className="flex-shrink-0 text-center cursor-pointer group"
            onClick={() => setSelectedStories(userStory)}
          >
            <div className={`p-[3px] rounded-full transition-transform group-hover:scale-105 ${
              userStory.hasUnviewedStories 
                ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600' 
                : 'bg-gradient-to-tr from-muted to-muted'
            }`}>
              <div className="p-[2px] bg-background rounded-full">
                <Avatar className="w-16 h-16 border-2 border-background">
                  <AvatarImage src={userStory.avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {userStory.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <p className="text-xs mt-1.5 text-foreground max-w-[4.5rem] truncate font-medium">
              {userStory.displayName || userStory.username}
            </p>
          </div>
        ))}

        {/* Empty State Message */}
        {userStories.length === 0 && !user && (
          <div className="flex-1 text-center py-4">
            <p className="text-muted-foreground text-sm">Sign in to view and create stories</p>
          </div>
        )}

        {userStories.length === 0 && user && (
          <div className="flex-1 text-center py-4">
            <p className="text-muted-foreground text-sm">No stories yet. Be the first to share!</p>
          </div>
        )}
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