import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { ShoppingCart, Star, ChevronRight } from 'lucide-react';

interface ProductCardProps {
  id: string;
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
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/product/${id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(id);
  };

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      className="relative bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md h-full flex flex-col group cursor-pointer"
    >
      {/* Product Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      
      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-base font-medium text-gray-900 line-clamp-1">{name}</h3>
          <p className="text-base font-bold text-gray-900">₹{price.toFixed(2)}</p>
        </div>
        
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{description}</p>
        
        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={`w-4 h-4 ${star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">(24)</span>
        </div>
        
        {/* Buttons */}
        <div className="mt-auto pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs flex items-center gap-1 border-gray-300 hover:bg-gray-50 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(e);
              }}
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </Button>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick(e);
              }}
              className="text-xs text-gray-600 hover:text-gray-900 flex items-center transition-colors"
            >
              View Details
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
