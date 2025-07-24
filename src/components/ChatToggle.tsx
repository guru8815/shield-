
import React from 'react';
import { MessageCircle, X, Shield } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

interface ChatToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

const ChatToggle = ({ isOpen, onToggle }: ChatToggleProps) => {
  const navigate = useNavigate();

  const handleSecureChat = () => {
    navigate('/secure-chat');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* Secure Chat Button */}
      <Button
        onClick={handleSecureChat}
        className="h-12 w-12 rounded-full shadow-lg bg-green-600 hover:bg-green-700"
        size="icon"
        title="Secure Chat"
      >
        <Shield className="h-5 w-5" />
      </Button>
      
      {/* Public Chat Button */}
      <Button
        onClick={onToggle}
        className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
        size="icon"
        title="Public Chat"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
};

export default ChatToggle;
