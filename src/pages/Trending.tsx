
import React, { useState } from 'react';
import Header from '@/components/Header';
import ChatToggle from '@/components/ChatToggle';
import TelegramChat from '@/components/TelegramChat';
import SocialPostCard from '@/components/SocialPostCard';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Flame, Eye, MessageCircle } from 'lucide-react';
import { SocialPost } from './Posts';

const trendingPosts: SocialPost[] = [
  {
    id: 1,
    title: "Major Corruption Scandal Exposed",
    content: "Breaking: Investigation reveals systematic corruption in government contracts worth millions. Citizens demand immediate action and transparency.",
    timestamp: "4 hours ago",
    tags: ["Breaking", "Corruption", "Government"],
    type: 'text',
    location: "Capital City",
    likes: 1247,
    comments: 356,
    shares: 189
  },
  {
    id: 2,
    title: "Whistleblower Protection Act",
    content: "New legislation proposed to strengthen protection for those who expose corruption. Community rallying for support.",
    timestamp: "8 hours ago",
    tags: ["Legal", "Protection", "Advocacy"],
    type: 'image',
    location: "Parliament",
    likes: 892,
    comments: 203,
    shares: 145
  },
  {
    id: 3,
    title: "Anonymous Tip Leads to Arrest",
    content: "Thanks to an anonymous report through our platform, authorities have made a significant arrest in an ongoing fraud case.",
    timestamp: "12 hours ago",
    tags: ["Success", "Anonymous", "Justice"],
    type: 'text',
    location: "Downtown",
    likes: 756,
    comments: 167,
    shares: 234
  }
];

const trendingTopics = [
  { name: "Government Transparency", posts: 45, trend: "up" },
  { name: "Corruption Exposed", posts: 32, trend: "up" },
  { name: "Whistleblower Rights", posts: 28, trend: "up" },
  { name: "Public Accountability", posts: 21, trend: "up" },
  { name: "Anonymous Reporting", posts: 18, trend: "stable" }
];

const Trending = () => {
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
        <div className={`flex-1 transition-all duration-300 ${isChatOpen ? 'mr-80' : 'mr-0'}`}>
          <Header />
          
          <main className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center mb-8">
              <TrendingUp className="h-8 w-8 text-primary mr-3" />
              <h2 className="text-3xl font-bold">Trending Now</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Trending Topics Sidebar */}
              <div className="lg:col-span-1">
                <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/10 sticky top-8">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Flame className="h-5 w-5 text-orange-500 mr-2" />
                      Trending Topics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {trendingTopics.map((topic, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
                        <div>
                          <p className="font-medium text-sm">{topic.name}</p>
                          <p className="text-xs text-muted-foreground">{topic.posts} posts</p>
                        </div>
                        <TrendingUp className={`h-4 w-4 ${topic.trend === 'up' ? 'text-green-500' : 'text-gray-400'}`} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Trending Posts */}
              <div className="lg:col-span-2 space-y-8">
                {trendingPosts.map((post, index) => (
                  <div key={post.id} className="relative">
                    {index === 0 && (
                      <Badge className="absolute -top-3 -left-3 z-10 bg-orange-500 text-white">
                        <Flame className="h-3 w-3 mr-1" />
                        Hot
                      </Badge>
                    )}
                    <SocialPostCard post={post} />
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>

        <div className={`fixed top-0 right-0 h-full w-80 transform transition-transform duration-300 z-40 ${
          isChatOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <TelegramChat />
        </div>
      </div>

      <ChatToggle isOpen={isChatOpen} onToggle={toggleChat} />
    </div>
  );
};

export default Trending;
