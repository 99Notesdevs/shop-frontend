import { useEffect, useState, useRef } from 'react';
import { api } from '../../api/route';
import { ProductCard } from './product-card';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  imageUrl: string;
  category: string;
  stock: number;
}

interface RelatedProductsProps {
  currentProductId: string | number;
  categoryId: string | number;
  onAddToCart: (productId: number) => void;
}

export function RelatedProducts({ currentProductId, categoryId, onAddToCart }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!categoryId) return;
      
      try {
        setError(null);
        
        // Fetch all products from the same category
        const response = await api.get(`/product?skip=0&take=20`) as { success: boolean; data: Product[] };
        console.log("related products",response.data);
        
        if (response.success) {
          // Filter out the current product and limit to 4 related products
          const filteredProducts = response.data
            .filter((product: Product) => product.id.toString() !== currentProductId.toString())
            .slice(0, 4);
            
          setRelatedProducts(filteredProducts);
        } else {
          throw new Error('Failed to fetch related products');
        }
      } catch (err) {
        console.error('Error fetching related products:', err);
        setError('Failed to load related products');
      }
    };

    fetchRelatedProducts();
  }, [categoryId, currentProductId]);

  if (error) {
    return (
      <div className="mt-12 text-center py-8">
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null; // Don't show anything if no related products
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="mt-12 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">You might also like</h2>
        <div className="flex space-x-2">
          <button 
            onClick={scrollLeft}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Scroll left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            onClick={scrollRight}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Scroll right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      <div 
        ref={scrollContainerRef}
        className="flex space-x-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide"
        style={{ scrollbarWidth: 'none' }} // Hide scrollbar for Firefox
      >
        {relatedProducts.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-64">
            <ProductCard
              id={product.id}
              name={product.name}
              description={product.description}
              price={product.price}
              salePrice={product.salePrice || product.price}
              imageUrl={product.imageUrl || '/placeholder-product.jpg'}
              category={product.category}
              onAddToCart={() => onAddToCart(product.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
