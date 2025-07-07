
import React from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ChatToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

const ChatToggle = ({ isOpen, onToggle }: ChatToggleProps) => {
  return (
    <Button
      onClick={onToggle}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90"
      size="icon"
    >
      {isOpen ? (
        <X className="h-6 w-6" />
      ) : (
        <MessageCircle className="h-6 w-6" />
      )}
    </Button>
  );
};

export default ChatToggle;
