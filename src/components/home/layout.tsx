import Navbar from './Navbar';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Footer from './footer';
import Navigation from './navigation';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

interface HomeLayoutProps {
  children: React.ReactNode;
}

export const HomeLayout: React.FC<HomeLayoutProps> = ({
  children,
}) => {
  const { user } = useAuth();

  useEffect(() => {
    const handleResize = () => {
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
        <Navbar  user={user as User} />
        <Navigation />
        <div className="flex flex-1 relative h-[calc(100vh-4rem)]">
            <div className="w-full">
              {children}
            </div>
        </div>
        <Footer />
    </div>
  );
};
