
import React from 'react';
import { Shield } from 'lucide-react';
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
    <div className="fixed bottom-6 right-6 z-50">
      {/* Secure Chat Button */}
      <Button
        onClick={handleSecureChat}
        className="h-12 w-12 rounded-full shadow-lg bg-green-600 hover:bg-green-700"
        size="icon"
        title="Secure Chat"
      >
        <Shield className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default ChatToggle;
