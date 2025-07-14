import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';
import { ToggleMode } from './togglemode';
import { LogIn, ChevronDown } from 'lucide-react';

interface User {
  _id?: string;
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
      <nav className="sticky top-0 w-full bg-white shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] z-40 h-16 flex items-center px-8">
        {/* Left Section - Logo */}
        <div className="flex-1 flex">
          <Link to="/">
            <img 
              className="w-22 h-8" 
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
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
          ) : (
            <div className="relative group">
              <div className="flex items-center gap-2 focus:outline-none cursor-pointer py-2 px-1 rounded-md hover:bg-gray-100">
                <img 
                  src={`https://ui-avatars.com/api/?name=${user?.firstName+" "+user?.lastName || 'User'}&background=random`}
                  alt="User Avatar" 
                  className="w-8 h-8 rounded-full border-2 border-gray-200 object-cover"
                />
                <span className="hidden md:inline text-sm font-medium text-gray-700">
                  {user?.firstName+" "+user?.lastName || 'User'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
              
              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Your Profile
                </Link>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
          
          <ToggleMode />
        </div>
      </nav>
    </>
  );
};

export default Navbar;