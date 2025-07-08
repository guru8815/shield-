
import React, { useState } from 'react';
import Header from '@/components/Header';
import ChatToggle from '@/components/ChatToggle';
import TelegramChat from '@/components/TelegramChat';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, Shield, AlertTriangle } from 'lucide-react';

interface Update {
  id: number;
  title: string;
  description: string;
  timestamp: string;
  type: 'security' | 'feature' | 'alert' | 'info';
  isNew: boolean;
}

const mockUpdates: Update[] = [
  {
    id: 1,
    title: "Security Enhancement",
    description: "New encryption protocols have been implemented to better protect anonymous submissions.",
    timestamp: "2 hours ago",
    type: 'security',
    isNew: true
  },
  {
    id: 2,
    title: "Feature Update",
    description: "Added new categories for corruption reporting with enhanced anonymity features.",
    timestamp: "1 day ago",
    type: 'feature',
    isNew: true
  },
  {
    id: 3,
    title: "System Alert",
    description: "Scheduled maintenance will occur tonight from 2-4 AM to improve system performance.",
    timestamp: "2 days ago",
    type: 'alert',
    isNew: false
  },
  {
    id: 4,
    title: "Community Guidelines",
    description: "Updated community guidelines to ensure better protection for whistleblowers.",
    timestamp: "3 days ago",
    type: 'info',
    isNew: false
  }
];

const Updates = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security': return <Shield className="h-5 w-5 text-blue-500" />;
      case 'feature': return <Bell className="h-5 w-5 text-green-500" />;
      case 'alert': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      security: 'bg-blue-500/10 text-blue-500',
      feature: 'bg-green-500/10 text-green-500',
      alert: 'bg-orange-500/10 text-orange-500',
      info: 'bg-gray-500/10 text-gray-500'
    };
    return colors[type as keyof typeof colors] || colors.info;
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
            <h2 className="text-3xl font-bold text-center mb-8">Latest Updates</h2>
            <div className="space-y-6 max-w-4xl mx-auto">
              {mockUpdates.map(update => (
                <Card key={update.id} className="bg-card/50 backdrop-blur-sm border-2 border-primary/10">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(update.type)}
                        <CardTitle className="text-lg">{update.title}</CardTitle>
                        {update.isNew && <Badge className="bg-primary text-primary-foreground">New</Badge>}
                      </div>
                      <Badge className={getTypeBadge(update.type)} variant="outline">
                        {update.type.charAt(0).toUpperCase() + update.type.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-3">{update.description}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {update.timestamp}
                    </div>
                  </CardContent>
                </Card>
              ))}
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

export default Updates;
