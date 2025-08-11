import { X, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from './button';
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { api } from '../../api/route';

interface CartItemProduct {
  id: number;
  name: string;
  price: number;
  salePrice?: number;
  imageUrl: string;
}

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product?: CartItemProduct;
}

export function CartSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { fetchCartData } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchCartItems = useCallback(async () => {
    if (!isOpen) return;
    
    setIsLoading(true);
    try {
      const cartData = await fetchCartData();
      if (cartData?.cartItems?.length) {
        // Only fetch products if we have items and they don't have product data
        const itemsWithProducts = await Promise.all(
          cartData.cartItems.map(async (item: any) => {
            // Skip if we already have the product data
            if (item.product) return item;
            
            try {
              const response = await api.get(`/product/${item.productId}`) as { success: boolean; data: CartItemProduct };
              if (response.success) {
                return { ...item, product: response.data };
              }
              return item;
            } catch (error) {
              console.error('Error fetching product:', error);
              return item;
            }
          })
        );
        setItems(itemsWithProducts);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, fetchCartData]);

  // Use a ref to track if we've already fetched the cart data
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Only fetch if the sidebar is open and we haven't fetched yet
    if (isOpen && !hasFetchedRef.current) {
      fetchCartItems();
      hasFetchedRef.current = true;
    } else if (!isOpen) {
      // Reset the ref when the sidebar is closed
      hasFetchedRef.current = false;
    }
  }, [isOpen, fetchCartItems]);

  const calculateTotal = () => {
    return items.reduce((total: number, item: CartItem) => {
      return total + (item.product?.salePrice || item.product?.price || 0) * item.quantity;
    }, 0);
  };

  if (!isOpen) return null;

  // Animation variants with proper typing
  const sidebarVariants: Variants = {
    hidden: { x: '100%' },
    visible: { 
      x: 0,
      transition: { 
        type: 'tween' as const, 
        ease: 'easeOut', 
        duration: 0.3 
      }
    },
    exit: { 
      x: '100%',
      transition: { 
        type: 'tween' as const, 
        ease: 'easeIn', 
        duration: 0.2 
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3
      }
    }),
    exit: { 
      opacity: 0, 
      y: -20, 
      transition: { 
        duration: 0.2 
      } 
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-black/50" 
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          <motion.div 
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl flex flex-col"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
                <button 
                  onClick={onClose} 
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                  aria-label="Close cart"
                >
                  <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                </button>
              </div>
            </div>
            
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : items && items.length > 0 ? (
                <motion.div className="space-y-4">
                  {items.map((item, index) => (
                    <motion.div 
                      key={item.id} 
                      className="relative group bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
                      custom={index}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                    >
                      <div className="flex gap-4">
                        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          <img
                            src={item.product?.imageUrl || '/placeholder.jpg'}
                            alt={item.product?.name || 'Product image'}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {item.product?.name || 'Product'}
                          </h3>
                          <p className="mt-1 text-sm text-gray-600">₹{item.product?.salePrice?.toFixed(2) || item.product?.price?.toFixed(2) || '0.00'}</p>
                          
                          <div className="mt-2 flex items-center space-x-2">
                            <button 
                              className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button 
                              className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <button 
                        className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  className="h-full flex flex-col items-center justify-center text-center p-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ShoppingCart className="mx-auto h-16 w-16 text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h3>
                  <p className="mt-1 text-gray-500">Start adding some items to your cart</p>
                  <Button 
                    onClick={() => {
                      onClose();
                      navigate('/products');
                    }}
                    className="mt-6"
                    variant="outline"
                  >
                    Continue Shopping
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            {items && items.length > 0 && (
              <div className="border-t border-gray-100 p-6 bg-gray-50">
                <div className="flex justify-between text-lg font-semibold text-gray-900 mb-6">
                  <span>Subtotal</span>
                  <span>₹{calculateTotal().toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  Shipping and taxes calculated at checkout.
                </p>
                <Button 
                  onClick={() => {
                    onClose();
                    navigate('/cart');
                  }}
                  className="w-full py-3 text-base font-medium bg-[var(--button)] hover:bg-[var(--button-hover)] text-white cursor-pointer"
                >
              Go to Cart
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
