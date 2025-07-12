
import { Shield, Search, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from 'react';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // TODO: Implement search functionality
    }
  };

  const handlePublicChat = () => {
    console.log('Opening public chat');
    // TODO: Implement public chat functionality
  };

  return (
    <header className="py-6 border-b border-border/20">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Shield className="h-8 w-8 text-primary mr-3" />
          <div>
            <h1 className="text-3xl font-bold tracking-tighter text-primary">
              SHIELD
            </h1>
            <p className="text-muted-foreground text-sm">Your Voice, Shielded.</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search posts, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </form>
          
          {/* Public Chat Button */}
          <Button
            onClick={handlePublicChat}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Public Chat</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
