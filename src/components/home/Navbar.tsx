import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';
import { ToggleMode } from './togglemode';
import { LogIn, ChevronDown, ShoppingCart, Heart } from 'lucide-react';

interface User {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  // Add other user properties as needed
}

interface NavbarProps {
  user?: User;
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <>
      <div className="w-full" />
      <nav className="sticky top-0 w-full bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] dark:shadow-[0_2px_10px_-3px_rgba(255,255,255,0.1)] z-40 h-20 flex items-center px-8 transition-colors duration-200">
        {/* Left Section - Logo */}
        <div className="flex-1 flex">
          <Link to="/">
            <img 
              className="md:w-25 md:h-10 w-22 h-8 ml-5" 
              src={logo} 
              alt="99notes"
            />
          </Link>
        </div>

        {/* Right Section - Navigation */}
        <div className="flex items-center gap-4">
         
          
          {!isAuthenticated ? (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--indigo-600)] rounded-md hover:bg-[var(--indigo-700)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--indigo-500)] transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
          ) : (
            <div className="relative group">
              <div className="flex items-center gap-2 focus:outline-none cursor-pointer py-2 px-1 rounded-md hover:bg-[var(--bg-light-secondary)] dark:hover:bg-[var(--bg-dark-secondary)] transition-colors">
                <img 
                  src={`https://ui-avatars.com/api/?name=${user?.firstName+" "+user?.lastName || 'User'}&background=random`}
                  alt="User Avatar" 
                  className="w-8 h-8 rounded-full border-2 border-[var(--border-light)] dark:border-[var(--border-dark)] object-cover"
                />
                <span className="hidden md:inline text-sm font-medium text-[var(--text-light)] dark:text-[var(--text-dark)]">
                  {user?.firstName+" "+user?.lastName || 'User'}
                </span>
                <ChevronDown className="w-4 h-4 text-[var(--text-light)] dark:text-[var(--text-dark)]" />
              </div>
              
              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] rounded-md shadow-lg py-1 z-50 hidden group-hover:block border border-gray-200 dark:border-gray-700">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-[var(--text-primary)] dark:text-[var(--text-dark)] hover:bg-[var(--bg-light-secondary)] dark:hover:bg-[var(--bg-dark-secondary)]"
                >
                  Your Profile
                </Link>
                <div className="border-t border-[var(--border-light)] dark:border-[var(--border-dark)] my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-[var(--red-600)] hover:bg-[var(--bg-light-secondary)] dark:hover:bg-[var(--bg-dark-secondary)]"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
           {/* Cart Icon */}
           <button 
            onClick={() => navigate('/cart')}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:text-[var(--text-dark)] dark:hover:text-white transition-colors relative"
            aria-label="Cart"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
          
          {/* Wishlist Icon */}
          <button 
            onClick={() => navigate('/wishlist')}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:text-[var(--text-dark)] dark:hover:text-white transition-colors"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
          </button>
          
          <ToggleMode />
        </div>
      </nav>
    </>
  );
};

export default Navbar;