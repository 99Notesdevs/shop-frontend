import { ProductCard } from '../product/product-card';
import React, { useEffect, useState } from 'react';
import { api } from '../../api/route';

interface Category {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

interface Product {
  _id: string;
  id: number;
  name: string;
  description: string;
  price: number;
  salePrice: number;
  imageUrl: string;
  category: string;
  categoryId?: number; // Added to match backend model
  stock: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoryWithProducts extends Category {
  products: Product[];
}

interface ShowProductProps {
  onAddToCart: (id: string) => void;
}

export const ShowProduct: React.FC<ShowProductProps> = ({ onAddToCart }) => {
  const [categories, setCategories] = useState<CategoryWithProducts[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all categories and products in parallel
        const [categoriesResponse, productsResponse] = await Promise.all([
          api.get<{ success: boolean; data: Category[] }>('/category'),
          api.get<{ success: boolean; data: Product[] }>('/product')
        ]);
        
        console.log('Categories response:', categoriesResponse);
        console.log('Products response:', productsResponse);
        
        // Extract data from responses
        const categoriesData = Array.isArray(categoriesResponse) 
          ? categoriesResponse 
          : (categoriesResponse?.data || []);
          
        const allProducts = Array.isArray(productsResponse)
          ? productsResponse
          : (productsResponse?.data || []);
          
        console.log('Extracted categories:', categoriesData);
        console.log('Extracted products:', allProducts);
        
        console.log('All products before filtering:', JSON.stringify(allProducts, null, 2));
        
        // Log the structure of the first product (if exists) for debugging
        if (allProducts.length > 0) {
          console.log('First product structure:', Object.keys(allProducts[0]));
          console.log('First product category info:', {
            categoryId: allProducts[0].categoryId,
            category: allProducts[0].category,
            hasCategory: 'category' in allProducts[0],
            hasCategoryId: 'categoryId' in allProducts[0]
          });
        }
        
        // Group products by category
        const categoriesWithProducts = categoriesData.map(category => {
          // Get the category ID (using either _id or id based on what's available)
          const categoryId = category._id || category.id;
          
          // Find products that belong to this category
          const categoryProducts = allProducts.filter(product => {
            // Check both categoryId and category (as string or number)
            const productCategoryId = product.categoryId || product.category;
            return productCategoryId?.toString() === categoryId.toString();
          });
          
          console.log(`Category ${categoryId} (${category.name}) has ${categoryProducts.length} products`);
          
          return {
            ...category,
            products: categoryProducts
          };
        });
        
        setCategories(categoriesWithProducts);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderCategorySection = (category: CategoryWithProducts) => {
    console.log(`Rendering category: ${category.name} with ${category.products?.length || 0} products`);
    if (!category.products || category.products.length === 0) {
      console.log(`Skipping empty category: ${category.name}`);
      return null;
    }
    
    return (
      <div key={category._id} className="mb-2">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h2>
          {category.description && (
            <p className="text-gray-600 mb-4">{category.description}</p>
          )}
          <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
        </div>
        
        <div className="relative">
          <div className="flex overflow-x-auto pb-6 mx-4 px-4">
            <div className="flex space-x-8">
              {category.products.map((product) => (
                <div key={product.id} className="flex-shrink-0 w-80">
                  <ProductCard 
                    id={product.id}
                    name={product.name}
                    category={category.name}
                    description={product.description}
                    price={product.price}
                    salePrice={product.salePrice}
                    imageUrl={product.imageUrl || 'https://via.placeholder.com/300'}
                    onAddToCart={onAddToCart}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-gray-50 pointer-events-none"></div>
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-l from-transparent to-gray-50 pointer-events-none"></div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">No categories found.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {categories.map((category) => renderCategorySection(category))}
      </div>
    </section>
  );
};

export default ShowProduct;