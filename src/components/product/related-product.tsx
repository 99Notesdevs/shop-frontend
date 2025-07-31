import { useEffect, useState, useRef } from 'react';
import { ProductCard } from './product-card';
import { api } from '../../api/route';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: {
    id: number;
    name: string;
  };
}

interface ApiResponse {
  success: boolean;
  data: {
    products: Product[];
  };
}

interface RelatedProductsProps {
  categoryId: number;
  currentProductId: number;
  onAddToCart: (id: string) => void;
}

export function RelatedProducts({ categoryId, currentProductId, onAddToCart }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300, // Adjust scroll distance as needed
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300, // Adjust scroll distance as needed
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        // Fetch products from the same category using the API instance
        const response = await api.get<ApiResponse>(`/products?categoryId=${categoryId}`);
        
        if (response.success) {
          // Filter out the current product and limit to 15 related products
          const filteredProducts = response.data.products
            .filter((product) => product.id !== currentProductId)
            .slice(0, 15);
          
          setRelatedProducts(filteredProducts);
        }
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchRelatedProducts();
    }
  }, [categoryId, currentProductId]);

  if (loading) {
    return <div className="mt-8">Loading related products...</div>;
  }

  if (relatedProducts.length === 0) {
    return null; // Don't render anything if no related products
  }

  return (
    <div className="mt-12 relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">You may also like</h3>
        <div className="flex space-x-2">
          <button 
            onClick={scrollLeft}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Scroll left"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={scrollRight}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Scroll right"
          >
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto pb-4 -mx-4 px-4 gap-6 no-scrollbar"
      >
        {relatedProducts.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-64">
            <ProductCard
              id={product.id.toString()}
              name={product.name}
              category={product.category?.name || 'Uncategorized'}
              description={product.description || ''}
              price={product.price}
              imageUrl={product.imageUrl || '/placeholder-product.jpg'}
              onAddToCart={onAddToCart}
            />
          </div>
        ))}
      </div>
      
      <style>{`
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;  /* Chrome, Safari and Opera */
        }
      `}</style>
    </div>
  );
}
