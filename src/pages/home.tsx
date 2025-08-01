import React from 'react';
import ErrorBoundary from '../components/common/ErrorBoundary';
import Hero from '../components/home/hero';
import ShowProduct from '../components/home/show-product';
import ServiceIcon from '../components/common/service-icon';

const Home: React.FC = () => {

  const handleAddToCart = (productId: string) => {
    // Add to cart logic here
    console.log('Added to cart:', productId);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 pb-5">
        <Hero />
        <ShowProduct onAddToCart={handleAddToCart} />
        <ServiceIcon />
      </div>
      
    </ErrorBoundary>
  );
};

export default Home;
