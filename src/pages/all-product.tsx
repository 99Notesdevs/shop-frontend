import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProductCard } from '../components/product/product-card';
import { Button } from '../components/ui/button';
import { toast } from 'react-toastify';
import Filter from '../components/product/filter';
import { SlidersHorizontal } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';
import { api } from '../api/route';
import { Breadcrumb } from '../components/ui/breadcrumb';
import { useAuth } from '../contexts/AuthContext';
import { env } from '../config/env';

// Define the Category interface to match the one in categories.tsx
interface Category {
  id: number | string;
  _id?: string; // Add _id for MongoDB compatibility
  name: string;
  slug?: string; // Add slug property
  description: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
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

const AllProduct: React.FC = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { cart, updateCart } = useAuth();
  const navigate = useNavigate();
  const { categoryName } = useParams();
  const [skip, setSkip] = useState(0);
  const take = 20;

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get(`/category`) as { success: boolean; data: Category[] };
        if (response.success) {
          setCategories(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    // Set selected category from URL if it exists
    if (categoryName && categories.length > 0) {
      // First try to match by slug (with hyphens)
      const decodedCategoryName = decodeURIComponent(categoryName);
      const category = categories.find(cat => 
        cat.slug === decodedCategoryName || // Match by slug
        cat.name.toLowerCase().replace(/\s+/g, '-') === decodedCategoryName || // Match by name with hyphens
        cat.name.toLowerCase() === decodedCategoryName.replace(/-/g, ' ') // Match by name with spaces
      );
      if (category) {
        setSelectedCategory(category.id);
      } else {
        console.log('Category not found:', decodedCategoryName);
      }
    } else {
      setSelectedCategory(null);
    }
  }, [categoryName, categories]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get(`/product?skip=${skip}&take=${take}`) as { success: boolean; data: Product[] };
        if (response.success) {
          setAllProducts(response.data);

          // Filter products based on URL category if it exists
          if (categoryName && categories.length > 0) {
            const decodedCategoryName = decodeURIComponent(categoryName);
            const category = categories.find(cat => 
              cat.slug === decodedCategoryName ||
              cat.name.toLowerCase().replace(/\s+/g, '-') === decodedCategoryName ||
              cat.name.toLowerCase() === decodedCategoryName.replace(/-/g, ' ')
            );
            if (category) {
              console.log('Filtering products for category:', category.name);
              const filtered = response.data.filter(product => product.categoryId === category.id);
              setFilteredProducts(filtered);
            } else {
              setFilteredProducts(response.data);
            }
          } else {
            setFilteredProducts(response.data);
          }
        }
      } catch (err) {
        setError('Failed to fetch products');
        console.error('Error fetching products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [categoryName, categories, skip, take]);

  const handleNextPage = () => setSkip(skip + take);
  const handlePrevPage = () => setSkip(Math.max(0, skip - take));

  // Function to get category name by ID
  const getCategoryName = (categoryId: string | number) => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(cat => String(cat.id) === String(categoryId));
    return category?.name || `Category ${categoryId}`;
  };

  // Handle filter changes from the filter component
  const handleFilterChange = (filters: { category: string | null; priceRange: [number, number] }) => {
    setSelectedCategory(filters.category);
    setPriceRange(filters.priceRange);
  };

  // Filter and sort products when category, price range, or sort changes
  const filterAndSortProducts = useCallback(() => {
    let result = [...allProducts];

    // Filter by category
    if (selectedCategory) {
      result = result.filter(
        product => product.categoryId?.toString() === selectedCategory.toString()
      );
    }

    // Filter by price range
    result = result.filter(
      product => product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    setFilteredProducts(result);
  }, [allProducts, selectedCategory, priceRange]);

  useEffect(() => {
    filterAndSortProducts();
  }, [filterAndSortProducts]);

  const { openCart } = useAuth();

  const handleAddToCart = async (productId: string) => {
    if (!productId) return;

    if (!cart?.id) {
      toast.error('Please login to add items to cart');
      navigate('/users/login');
      return;
    }

    try {
      const response = await fetch(`${env.API}/cart/${cart.id}?productId=${productId}&quantity=1`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        toast.error('Your session has expired. Please login again');
        navigate('/users/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add item to cart');
      }

      const data = await response.json();

      // Update the cart in the auth context
      if (data.data) {
        updateCart(data.data);
      }
      if (data.success) {
        toast.success('Item added to cart successfully!');
        // Open the cart sidebar when an item is added
        openCart();
      } else {
        throw new Error(data.message || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add item to cart');
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <Breadcrumb />
        <div className="gap-4 mb-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedCategory
                ? `${categories.find((c: Category) => c.id === selectedCategory)?.name || 'Category'} Products`
                : ""}
            </h1>
          </div>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4 justify-end" >
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                aria-label="Filter products"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
              </button>
              </div>
            </div>
          </div>

          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to all products
            </button>
          )}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedCategory
                ? 'Try selecting a different category.'
                : 'Check back later for new arrivals.'}
            </p>
            {selectedCategory && (
              <div className="mt-6">
                <Button
                  onClick={() => setSelectedCategory(null)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View all products
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                category={getCategoryName(product.categoryId)}
                description={product.description}
                price={product.price}
                salePrice={product.salePrice || product.price}
                imageUrl={product.imageUrl || 'https://via.placeholder.com/300x400?text=No+Image'}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredProducts.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Showing {filteredProducts.length} {selectedCategory ? 'filtered ' : ''}products
            </p>
            <Button onClick={handlePrevPage} disabled={skip === 0}>
            Previous
          </Button>
          <Button onClick={handleNextPage} disabled={filteredProducts.length < take}>
            Next
          </Button>
          </div>
        )}
        
        {/* Filter Sidebar */}
        <Filter 
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          onFilterChange={handleFilterChange}
        />
      </div>
    );
  };

  export default AllProduct;