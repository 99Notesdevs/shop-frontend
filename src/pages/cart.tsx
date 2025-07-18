import { ShoppingCart, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/route';

interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: number;
    name: string;
    description: string;
    price: number;
    images?: Array<{ url: string }>;
  };
}

interface CartData {
  id: number;
  userId: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  cartItems: CartItem[];
}

export default function CartPage() {
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localCartItems, setLocalCartItems] = useState<CartItem[]>([]);

  // Fetch cart data on component mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        // First, fetch the cart data using the API route
        const cartResponse = await api.get<{ success: boolean; data: CartData }>('/cart/user/1');
        
        if (cartResponse.success && cartResponse.data) {
          // Fetch product details for each cart item using the API route
          const itemsWithProducts = await Promise.all(
            cartResponse.data.cartItems.map(async (item: CartItem) => {
              try {
                const productResponse = await api.get<{ success: boolean; data: any }>(`/product/${item.productId}`);
                return {
                  ...item,
                  product: productResponse.success ? productResponse.data : null
                };
              } catch (error) {
                console.error(`Failed to fetch product ${item.productId}:`, error);
                return item; // Return item without product data if fetch fails
              }
            })
          );
          
          setCartData({
            ...cartResponse.data,
            cartItems: itemsWithProducts
          });
          
          // Initialize local cart items with products
          setLocalCartItems(itemsWithProducts);
        } else {
          throw new Error('Failed to load cart data');
        }
      } catch (err) {
        console.error('Failed to fetch cart:', err);
        setError('Failed to load cart. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, []);

  // Group cart items by product ID
  const groupedItems = localCartItems.reduce((groups, item) => {
    const existingItem = groups.find(g => g.productId === item.productId);
    if (existingItem) {
      existingItem.quantity += item.quantity;
      existingItem.ids = [...(existingItem.ids || []), item.id];
    } else {
      groups.push({
        ...item,
        ids: [item.id],
        quantity: item.quantity
      });
    }
    return groups;
  }, [] as (CartItem & { ids: number[] })[]);

  // Use grouped items for display
  const cartItems = groupedItems;

  // Calculate subtotal by summing up all items' prices
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + ((item.product?.price || 0) * item.quantity);
  }, 0);
  
  const shipping = subtotal > 0 ? 50 : 0; // Example shipping cost
  const total = subtotal + shipping;

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    try {
      // Find the item to update
      const itemToUpdate = localCartItems.find(item => item.id === itemId);
      if (!itemToUpdate) return;

      // Calculate the difference in quantity
      const quantityDiff = Math.max(1, newQuantity) - itemToUpdate.quantity;
      if (quantityDiff === 0) return;

      // Update local state optimistically for all matching product items
      const updatedItems = localCartItems.map(item => {
        if (item.productId === itemToUpdate.productId) {
          // For the first item, set the new quantity
          if (item.id === itemId) {
            return { ...item, quantity: Math.max(1, newQuantity) };
          }
          // For other items of the same product, adjust their quantities proportionally
          else if (quantityDiff > 0) {
            // When increasing, only update the first item to avoid multiple API calls
            return item;
          } else {
            // When decreasing, distribute the decrease across all items
            const newItemQuantity = Math.max(1, item.quantity + Math.floor(quantityDiff / localCartItems.filter(i => i.productId === itemToUpdate.productId).length));
            return { ...item, quantity: newItemQuantity };
          }
        }
        return item;
      });
      
      setLocalCartItems(updatedItems);
      
      // Call the API to update the quantity for the specific item
      const cartId = cartData?.id;
      if (!cartId) throw new Error('Cart not found');
      
      await api.put(`/cart/${cartId}/${itemId}`, { 
        quantity: Math.max(1, newQuantity) 
      });
      
      // Update cart data with the new quantities
      if (cartData) {
        setCartData({
          ...cartData,
          cartItems: cartData.cartItems.map(item => {
            const updatedItem = updatedItems.find(ui => ui.id === item.id);
            return updatedItem ? { ...item, quantity: updatedItem.quantity } : item;
          })
        });
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
      // Revert local state on error
      setLocalCartItems([...localCartItems]);
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    try {
      // Get the cart ID from cartData
      const cartId = cartData?.id;
      
      if (!cartId) {
        throw new Error('Cart not found');
      }

      // Show loading state
      setIsLoading(true);

      // Call the API to remove the item from the cart using the API route
      await api.delete(`/cart/${cartId}/${cartItemId}`);

      // Update local state to remove the deleted item
      setLocalCartItems(prevItems => 
        prevItems.filter(item => item.id !== cartItemId)
      );
      
      // Also update cartData if it exists
      if (cartData) {
        setCartData(prevData => ({
          ...prevData!,
          cartItems: prevData!.cartItems.filter(item => item.id !== cartItemId)
        }));
      }
      
    } catch (error) {
      console.error('Failed to remove item:', error);
      setError(error instanceof Error ? error.message : 'Failed to remove item from cart');
    } finally {
      setIsLoading(false);
    }
  };

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

  if (!cartData || cartItems.length === 0) {
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
                  <div key={item.id} className="border-b border-gray-200 py-6">
                    <div className="flex items-center">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        {item.product?.images?.[0]?.url ? (
                          <img
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            className="h-full w-full object-cover object-center"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                            <ShoppingCart className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3>{item.product?.name || 'Product'}</h3>
                          <p className="ml-4">${(item.product?.price || 0 * item.quantity).toFixed(2)}</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{item.product?.description || 'No description available'}</p>
                        <div className="mt-2 flex items-center">
                          <div className="flex items-center">
                            <button
                              onClick={() => handleUpdateQuantity(item.ids[0], item.quantity - 1)}
                              className="text-gray-500 hover:text-gray-700 px-2"
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="mx-2">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.ids[0], item.quantity + 1)}
                              className="text-gray-500 hover:text-gray-700 px-2"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => item.ids.forEach(id => handleRemoveItem(id))}
                            className="ml-4 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
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
