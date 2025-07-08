
import { Shield } from 'lucide-react';
import Navigation from './Navigation';

const Header = () => {
  return (
    <header className="py-6 border-b border-border/20">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Shield className="h-8 w-8 text-primary mr-3" />
          <div>
            <h1 className="text-3xl font-bold tracking-tighter text-primary">
              EXPOSE
            </h1>
            <p className="text-muted-foreground text-sm">Your Voice, Shielded.</p>
          </div>
        </div>
        <Navigation />
      </div>
    </header>
  );
};

export default Header;
