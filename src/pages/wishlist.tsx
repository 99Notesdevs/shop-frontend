import { Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { ProductCard } from '../components/product/product-card';
import { useAuth } from '../contexts/AuthContext';
import { Breadcrumb } from '../components/ui/breadcrumb';
import { api } from '../api/route';
import { env } from '../config/env';

interface Product {
  id: number;
  name: string;
  price: number;
  salePrice?: number;
  imageUrl: string;
  description: string;
  stock: number;
  categoryId: number;
  category: string;
  validity: number;
  createdAt: string;
  updatedAt: string;
}

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser, cart, updateCart, openCart } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!currentUser?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const response = await api.get(`/wishlist/${currentUser.id}`) as { success: boolean; data: { products: Product[] } };
        if (response.success) {
          setProducts(response.data.products || []);
        } else {
          throw new Error('Failed to fetch wishlist');
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        toast.error('Failed to load wishlist. Please try again.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [currentUser?.id]);

  const handleAddToCart = async (productId: string) => {
    if (!productId) return;

    if (!cart?.id) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${env.API}/cart/${cart.id}?productId=${productId}&quantity=1`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        toast.error('Your session has expired. Please login again');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add item to cart');
      }

      const data = await response.json();

      // Update the cart in the auth context
      if (data.data) {
        updateCart(data.data);
      }
      if (data.success) {
        toast.success('Item added to cart successfully!');
        // Open the cart sidebar when an item is added
        openCart();
      } else {
        throw new Error(data.message || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add item to cart');
    }
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4">Please sign in</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to view your wishlist.</p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

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
                <ProductCard
                  id={product.id}
                  name={product.name}
                  category={product.category}
                  description={product.description}
                  price={product.price}
                  salePrice={product.salePrice || product.price}
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
