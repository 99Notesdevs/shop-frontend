import React, { useState } from 'react';
import PriceRangeFilter from '../components/common/filter';
import StockStatusFilter from '../components/common/stockstatus';
import TopRatedProducts from '../components/common/topratedproducts';
import { ProductCard } from '../components/product/product-card';
import { Button } from '../components/ui/button';

// Mock data for products
const mockProducts = [
  {
    id: '1',
    name: 'UPSC Prelims 2025 Test Series',
    category: 'Test Series',
    description: 'Comprehensive test series for UPSC Prelims 2025 with detailed solutions and performance analysis.',
    price: 2999,
    imageUrl: 'https://via.placeholder.com/300x400?text=Test+Series',
  },
  {
    id: '2',
    name: 'Modern Indian History Notes',
    category: 'Study Material',
    description: 'Detailed notes covering Modern Indian History for UPSC preparation.',
    price: 499,
    imageUrl: 'https://via.placeholder.com/300x400?text=History+Notes',
  },
  {
    id: '3',
    name: 'Indian Polity Book',
    category: 'Books',
    description: 'Complete guide to Indian Polity for UPSC and other competitive exams.',
    price: 599,
    imageUrl: 'https://via.placeholder.com/300x400?text=Polity+Book',
  },
  {
    id: '4',
    name: 'Geography Mapping Program',
    category: 'Online Course',
    description: 'Learn map-based questions and answers for UPSC Geography.',
    price: 1299,
    imageUrl: 'https://via.placeholder.com/300x400?text=Geography+Course',
  },
  {
    id: '5',
    name: 'CSAT Crash Course',
    category: 'Online Course',
    description: 'Quick revision course for CSAT paper with practice questions.',
    price: 1999,
    imageUrl: 'https://via.placeholder.com/300x400?text=CSAT+Course',
  },
  {
    id: '6',
    name: 'Current Affairs Compilation',
    category: 'Study Material',
    description: 'Monthly current affairs compilation for UPSC preparation.',
    price: 299,
    imageUrl: 'https://via.placeholder.com/300x400?text=Current+Affairs',
  },
];

const Home: React.FC = () => {
  const [products, setProducts] = useState(mockProducts);
  const [sortBy, setSortBy] = useState('default');

  const handleAddToCart = (productId: string) => {
    // Add to cart logic here
    console.log('Added to cart:', productId);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSortBy(value);
    
    const sortedProducts = [...products];
    if (value === 'price-low-high') {
      sortedProducts.sort((a, b) => a.price - b.price);
    } else if (value === 'price-high-low') {
      sortedProducts.sort((a, b) => b.price - a.price);
    } else {
      // Default sorting (by ID or any other default criteria)
      sortedProducts.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    }
    
    setProducts(sortedProducts);
  };

  return (
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
              <h2 className="text-2xl font-bold">All Products</h2>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  category={product.category}
                  description={product.description}
                  price={product.price}
                  imageUrl={product.imageUrl}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

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
  );
};

export default Home;
