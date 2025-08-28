import { ShoppingCart, Trash2, ChevronLeft, Plus, Minus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/route';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import RecentlyWatched from '../components/product/recntly-watched';
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
    salePrice?: number;
    shippingCharge?: number;
    images: string;
  };
}

interface CartData {
  id: number;
  userId: number;
  totalAmount: number;
  shippingCharge?: number;
  couponDiscount?: number;
  couponCode?: string;
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

  const navigate = useNavigate();
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
          // Fetch product details for each cart item
          const itemsWithProducts = await Promise.all(
            cartResponse.data.cartItems.map(async (item: CartItem) => {
              try {
                const productResponse = await api.get<{ success: boolean; data: any }>(`/product/${item.productId}`);
                const product = productResponse.success ? productResponse.data : null;
                
                return {
                  ...item,
                  product,
                  // Calculate item total
                  itemTotal: product ? (product.price * item.quantity) : 0
                };
              } catch (error) {
                console.error(`Failed to fetch product ${item.productId}:`, error);
                return {
                  ...item,
                  itemTotal: 0,
                  product: null
                };
              }
            })
          );
    
          // Calculate cart total
          const cartTotal = itemsWithProducts.reduce((total, item) => total + (item.itemTotal || 0), 0);
    
          const updatedCartData = {
            ...cartResponse.data,
            cartItems: itemsWithProducts,
            totalAmount: cartTotal
          };
    
          setCartData(updatedCartData);
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
  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!cartData) {
      toast.error('Product info unavailable. Please refresh.');
      return;
    }
  
    try {
      console.log("cartData ",cartData);
      
      // Include shipping charge in the cartData passed to checkout
      const cartDataWithShipping = {
        ...cartData,
        shippingCharge: shipping // Add the calculated shipping charge
      };
      
      console.log("navigating to checkout");
      navigate('/checkout', { state: { cartData: cartDataWithShipping } });
    } catch (err) {
      console.error(err);
      toast.error('Failed to create order. Please try again.');
    }
  };
  // Handle quantity update for cart item
  const handleUpdateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return; // Prevent quantity from going below 1
    
    try {
      // Update the local state optimistically
      setLocalCartItems(prevItems => 
        prevItems.map(item => 
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
      
      // Make API call to update quantity
      await api.put(`/cart/${cartItemId}?quantity=${newQuantity}`);
      
      // Refresh cart data to ensure consistency
      const cartResponse = await api.get<{ success: boolean; data: CartData }>(`/cart/user/${user?.id}`);
      if (cartResponse.success && cartResponse.data) {
        setCartData(cartResponse.data);
      }
      
    } catch (error) {
      console.error('Error updating quantity:', error);
      // Revert local state on error
      setLocalCartItems(cartData?.cartItems || []);
      // Show error message to user
      setError('Failed to update quantity. Please try again.');
    }
  };

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

  // Calculate subtotal by summing up all items' prices (using sale price if available)
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.salePrice || item.product?.price || 0;
    return sum + (price * item.quantity);
  }, 0);
  

  // Calculate maximum shipping charge from all products in cart
  const maxShippingCharge = cartItems.length > 0 
    ? Math.max(...cartItems.map(item => item.product?.shippingCharge ?? 0).filter(charge => charge > 0))
    : 0;
  
  // Apply free shipping if subtotal is 500 or more, otherwise use max shipping charge
  const shipping = subtotal >= 500 ? 0 : (maxShippingCharge > 0 ? maxShippingCharge : 50); // Default to 50 if no shipping charge specified
  
  // Calculate amount needed for free shipping
  const amountNeededForFreeShipping = Math.max(0, 500 - subtotal);
  
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);

  useEffect(() => {
    const savedCoupon = localStorage.getItem('appliedCoupon');
    if (savedCoupon) {
      const { code, discount } = JSON.parse(savedCoupon);
      setCouponCode(code);
      setCouponDiscount(discount);
    }
  }, []);

  const applyCoupon = async (code = couponCode, currentSubtotal = subtotal) => {
    if (!code.trim()) {
      return false;
    }

    try {
      // Include shipping in the total amount for coupon validation
      const totalWithShipping = currentSubtotal + shipping;
      const response = await api.post(`/coupon/use/${code}`, { totalAmount: totalWithShipping }) as { success: boolean; data: any };
      
      if (response.success) {
        const { discount, type: discountType } = response.data;
        let discountAmount = 0;
        
        // Apply discount to the total (subtotal + shipping)
        if (discountType === 'percentage') {
          discountAmount = (totalWithShipping * discount) / 100;
        } else {
          discountAmount = Math.min(discount, totalWithShipping); // Ensure discount doesn't exceed total
        }
        
        setCouponDiscount(discountAmount);
        setCouponCode(code);
        localStorage.setItem('appliedCoupon', JSON.stringify({
          code,
          discount: discountAmount
        }));
        toast.success('Coupon applied successfully!');
        return true;
      } else {
        setCouponDiscount(0);
        toast.error('Failed to apply coupon');
        return false;
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponDiscount(0);
      toast.error('Failed to apply coupon. Please try again.');
      return false;
    }
  };

  // Re-apply coupon when cart items change
  useEffect(() => {
    const savedCoupon = localStorage.getItem('appliedCoupon');
    if (savedCoupon && cartItems.length > 0) {
      const { code } = JSON.parse(savedCoupon);
      applyCoupon(code, subtotal);
    }
  }, [subtotal, cartItems.length]);

  const removeCoupon = async () => {
    try {
      if (couponCode) {
        await api.post(`/coupon/remove/${couponCode}`, { credentials: 'include' });
      }
      setCouponCode('');
      setCouponDiscount(0);
      localStorage.removeItem('appliedCoupon');
      toast.success('Coupon removed successfully');
    } catch (error) {
      console.error('Error removing coupon:', error);
      toast.error('Failed to remove coupon');
    }
  };

  // Calculate total after applying coupon to both subtotal and shipping
  const total = Math.max(0, (subtotal + shipping) - couponDiscount);

  // Handle remove item from cart
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
        </div>
        
        <div className="lg:flex gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Cart Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 mb-6 text-sm font-medium text-gray-500 border-b pb-4">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              
              {/* Cart Items */}
              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-6">
                    <div className="flex flex-col md:flex-row md:items-center">
                      {/* Product Info */}
                      <div className="flex items-center md:w-6/12 mb-4 md:mb-0">
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50">
                          {item.product?.images ? (
                            <img
                              src={item.product.images}
                              alt={item.product.name}
                              className="h-full w-full object-cover object-center"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-100">
                              <ShoppingCart className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <Link to={`/product/${item.productId}`} className="group">
                            <h3 className="text-base font-medium text-gray-900 group-hover:text-var(--button) transition-colors">
                              {item.product?.name || 'Product'}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      
                      {/* Price */}
                      <div className="md:w-2/12 mb-4 md:mb-0 text-center">
                        {item.product?.salePrice ? (
                          <div className="flex flex-col">
                            <span className="text-base font-medium text-gray-900">
                              ₹{item.product.salePrice.toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              ₹{item.product.price.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-base font-medium text-gray-900">
                            ₹{(item.product?.price || 0).toFixed(2)}
                          </span>
                        )}
                      </div>
                      
                      {/* Quantity */}
                      <div className="md:w-2/12 mb-4 md:mb-0">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="text-gray-500 hover:bg-gray-100 p-1 rounded-full w-8 h-8 flex items-center justify-center"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="mx-3 w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="text-gray-500 hover:bg-gray-100 p-1 rounded-full w-8 h-8 flex items-center justify-center"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Total & Remove */}
                      <div className="md:w-2/12 flex items-center justify-between md:justify-end">
                        <div className="flex flex-col items-end">
                          {item.product?.salePrice ? (
                            <>
                              <span className="text-base font-medium text-gray-900">
                                ₹{(item.product.salePrice * item.quantity).toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                ₹{(item.product.price * item.quantity).toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="text-base font-medium text-gray-900">
                              ₹{((item.product?.price || 0) * item.quantity).toFixed(2)}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => item.ids.forEach(id => handleRemoveItem(id))}
                          className="ml-4 text-gray-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Continue Shopping */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                <Link 
                  to="/products" 
                  className="flex items-center text-gray-600 hover:text-gray-900 font-medium"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  <span>Continue Shopping</span>
                </Link>
                
                <div className="flex space-x-4">
                  <button 
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                    onClick={() => window.location.reload()}
                  >
                    Update Cart
                  </button>
                </div>
              </div>
            </div>
            
            {/* Coupon Code */}
            <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Have a coupon code?
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={couponDiscount > 0}
                  />
                  {couponCode && !couponDiscount && (
                    <button 
                      onClick={() => setCouponCode('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {couponDiscount > 0 ? (
                  <button 
                    onClick={removeCoupon}
                    className="px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove Coupon
                  </button>
                ) : (
                  <button 
                  onClick={() => applyCoupon()}
                    className="px-6 py-3 bg-[var(--button)] text-white font-medium rounded-lg hover:bg-[var(--button-hover)] transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Apply Coupon
                  </button>
                )}
              </div>
              {couponDiscount > 0 && (
                <p className="mt-3 text-sm text-green-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Coupon applied! ₹{couponDiscount} discount has been applied to your order.
                </p>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3 mt-8 lg:mt-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{(subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <div className="text-right">
                    <div className="font-medium">
                      {(shipping || 0) > 0 ? `₹${(shipping || 0).toFixed(2)}` : 'Free'}
                    </div>
                    {(shipping || 0) > 0 && (
                      <div className="text-xs text-green-600 mt-1">
                        Add ₹{(amountNeededForFreeShipping || 0).toFixed(2)} more for free shipping
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-red-500">-₹{(couponDiscount || 0).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-xl font-bold" style={{ color: '#FBAB3B' }}>₹{(total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors cursor-pointer"
                  style={{
                    backgroundColor: '#FBAB3B',
                    '--button-hover': '#DC7E00',
                    '&:hover': {
                      backgroundColor: 'var(--button-hover)'
                    }
                  } as React.CSSProperties}
                  onClick={handleBuyNow}
                >
                  Proceed to Checkout
                </button>
              </div>

              <div className="mt-6 text-center text-sm text-gray-500">
                <p>or <Link to="/products" className="font-medium" style={{ color: '#FBAB3B' }}>Continue Shopping</Link></p>
              </div>
              
              {/* Payment Methods */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-900 mb-4">We Accept</h3>
                <div className="grid grid-cols-4 gap-3">
                  {['visa', 'mastercard', 'UPI'].map((method) => (
                    <div key={method} className="h-12 bg-gray-50 rounded-lg flex items-center justify-center p-2">
                      <span className="text-xs font-medium text-gray-500">{method.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <RecentlyWatched />
      </div>
    </div>
  );
}
