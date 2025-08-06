import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { ShoppingCart, Heart, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../api/route';
import StarRating from '../ui/star-rating';

interface ProductCardProps {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  imageUrl: string;
  onAddToCart: (id: string) => void;
}

export function ProductCard({
  id,
  name,
  category,
  description,
  price,
  imageUrl,
  onAddToCart,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const navigate = useNavigate();
  const { cart, user } = useAuth();

  const isProductInCart = useCallback(() => {
    if (!cart || !cart.cartItems) return false;
    return cart.cartItems.some((item: any) => item.productId === id);
  }, [cart, id]);

  // Define types for wishlist items
  interface Product {
    id: number;
    title: string;
    [key: string]: any;
  }

  interface WishlistResponse {
    data?: {
      products?: any[];
      [key: string]: any;
    };
    [key: string]: any;
  }

  // Check if product is in wishlist
  const checkWishlistStatus = useCallback(async () => {
    if (!user?.id) {
      console.log('No user ID, setting isInWishlist to false');
      setIsInWishlist(false);
      return;
    }
    
    try {
      const response = await api.get<WishlistResponse>(`/wishlist/${user.id}`);
      
      // Extract products from the response
      let products: any[] = [];
      const responseData = response as any; // Type assertion to handle dynamic response
      
      // Handle different response formats
      if (responseData?.data?.products && Array.isArray(responseData.data.products)) {
        // Standard format: { data: { products: [...] } }
        products = responseData.data.products;
      } else if (Array.isArray(responseData?.data)) {
        // Direct array format: { data: [...] }
        products = responseData.data;
      } else if (Array.isArray(responseData)) {
        // Raw array format: [...]
        products = responseData;
      }
      
      console.log('Products in wishlist:', products);
      
      // Check if the current product is in the wishlist
      const isWishlisted = products.some((product: any) => {
        if (!product) return false;
        
        // Try different possible ID fields
        const productId = product.id || (product.product && product.product.id);
        if (productId === undefined) return false;
        
        const matches = String(productId) === String(id);
        
        if (matches) {
          console.log('Found matching product in wishlist:', {
            productId,
            targetId: id,
            product
          });
        }
        
        return matches;
      });
      setIsInWishlist(isWishlisted);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      setIsInWishlist(false);
    }
  }, [user, id]);

  // Check wishlist status on component mount, when user changes, or when auth state changes
  useEffect(() => {
    // Only check if we have a user ID
    if (user?.id) {
      console.log('Checking wishlist status for user:', user.id);
      checkWishlistStatus();
    } else {
      console.log('No user, setting isInWishlist to false');
      setIsInWishlist(false);
    }
    
    // Set up an interval to periodically check wishlist status
    // This helps if the wishlist was updated in another tab/window
    const intervalId = setInterval(() => {
      if (user?.id) {
        checkWishlistStatus();
      }
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(intervalId);
  }, [checkWishlistStatus, user?.id]);
  
  // Also check wishlist status when the component becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkWishlistStatus();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkWishlistStatus]);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      alert('Please login to manage your wishlist');
      navigate('/login');
      return;
    }

    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        await api.delete(`/wishlist/${id}/${user.id}`);
        setIsInWishlist(false);
      } else {
        await api.post(`/wishlist/${id}/${user.id}`);
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      alert('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/product/${id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(id.toString());
  };

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      className="relative bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col group cursor-pointer border border-gray-100 hover:border-gray-200"
    >
      {/* Wishlist Button */}
      <button 
        className={`absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm transition-all duration-200 hover:scale-110 ${
          isInWishlist ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'
        }`}
        onClick={toggleWishlist}
        disabled={wishlistLoading}
        aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {wishlistLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Heart 
            className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} 
          />
        )}
      </button>
      
      {/* Product Image */}
      <div className="relative h-56 overflow-hidden bg-gray-50">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Quick Action Buttons - Only shows on hover */}
        <div className={`absolute inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center opacity-0 ${isHovered ? 'opacity-100' : ''} transition-opacity duration-300`}>
          {isProductInCart() ? (
            <Button 
              variant="outline"
              size="sm"
              className="bg-white/90 text-green-600 hover:bg-white hover:text-green-700 shadow-md px-6 py-5 rounded-full font-medium flex items-center gap-2 transform transition-all hover:scale-105"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/cart');
              }}
            >
              <Check className="w-4 h-4" />
              In Cart
            </Button>
          ) : (
            <Button 
              variant="outline"
              size="sm"
              className="bg-white/90 text-gray-900 hover:bg-white hover:text-gray-900 shadow-md px-6 py-5 rounded-full font-medium flex items-center gap-2 transform transition-all hover:scale-105"
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(e);
              }}
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </Button>
          )}
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{name}</h3>
          <p className="text-lg font-bold text-gray-900">₹{price.toFixed(2)}</p>
        </div>
        
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{description}</p>
        
        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex">
          {/* <StarRating productId={ProductC.id} size={16} readOnly showUserRating /> */}
          </div>
        </div>
        
        {/* Category and Cart Status */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
          <span className="inline-block px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
            {category}
          </span>
          {isProductInCart() && (
            <span className="text-xs text-green-600 font-medium flex items-center">
              <Check className="w-3 h-3 mr-1" /> In Cart
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
