import React, { useState, useEffect, useContext } from 'react';
import ErrorBoundary from '../components/common/ErrorBoundary';
import Hero from '../components/home/hero';
import ShowProduct from '../components/home/show-product';
import ServiceIcon from '../components/common/service-icon';
import { CartSidebar } from '../components/ui/cart-sidebar';
import { useAuth } from '../contexts/AuthContext';
import { env } from '../config/env';

const Home: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const handleShowCart = () => {
      setIsCartOpen(true);
    };

    // Add event listener for showing the cart
    window.addEventListener('showCartSidebar', handleShowCart);

    // Clean up the event listener
    return () => {
      window.removeEventListener('showCartSidebar', handleShowCart);
    };
  }, []);

  const { cart, updateCart } = useAuth();

  const handleAddToCart = async (productId: string) => {
    try {
      if (!cart?.id) {
        console.error('No cart found. Please log in.');
        return;
      }

      // Check if the product is already in the cart
      const existingItem = cart.cartItems?.find(item => item.productId.toString() === productId);
      const quantity = existingItem ? existingItem.quantity + 1 : 1;

      // Add item to cart
      const response = await fetch(`${env.API}/cart/${cart.id}?productId=${productId}&quantity=${quantity}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add item to cart');
      }

      const data = await response.json();
      
      // Update the cart in the auth context
      if (data.data) {
        updateCart(data.data);
      }
      
      console.log('Added to cart:', productId);
      return data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Hero />
        <ShowProduct onAddToCart={handleAddToCart} />
        <ServiceIcon />
        <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
      
    </ErrorBoundary>
  );
};

export default Home;
