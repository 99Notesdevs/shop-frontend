import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { ShoppingCart } from 'lucide-react';

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

  return (
    <div 
      className="relative bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Product Image */}
      <div className="relative pt-[100%] bg-gray-100">
        <img
          src={imageUrl}
          alt={name}
          className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        
        {/* Category Badge */}
        <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
          {category}
        </span>
        
        {/* Hover Description */}
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 transition-opacity duration-300">
            <p className="text-white text-sm text-center">{description}</p>
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex-grow">
          <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">{name}</h3>
          <p className="text-sm text-gray-500 mb-3">{category}</p>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-semibold">₹{price.toFixed(2)}</span>
          <Button 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(id);
            }}
            className="flex items-center gap-1"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Add to Cart</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
