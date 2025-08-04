import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';
import { LogIn, ChevronDown, ShoppingCart, Heart } from 'lucide-react';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <div className="w-full" />
      <nav className="sticky top-0 w-full bg-[var(--bg-light)] shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] z-40 h-20 flex items-center px-8 transition-colors duration-200">
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
              <div className="flex items-center gap-2 focus:outline-none cursor-pointer py-2 px-1 rounded-md hover:bg-[var(--bg-light-secondary)] transition-colors">
                <img
                  src={`https://ui-avatars.com/api/?name=${user?.firstName ? `${user.firstName}+${user.lastName || ''}` : 'User'}&background=random`}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full border-2 border-[var(--border-light)] object-cover"
                />
                <span className="hidden md:inline text-sm font-medium text-[var(--text-light)]">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User'}
                </span>
                <ChevronDown className="w-4 h-4 text-[var(--text-light)]" />
              </div>

              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-light)] rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-200">
                <div className="py-1">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-light-secondary)]"
                  >
                    Your Profile
                  </Link>
                  <div className="border-t border-[var(--border-light)] my-1"></div>
                  <Link
                    to="/myorders"
                    className="block px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-light-secondary)]"
                  >
                    My Orders
                  </Link>
                  <div className="border-t border-[var(--border-light)] my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--red-600)] hover:bg-[var(--bg-light-secondary)]"
                  >
                    Sign out
                  </button>

                </div>
              </div>
            </div>
          )}
          {/* Cart Icon */}
          <button
            onClick={() => navigate('/cart')}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors relative"
            aria-label="Cart"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>

          {/* Wishlist Icon */}
          <button
            onClick={() => navigate('/wishlist')}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;