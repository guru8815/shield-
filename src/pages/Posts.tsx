import React from 'react';
import Header from '@/components/Header';
import SocialPostCard from '@/components/SocialPostCard';
import ChatToggle from '@/components/ChatToggle';
import TelegramChat from '@/components/TelegramChat';
import { useState } from 'react';

export interface SocialPost {
  id: number;
  title: string;
  content: string;
  timestamp: string;
  tags: string[];
  type: 'text' | 'image' | 'video';
  location: string;
  likes: number;
  comments: number;
  shares: number;
}

const mockSocialPosts: SocialPost[] = [
  {
    id: 1,
    title: "Public Fund Misuse Investigation",
    content: "Recent investigation reveals potential misuse of public funds in the infrastructure development project. Community members are encouraged to stay informed and participate in oversight.",
    timestamp: "2 hours ago",
    tags: ["Investigation", "Public Funds"],
    type: 'text',
    location: "Downtown",
    likes: 45,
    comments: 12,
    shares: 8
  },
  {
    id: 2,
    title: "Transparency Initiative Update",
    content: "New transparency measures have been implemented to ensure better accountability in government processes. Citizens can now access more information about public spending.",
    timestamp: "5 hours ago",
    tags: ["Transparency", "Government"],
    type: 'image',
    location: "City Hall",
    likes: 78,
    comments: 23,
    shares: 15
  },
  {
    id: 3,
    title: "Community Watch Program",
    content: "Join our community watch program to help maintain oversight on local government activities. Together we can ensure transparency and accountability.",
    timestamp: "1 day ago",
    tags: ["Community", "Oversight"],
    type: 'text',
    location: "Various Districts",
    likes: 92,
    comments: 34,
    shares: 27
  }
];

const Posts = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

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
              {mockSocialPosts.map(post => (
                <SocialPostCard key={post.id} post={post} />
              ))}
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
