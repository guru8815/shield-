
import { useState } from 'react';
import Header from '@/components/Header';
import SubmissionForm from '@/components/SubmissionForm';
import PostFeed from '@/components/PostFeed';
import TelegramChat from '@/components/TelegramChat';
import ChatToggle from '@/components/ChatToggle';

const Index = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="min-h-screen bg-background text-foreground w-full relative overflow-x-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/10 opacity-20 blur-[100px]"></div>
      </div>
      
      <div className="flex h-screen">
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${isChatOpen ? 'mr-80' : 'mr-0'}`}>
          <Header />
          
          <main className="container mx-auto px-4 py-8">
            <SubmissionForm />
            <PostFeed />
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

export default Index;
