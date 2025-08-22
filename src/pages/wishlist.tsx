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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-gray-100 transform transition-all hover:shadow-xl">
          <div className="bg-[var(--primary)] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-10 w-10 text-[var(--primary)]" fill="currentColor" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Your Wishlist Awaits</h2>
          <p className="text-gray-600 mb-6">Sign in to view and manage your saved items</p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-white bg-[var(--button)] hover:bg-[var(--button-hover)] font-medium shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 w-full sm:w-auto"
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-[var(--primary)] mb-4"></div>
          <p className="text-gray-500">Loading your wishlist...</p>
        </div>
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
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Your Wishlist</h1>
        <p className="text-center text-gray-500 mb-8">All your favorite items in one place</p>
        
        {products.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:px-6 lg:px-8 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-[var(--primary)] mb-6">
              <Heart className="h-12 w-12 text-gray-900" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">Save items you love by clicking the heart icon on any product</p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 rounded-lg text-white bg-[var(--button)] hover:bg-[var(--button-hover)] font-medium shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--button)] focus:ring-offset-2"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
              >
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
