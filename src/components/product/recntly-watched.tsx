import { useEffect, useState } from 'react';
import { ProductCard } from './product-card';
import { useNavigate } from 'react-router-dom';

export interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  salePrice: number;
  imageUrl: string;
}

export function addToRecentlyViewed(product: Product) {
  try {
    const stored = localStorage.getItem('recentlyViewed');
    let items: Product[] = [];
    
    if (stored) {
      items = JSON.parse(stored);
      // Remove the product if it already exists to avoid duplicates
      items = items.filter((item: Product) => item.id !== product.id);
    }
    
    // Add the new product to the beginning of the array
    items.unshift(product);
    
    // Keep only the 10 most recent items
    const recentItems = items.slice(0, 10);
    
    // Save back to localStorage
    localStorage.setItem('recentlyViewed', JSON.stringify(recentItems));
  } catch (error) {
    console.error('Error updating recently viewed:', error);
  }
}

export function RecentlyWatched() {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load recently viewed products from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentlyViewed');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Ensure no duplicates and limit to 10 items
          const uniqueProducts = Array.from(
            new Map(parsed.map((item: Product) => [item.id, item])).values()
          ).slice(0, 10);
          setRecentlyViewed(uniqueProducts);
        }
      }
    } catch (error) {
      console.error('Error loading recently viewed products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddToCart = (productId: string) => {
    // This will be handled by the parent component
    console.log('Add to cart:', productId);
  };

  if (loading) {
    return <div className="py-4 text-center">Loading recently viewed items...</div>;
  }

  if (recentlyViewed.length === 0) {
    return null; // Don't render anything if no recently viewed items
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Recently Viewed</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {recentlyViewed.map((product) => (
          <div key={product.id} onClick={() => navigate(`/product/${product.id}`)}>
            <ProductCard
              id={product.id}
              name={product.name}
              category={product.category}
              description={product.description}
              price={product.price}
              salePrice={product.salePrice}
              imageUrl={product.imageUrl}
              onAddToCart={handleAddToCart}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentlyWatched;