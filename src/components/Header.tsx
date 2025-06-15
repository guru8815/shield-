
import { Shield } from 'lucide-react';

const Header = () => {
  return (
    <header className="py-6">
      <div className="container mx-auto flex items-center justify-center">
        <Shield className="h-8 w-8 text-primary mr-3" />
        <h1 className="text-3xl font-bold tracking-tighter text-primary">
          EXPOSE
        </h1>
      </div>
      <p className="text-center text-muted-foreground mt-2">Your Voice, Shielded.</p>
    </header>
  );
};

export default Header;
