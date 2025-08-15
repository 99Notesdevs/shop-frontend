import { useEffect, useState } from 'react';
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

// Simple Skeleton component
const Skeleton = ({ className }: { className: string }) => (
  <div className={`bg-gray-100 animate-pulse rounded ${className}`} />
);

export function RelatedProducts({ currentProductId, categoryId, onAddToCart }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!categoryId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all products from the same category
        const response = await api.get(`/product`) as { success: boolean; data: Product[] };
        
        if (response.success) {
          // Filter out the current product and limit to 4 related products
          console.log("related products",response.data);
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
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [categoryId, currentProductId]);

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">You might also like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-4">
              <Skeleton className="w-full h-48 mb-4" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

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

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">You might also like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            description={product.description}
            price={product.price}
            salePrice={product.salePrice || product.price}
            imageUrl={product.imageUrl || '/placeholder-product.jpg'}
            category={product.category}
            onAddToCart={() => onAddToCart(product.id)}
          />
        ))}
      </div>
    </div>
  );
}
