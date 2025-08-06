import { X, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from './button';
import { useCallback, useEffect, useRef, useState } from 'react';
import { env } from '../../config/env';

interface CartItemProduct {
  id: number;
  name: string;
  price: number;
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
              const response = await fetch(`${env.API}/product/${item.productId}`);
              if (response.ok) {
                const productData = await response.json();
                return { ...item, product: productData.data };
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
      return total + (item.product?.price || 0) * item.quantity;
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-lg">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
          <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Shopping Cart</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
          <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : items && items.length > 0 ? (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-2 border-b">
                            <img
                      src={item.product?.imageUrl || '/placeholder.jpg'}
                      alt={item.product?.name || 'Product image'}
                      className="w-20 h-20 object-cover rounded"
                            />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product?.name || 'Product'}</h3>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="font-medium">${(item.product?.price || 0) * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
          ) : (
              <div className="text-center py-12">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-600">Your cart is empty</p>
              </div>
          )}
        </div>

          <div className="p-4 border-t">
            <div className="flex justify-between text-lg font-semibold mb-4">
              <span>Subtotal:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
            <Button 
              onClick={() => {
                onClose();
                navigate('/cart');
              }}
              className="w-full"
            >
              Go to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
