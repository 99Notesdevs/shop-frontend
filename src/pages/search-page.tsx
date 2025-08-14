import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/product/product-card';
import { api } from '../api/route';
// Button component not currently used
import { Loader2 } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  salePrice: number;
  imageUrl: string;
  category: string;
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        interface ApiResponse {
          data?: any[];
          [key: string]: any;
        }
        
        const response = await api.get<ApiResponse>(`/search/global?query=${encodeURIComponent(query)}`);
        
        // Transform the response data to handle both array and object formats
        let responseData = [];
        if (Array.isArray(response.data)) {
          responseData = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // Convert object with numeric keys to array
          responseData = Object.values(response.data).filter(item => typeof item === 'object' && item !== null);
        }
        
        const transformedProducts = responseData.map((item: any) => ({
          id: item.id,
          name: item.name || item.title || '',
          description: item.description || '',
          price: item.price || 0,
          salePrice: item.salePrice || item.price || 0,
          imageUrl: item.imageUrl || (Array.isArray(item.images) ? item.images[0] : '') || '',
          category: item.category || ''
        }));
        
        setProducts(transformedProducts);
        setError(null);
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('Failed to load search results. Please try again.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  const handleAddToCart = (productId: string) => {
    // Implement add to cart functionality
    console.log('Add to cart:', productId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Searching for products...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Search for products</h2>
        <p>Enter a search term to find products</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">No results found for "{query}"</h2>
        <p>Try a different search term or check back later for new arrivals.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Search results for "{query}" ({products.length} {products.length === 1 ? 'item' : 'items'})
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            description={product.description}
            price={product.price}
            salePrice={product.salePrice}
            imageUrl={product.imageUrl}
            category={product.category}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    </div>
  );
}
