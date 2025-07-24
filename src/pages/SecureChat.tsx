import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, Paperclip, Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import BottomNavigation from '@/components/BottomNavigation';

const SecureChat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Welcome to Secure Chat. Your messages are end-to-end encrypted.",
      sender: "system",
      timestamp: "10:30 AM",
      encrypted: true
    }
  ]);
  const [showEncryption, setShowEncryption] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: message,
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        encrypted: true
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <div className="bg-card/95 backdrop-blur-sm border-b border-border p-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-green-500" />
              <h1 className="text-lg font-semibold">Secure Chat</h1>
            </div>
            <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
              <Lock className="h-3 w-3 mr-1" />
              E2E Encrypted
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowEncryption(!showEncryption)}
            className="h-8 w-8"
          >
            {showEncryption ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        
        {showEncryption && (
          <div className="mt-3 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
            <div className="text-xs text-green-600 space-y-1">
              <p><strong>Security Level:</strong> Maximum</p>
              <p><strong>Encryption:</strong> AES-256 + RSA-4096</p>
              <p><strong>IP Protection:</strong> Active (Rotating every 10s)</p>
              <p><strong>File Scanning:</strong> AI + Sandbox Enabled</p>
            </div>
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4">
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <Card className={`max-w-xs p-3 ${
                  msg.sender === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : msg.sender === 'system'
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-muted'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm break-words flex-1">{msg.text}</p>
                    {msg.encrypted && (
                      <Lock className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                  <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                </Card>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Message Input */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-card/95 backdrop-blur-sm border-t border-border">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Button type="button" variant="ghost" size="icon" className="h-10 w-10">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a secure message..."
            className="flex-1"
          />
          <Button type="submit" size="icon" className="h-10 w-10">
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-xs text-center text-muted-foreground mt-2">
          Messages are encrypted and will auto-delete after 24 hours
        </p>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default SecureChat;