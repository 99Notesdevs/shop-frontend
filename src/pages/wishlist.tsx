import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { env } from '../config/env';
import toast from 'react-hot-toast';
import { ProductCard } from '../components/product/product-card';
import { useAuth } from '../contexts/AuthContext';
import { Breadcrumb } from '../components/ui/breadcrumb';

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  stock: number;
  categoryId: number;
  validity: number;
  createdAt: string;
  updatedAt: string;
}

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  console.log(currentUser?.id);
  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${env.API}/wishlist/1`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch wishlist');
        }
        
        const data = await response.json();
        setProducts(data.data?.products || []);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load wishlist');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const removeFromWishlist = async (productId: number) => {
    if (!currentUser?.id) {
      toast.error('User not authenticated');
      return;
    }
    
    try {
      const response = await fetch(`${env.API}/wishlist/${productId}/1`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove from wishlist');
      }

      setProducts(prevProducts => prevProducts.filter(item => item.id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove from wishlist');
    }
  };

  const handleAddToCart = (productId: string) => {
    // Implement add to cart functionality
    console.log('Add to cart:', productId);
    toast.success('Added to cart');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb />
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl mb-8 text-center text-var(--text-heading)">Wishlist</h1>
        
        {products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" strokeWidth={1} />
            <h2 className="text-xl font-medium text-var(--text-primary) mb-2">Your wishlist is empty</h2>
            <p className="text-var(--text-secondary) mb-6">Save items you love for later</p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="relative group">
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors duration-200"
                  title="Remove from wishlist"
                >
                  <Heart className="h-5 w-5 text-red-500 fill-current" />
                </button>
                <ProductCard
                  id={product.id.toString()}
                  name={product.name}
                  category={`Category ${product.categoryId}`}
                  description={product.description}
                  price={product.price}
                  imageUrl={product.imageUrl || '/placeholder-product.jpg'}
                  onAddToCart={handleAddToCart}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
