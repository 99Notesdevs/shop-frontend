import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { env } from '../../config/env';
import logo from '../../assets/logo.png';
import { LogIn, ChevronDown, ShoppingCart, Heart, Menu, X } from 'lucide-react';
import { api } from '../../api/route';
import { SearchBar } from './search-bar';
import { OfferMessageDisplay } from './offer-message';
import { CartSidebar } from '../ui/cart-sidebar';
import { useAuthModal } from '../../hooks/useAuthModal';
interface Category {
  _id: string;
  name: string;
  slug: string;
}

const Navbar: React.FC = () => {
  const { 
    isAuthenticated, 
    logout, 
    user, 
    cartItems, 
    cart, 
    isCartOpen, 
    openCart, 
    closeCart,
    wishlistCount,
    updateWishlistCount
  } = useAuth();
  
  // Debug log to check cart data
  useEffect(() => {
  }, [cartItems, cart]);
  const { showLogin } = useAuthModal();
  // Fetch wishlist count
  useEffect(() => {
    const fetchWishlistCount = async () => {
      if (!isAuthenticated) return;
      
      try {
        const response = await fetch(`${env.API}/wishlist/${user?.id}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const wishlistProducts = data.data?.products || [];
          updateWishlistCount(wishlistProducts.length);
        }
      } catch (error) {
        console.error('Error fetching wishlist count:', error);
      }
    };

    fetchWishlistCount();
  }, [isAuthenticated, user?.id, updateWishlistCount]);
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get<any>('/category');
        console.log('Categories API Response:', response);
        // Handle different possible response structures
        if (Array.isArray(response)) {
          setCategories(response);
        } else if (response && Array.isArray(response.data)) {
          setCategories(response.data);
        } else if (response && response.categories) {
          setCategories(response.categories);
        } else {
          throw new Error('Unexpected API response format');
        }
      } catch (err) {
        setError('Failed to load categories');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (category: Category) => {
    // Use the slug if available, otherwise convert name to URL-friendly format
    const slug = category.slug || category.name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/products/category/${slug}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

return (
    <>
      
      <div className="w-full" />
      <div className="w-full h-10">
      <OfferMessageDisplay />
      </div>
      <nav className="sticky top-0 w-full bg-[var(--bg-light)] shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] z-40 h-20 flex items-center px-4 md:px-10 transition-colors duration-200">
        <CartSidebar isOpen={isCartOpen} onClose={closeCart} />
        
        {/* Mobile Menu Button */}
        <button
          className="hidden p-2 mr-2"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

        {/* Left Section - Logo and Search */}
        <div className="flex items-center flex-1">
          <Link to="/" className="mr-4">
            <img
              className="md:w-25 md:h-10 w-20 h-7"
              src={logo}
              alt="99notes"
            />
          </Link>
          <div className="hidden md:block w-100 ml-20 mr-4">
            <SearchBar />
          </div>
        </div>

        {/* Center Section - Categories (Desktop Only) */}
        <div className="hidden xl:flex flex-1 justify-end mr-6">
          <div className="flex items-center space-x-6">
            {loading ? (
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            ) : error ? (
              <span className="text-sm text-red-500">{error}</span>
            ) : (
              categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => handleCategoryClick(category)}
                  className="text-sm font-medium text-[var(--text-light)] hover:text-[var(--indigo-600)] transition-colors cursor-pointer"
                >
                  {category.name}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Section - Navigation */}
        <div className="flex items-center gap-2 md:gap-4">
          {!isAuthenticated ? (
            <button
              onClick={() => showLogin()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--indigo-600)] rounded-md hover:bg-[var(--indigo-700)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--indigo-500)] transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden md:inline">Login</span>
            </button>
          ) : (
            <div className="relative group">
              <div className="flex items-center gap-2 focus:outline-none cursor-pointer py-2 px-1 rounded-md hover:bg-[var(--bg-light-secondary)] transition-colors">
                <img
                  src={`https://ui-avatars.com/api/?name=${user?.firstName}&background=random`}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full border-2 border-[var(--border-light)] object-cover"
                />
                <span className="hidden md:inline text-sm font-medium text-[var(--text-light)]">
                  {user?.firstName}
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
            onClick={openCart}
            className="relative p-2 text-gray-700 hover:text-gray-900 cursor-pointer"
            aria-label="Open cart"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartItems?.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[var(--primary)] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </button>

          {/* Wishlist Icon */}
          <button
            onClick={() => navigate('/wishlist')}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors relative cursor-pointer"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {isAuthenticated && wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[var(--primary)] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {wishlistCount > 9 ? '9+' : wishlistCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-[var(--bg-light)]">
          <div className="p-4 pt-20">
            {/* Mobile Search */}
            <div className="mb-6">
              <SearchBar />
            </div>

            {/* Mobile Categories */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-2">Categories</h3>
              {loading ? (
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              ) : error ? (
                <span className="text-sm text-red-500">{error}</span>
              ) : (
                categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => {
                      handleCategoryClick(category);
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-[var(--text-light)] hover:bg-[var(--bg-light-secondary)] rounded-md transition-colors"
                  >
                    {category.name}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;