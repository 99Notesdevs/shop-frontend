import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { ShoppingCart, Heart, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import StarRating from '../ui/StarRating';

interface ProductCardProps {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  salePrice: number;
  imageUrl: string;
  onAddToCart: (id: string) => void;
}

export function ProductCard({
  id,
  name,
  category,
  description,
  price,
  salePrice,
  imageUrl,
  onAddToCart,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const navigate = useNavigate();
  const { cart, user, wishlist = [], updateWishlist } = useAuth();
  const isWishlisted = wishlist.some(item => item.id === id);

  const isProductInCart = useCallback(() => {
    if (!cart || !cart.cartItems) return false;
    return cart.cartItems.some((item: any) => item.productId === id);
  }, [cart, id]);

  // Handle wishlist toggle
  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user?.id) {
      navigate('/login');
      return;
    }

    setWishlistLoading(true);
    try {
      await updateWishlist(id, isWishlisted ? 'remove' : 'add');
    } catch (error) {
      console.error('Error updating wishlist:', error);
    } finally {
      setWishlistLoading(false);
    }
  };


  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/product/${id}`);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Call the parent's onAddToCart function
      await onAddToCart(id.toString());
      
      // Show the cart sidebar by dispatching a custom event
      // The parent component should listen for this event and show the cart
      window.dispatchEvent(new CustomEvent('showCartSidebar'));
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      className="relative bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col group cursor-pointer border border-gray-100 hover:border-gray-200"
    >
      {/* Discount Badge */}
      {salePrice < price && (
        <div className="absolute top-3 left-3 z-10 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-heading)]  text-xs font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-md">
          {Math.round(((price - salePrice) / price) * 100)}%
        </div>
      )}
      
      {/* Wishlist Button */}
      <button 
        className={`absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm transition-all duration-200 hover:scale-110 cursor-pointer ${
          isWishlisted ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'
        }`}
        onClick={handleWishlistToggle}
        disabled={wishlistLoading}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {wishlistLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Heart 
            className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} 
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
          <div className="text-right">
            {salePrice && salePrice < price ? (
              <>
                <p className="text-lg font-bold text-gray-900">₹{salePrice?.toFixed?.(2) }</p>
                <p className="text-sm text-gray-500 line-through">₹{price?.toFixed?.(2) }</p>
              </>
            ) : (
              <p className="text-lg font-bold text-gray-900">₹{price?.toFixed?.(2)}</p>
            )}
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{description}</p>
        
        
        
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

        {/* Rating */}
        <div className="flex items-center justify-end mt-2">
          <StarRating productId={id} readonly={true} />
        </div>
      </div>
    </div>
  );
}
