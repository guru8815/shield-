
import React from 'react';
import { Button } from "@/components/ui/button";
import { Home, FileText, LogIn, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/posts', label: 'Posts', icon: FileText },
    { path: '/login', label: 'Login', icon: LogIn },
  ];

  return (
    <nav className="flex items-center space-x-2">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Button
            key={item.path}
            asChild
            variant={isActive ? "default" : "ghost"}
            size="sm"
            className="flex items-center space-x-2"
          >
            <Link to={item.path}>
              <item.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          </Button>
        );
      })}
    </nav>
  );
};

export default Navigation;
