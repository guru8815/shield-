import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SocialPostCard from '@/components/SocialPostCard';
import ChatToggle from '@/components/ChatToggle';
import TelegramChat from '@/components/TelegramChat';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface SocialPost {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  tags: string[];
  type: 'text' | 'image' | 'video';
  location: string;
  likes: number;
  comments: number;
  shares: number;
  media_urls?: string[];
  created_at: string;
}

const Posts = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          created_at,
          location,
          media_urls,
          tags,
          status
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedPosts: SocialPost[] = (data || []).map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        timestamp: formatTimestamp(post.created_at),
        tags: post.tags || [],
        type: determinePostType(post.media_urls),
        location: post.location || 'Unknown',
        likes: Math.floor(Math.random() * 100), // Placeholder
        comments: Math.floor(Math.random() * 50), // Placeholder
        shares: Math.floor(Math.random() * 30), // Placeholder
        media_urls: post.media_urls,
        created_at: post.created_at
      }));

      setPosts(transformedPosts);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const determinePostType = (mediaUrls?: string[]): 'text' | 'image' | 'video' => {
    if (!mediaUrls || mediaUrls.length === 0) return 'text';
    
    const hasImage = mediaUrls.some(url => 
      url.includes('evidence-images') || 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
    );
    const hasVideo = mediaUrls.some(url => 
      url.includes('evidence-videos') || 
      /\.(mp4|mpeg|mov|avi)$/i.test(url)
    );
    
    if (hasVideo) return 'video';
    if (hasImage) return 'image';
    return 'text';
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="min-h-screen bg-background text-foreground w-full relative overflow-x-hidden pb-20">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/10 opacity-20 blur-[100px]"></div>
      </div>
      
      <div className="flex h-screen">
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${isChatOpen ? 'mr-80' : 'mr-0'}`}>
          <Header />
          
          <main className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-center mb-8">Community Posts</h2>
            <div className="space-y-8 max-w-4xl mx-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading posts...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">No posts available yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">Be the first to submit a report!</p>
                </div>
              ) : (
                posts.map(post => (
                  <SocialPostCard key={post.id} post={post} />
                ))
              )}
            </div>
          </main>

          <footer className="text-center py-8 mt-8 text-muted-foreground text-sm border-t border-border">
            <p>Built for truth and transparency. Your security is our priority.</p>
            <p>&copy; {new Date().getFullYear()} Expose. All Rights Reserved.</p>
          </footer>
        </div>

        {/* Telegram-like Chat Sidebar */}
        <div className={`fixed top-0 right-0 h-full w-80 transform transition-transform duration-300 z-40 ${
          isChatOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <TelegramChat />
        </div>
      </div>

      {/* Chat Toggle Button */}
      <ChatToggle isOpen={isChatOpen} onToggle={toggleChat} />
    </div>
  );
};

export default Posts;
