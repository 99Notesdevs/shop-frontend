import React, { useState, useEffect } from 'react';
import PriceRangeFilter from '../components/common/filter';
import StockStatusFilter from '../components/common/stockstatus';
import TopRatedProducts from '../components/common/topratedproducts';
import { ProductCard } from '../components/product/product-card';
import { Button } from '../components/ui/button';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { env } from '../config/env';
import { toast } from 'react-toastify';
import Categories from '../components/product/categories';
import 'react-toastify/dist/ReactToastify.css';

// Define the Category interface to match the one in categories.tsx
interface Category {
  id: number | string;
  name: string;
  description: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: {
    id: string;
    name: string;
  };
  categoryId: string;
  validity?: number;
  createdAt: string;
  updatedAt: string;
}

const Home: React.FC = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('default');
  const [selectedCategory, setSelectedCategory] = useState<number | string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${env.API}/category`);
        if (response.ok) {
          const data = await response.json();
          setCategories(Array.isArray(data) ? data : data.data || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    let isMounted = true;
    
    const fetchProducts = async () => {
      try {
        console.log('Fetching products from:', `${env.API}/product`);
        const response = await fetch(`${env.API}/product`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        // Handle different response formats
        let productsArray = [];
        if (Array.isArray(data)) {
          productsArray = data;
        } else if (data && Array.isArray(data.products)) {
          productsArray = data.products;
        } else if (data && data.data && Array.isArray(data.data)) {
          productsArray = data.data;
        } else {
          console.warn('Unexpected API response format:', data);
          throw new Error('Unexpected response format from the server');
        }
        
        if (isMounted) {
          setAllProducts(productsArray);
          setFilteredProducts(productsArray);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        if (isMounted) {
          setError(`Failed to load products: ${errorMessage}`);
          toast.error('Failed to load products');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProducts();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter products when category changes
  useEffect(() => {
    if (selectedCategory) {
      const filtered = allProducts.filter(
        product => product.categoryId?.toString() === selectedCategory.toString()
      );
      console.log('Filtered products:', filtered);
      setFilteredProducts(filtered);
    } else {
      console.log('Showing all products');
      setFilteredProducts(allProducts);
    }
  }, [selectedCategory, allProducts]);

  const handleAddToCart = (productId: string) => {
    // Add to cart logic here
    console.log('Added to cart:', productId);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSortBy(value);
    
    const sortedProducts = [...filteredProducts];
    if (value === 'price-low-high') {
      sortedProducts.sort((a, b) => a.price - b.price);
    } else if (value === 'price-high-low') {
      sortedProducts.sort((a, b) => b.price - a.price);
    } else {
      // Default sorting (by creation date)
      sortedProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    setFilteredProducts(sortedProducts);
  };

  const handleCategorySelect = (categoryId: number | string | null) => {
    setSelectedCategory(categoryId);
    // Reset to first page when changing category
    // You can implement pagination later if needed
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-1/4 space-y-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Filters</h2>
              <div className="space-y-6">
                <PriceRangeFilter />
                <StockStatusFilter />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium mb-3">Top Rated Products</h3>
              <TopRatedProducts />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {selectedCategory 
                  ? `${categories.find((c: Category) => c.id === selectedCategory)?.name || 'Category'} Products` 
                  : 'All Products'}
              </h2>
              <Categories 
                onCategorySelect={handleCategorySelect} 
                selectedCategory={selectedCategory}
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select 
                  value={sortBy}
                  onChange={handleSortChange}
                  className="border rounded-md px-3 py-1 text-sm"
                >
                  <option value="default">Default</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  {selectedCategory 
                    ? 'No products found in this category.' 
                    : 'No products available'}
                </p>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Show all products
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    category={product.category?.name || 'Uncategorized'}
                    description={product.description}
                    price={product.price}
                    imageUrl={product.imageUrl || 'https://via.placeholder.com/300x400?text=No+Image'}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <nav className="flex items-center gap-1">
                <Button variant="outline" className="px-3 py-1">Previous</Button>
                <Button variant="outline" className="px-3 py-1 bg-blue-600 text-white">1</Button>
                <Button variant="outline" className="px-3 py-1">2</Button>
                <Button variant="outline" className="px-3 py-1">3</Button>
                <Button variant="outline" className="px-3 py-1">Next</Button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Home;
