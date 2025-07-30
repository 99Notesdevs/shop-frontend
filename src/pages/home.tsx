import React, { useState, useEffect } from 'react';
import { ProductCard } from '../components/product/product-card';
import { Button } from '../components/ui/button';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { toast } from 'react-toastify';
import Categories from '../components/product/categories';
import 'react-toastify/dist/ReactToastify.css';
import { api } from '../api/route';
import Hero from '../components/home/hero';
import ShowProduct from '../components/home/show-product';

const Home: React.FC = () => {

  const handleAddToCart = (productId: string) => {
    // Add to cart logic here
    console.log('Added to cart:', productId);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Hero />
        <ShowProduct onAddToCart={handleAddToCart} />
        </div>
      
    </ErrorBoundary>
  );
};

export default Home;
