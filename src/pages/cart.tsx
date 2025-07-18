import { ShoppingCart, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { env } from '../config/env';
import Cookies from 'js-cookie';
interface CartItem {
  id: number;
  productId: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image?: string;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const data = await fetch(`${env.API}/cart/user/1`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get('token')}`,
          },
        });
        const response = await data.json();
        console.log(response);
        // Map the API response to match our CartItem interface
        const items = response.data?.items?.map((item: any) => ({
          id: item.id,
          productId: item.productId,
          name: item.product?.name || 'Product',
          description: item.product?.description || '',
          price: item.product?.price || 0,
          quantity: item.quantity,
          image: item.product?.images?.[0]?.url
        })) || [];
        setCartItems(items);
      } catch (err) {
        console.error('Failed to fetch cart:', err);
        setError('Failed to load cart. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, []);

  // Calculate total amount
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 0 ? 50 : 0; // Example shipping cost
  const total = subtotal + shipping;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <ShoppingCart className="mx-auto h-16 w-16 text-gray-400" />
            <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Your cart is empty</h2>
            <p className="mt-2 text-gray-500">Looks like you haven't added any products yet.</p>
            <div className="mt-6">
              <Link
                to="/products"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    try {
      // TODO: Call update cart item API
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, quantity: Math.max(1, newQuantity) } : item
        )
      );
    } catch (error) {
      console.error('Failed to update quantity:', error);
      // Optionally show error to user
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      // TODO: Call remove item API
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Failed to remove item:', error);
      // Optionally show error to user
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Shopping Cart</h1>
        
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <ul className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <li key={item.id} className="p-6 flex flex-col sm:flex-row">
                    <div className="flex-shrink-0">
                      <img
                        src={item.image || 'https://via.placeholder.com/150'}
                        alt={item.name}
                        className="w-24 h-24 rounded-md object-cover object-center sm:w-32 sm:h-32"
                      />
                    </div>

                    <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          {item.name}
                        </h3>
                        <p className="ml-4 text-lg font-medium text-gray-900">
                          ₹{item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <button 
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-gray-400 hover:text-gray-500"
                          >
                            <span className="sr-only">Decrease quantity</span>
                            <span className="text-2xl">-</span>
                          </button>
                          <span className="mx-2 w-8 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-gray-400 hover:text-gray-500"
                          >
                            <span className="sr-only">Increase quantity</span>
                            <span className="text-2xl">+</span>
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-800 flex items-center text-sm"
                        >
                          <Trash2 className="h-5 w-5 mr-1" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-10 lg:mt-0 lg:col-span-4">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{shipping > 0 ? `₹${shipping.toFixed(2)}` : 'Free'}</span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-900">Total</span>
                  <span className="text-lg font-bold text-gray-900">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Proceed to Checkout
                </button>
              </div>

              <div className="mt-4 text-center text-sm text-gray-500">
                <p>or <Link to="/products" className="font-medium text-indigo-600 hover:text-indigo-500">Continue Shopping</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
