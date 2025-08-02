import { ShoppingCart, Trash2, ChevronLeft, Plus, Minus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/route';
import { useAuth } from '../contexts/AuthContext';

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
  const [error, setError] = useState<string | null>(null);
  const [localCartItems, setLocalCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const { user, isLoading: isAuthLoading } = useAuth();

  // Handle authentication state and fetch cart data
  useEffect(() => {
    // If auth is still loading, wait
    if (isAuthLoading) return;
    
    // Mark that we've checked auth state
    setAuthChecked(true);
    
    const fetchCart = async () => {
      setIsLoading(true);
      setError(null);
      
      if (!user?.id) {
        setIsLoading(false);
        setError('Please log in to view your cart');
        return;
      }
      
      try {
        const cartResponse = await api.get<{ success: boolean; data: CartData }>(`/cart/user/${user.id}`);
        
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
          setError('Failed to fetch cart data');
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
        setError('Failed to load cart. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [user, isAuthLoading]);

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

  // Show loading state if auth is still being checked or data is loading
  if (!authChecked || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          {!user?.id && (
            <Link 
              to="/login" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go to Login
            </Link>
          )}
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/products" className="flex items-center text-gray-600 hover:text-gray-900">
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span>Back to shop</span>
          </Link>
          <h1 className="text-3xl text-var(--text-heading) text-center">Shopping Cart</h1>
        </div>
        
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              {/* Cart Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 mb-6 text-sm font-medium text-gray-500">
                <div className="col-span-5">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-2 text-right">Subtotal</div>
              </div>
              
              {/* Cart Items */}
              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-6">
                    <div className="flex flex-col md:flex-row md:items-center">
                      {/* Product Info */}
                      <div className="flex items-center md:w-5/12 mb-4 md:mb-0">
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                          {item.product?.images?.[0]?.url ? (
                            <img
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              className="h-full w-full object-cover object-center"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <ShoppingCart className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-base font-medium text-gray-900">{item.product?.name || 'Product'}</h3>
                        </div>
                      </div>
                      
                      {/* Price */}
                      <div className="md:w-2/12 mb-4 md:mb-0 text-center">
                        <span className="text-base font-medium text-gray-900">
                          ₹{(item.product?.price || 0).toFixed(2)}
                        </span>
                      </div>
                      
                      {/* Quantity */}
                      <div className="md:w-3/12 mb-4 md:mb-0">
                        <div className="flex items-center justify-center md:justify-start">
                          <button
                            onClick={() => handleUpdateQuantity(item.ids[0], item.quantity - 1)}
                            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="mx-4 w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.ids[0], item.quantity + 1)}
                            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Subtotal & Remove */}
                      <div className="md:w-2/12 flex items-center justify-between md:justify-end">
                        <span className="text-base font-medium text-gray-900">
                          ₹{((item.product?.price || 0) * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => item.ids.forEach(id => handleRemoveItem(id))}
                          className="ml-4 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Cart Actions */}
              <div className="mt-8 flex flex-col sm:flex-row justify-between items-center border-t border-gray-100 pt-6">
                <div className="w-full sm:w-auto mb-4 sm:mb-0">
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button className="ml-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Apply Coupon
                  </button>
                </div>
                <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  Update Cart
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-red-500">-₹0.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{shipping > 0 ? `₹${shipping.toFixed(2)}` : 'Free'}</span>
                </div>
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-blue-600">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-xl text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Proceed to Checkout
                </button>
              </div>

              <div className="mt-6 text-center text-sm text-gray-500">
                <p>or <Link to="/products" className="font-medium text-blue-600 hover:text-blue-500">Continue Shopping</Link></p>
              </div>
              
              {/* Payment Methods */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-900 mb-4">We Accept</h3>
                <div className="flex space-x-4">
                  <div className="h-8 w-12 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs font-medium">VISA</span>
                  </div>
                  <div className="h-8 w-12 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs font-medium">MC</span>
                  </div>
                  <div className="h-8 w-12 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs font-medium">PP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
