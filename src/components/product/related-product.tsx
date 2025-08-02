import { useEffect, useState } from 'react';
import { api } from '../../api/route';
import { ProductCard } from './product-card';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

interface RelatedProductsProps {
  currentProductId: string | number;
  categoryId: string | number;
  onAddToCart: (id: string) => void;
}

// Simple Skeleton component if not available in UI library
const Skeleton = ({ className }: { className: string }) => (
  <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
);

export function RelatedProducts({ currentProductId, categoryId, onAddToCart }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        console.log('Fetching products...');
        // Fetch all products and filter by category on the client side
        const response = await api.get('/product') as { success: boolean; data: Product[] };
        console.log('API Response:', response);
        const products = response.data || [];
        
        console.log('All products:', products);
        console.log('Current product ID:', currentProductId);
        console.log('Category ID to match:', categoryId);
        
        // Filter out the current product and get products from the same category
        const filteredProducts = products.filter(
          (product: Product) => {
            const isNotCurrent = String(product.id) !== String(currentProductId);
            const isSameCategory = String(product.category) === String(categoryId);
            console.log(`Product ${product.id}: isNotCurrent=${isNotCurrent}, isSameCategory=${isSameCategory}`);
            return isNotCurrent && isSameCategory;
          }
        );
        
        console.log('Filtered products:', filteredProducts);
        
        // Limit to 4 related products
        const limitedProducts = filteredProducts.slice(0, 4);
        console.log('Limited products:', limitedProducts);
        setRelatedProducts(limitedProducts);
      } catch (err) {
        console.error('Error fetching related products:', err);
        setError('Failed to load related products');
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchRelatedProducts();
    }
  }, [currentProductId, categoryId]);

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
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
            imageUrl={product.imageUrl}
            category={product.category}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </div>
  );
}
