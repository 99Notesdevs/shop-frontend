import Navbar from './Navbar';
import { useEffect } from 'react';
import Footer from './footer';
import UserModal from '../UserModal';

// interface User {
//   id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   avatar?: string;
// }

interface HomeLayoutProps {
  children: React.ReactNode;
}

export const HomeLayout: React.FC<HomeLayoutProps> = ({
  children,
}) => {
  // const { user } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      // Handle resize logic if needed
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <Navbar />
      
      <div className="flex flex-1 relative h-[calc(100vh-4rem)]">
        <div className="w-full">
          {children}
        </div>
      </div>
      
      <Footer />
      <UserModal />
    </div>
  );
};
