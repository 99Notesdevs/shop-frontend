import { Heart, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { env } from '../config/env';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${env.API}/wishlist/1`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch wishlist');
        }
        
        const data = await response.json();
        setWishlist(data.data?.items || []);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load wishlist');
        setWishlist([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const removeFromWishlist = async (productId: number) => {
    try {
      const response = await fetch(`${env.API}/wishlist/${productId}/1`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove from wishlist');
      }

      setWishlist(wishlist.filter(item => item.id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove from wishlist');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Wishlist</h1>
      
      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Save items you love for later</p>
          <Link
            to="/products"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <div key={product.id} className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
                <img
                  src={product.imageUrl || '/placeholder-product.jpg'}
                  alt={product.name}
                  className="w-full h-48 object-cover object-center"
                />
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200"
                  title="Remove from wishlist"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 h-12">
                  {product.name}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-lg font-semibold text-gray-900">
                    ${product.price.toFixed(2)}
                  </p>
                  <Link
                    to={`/products/${product.id}`}
                    className="text-sm font-medium text-primary hover:text-primary-dark"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
