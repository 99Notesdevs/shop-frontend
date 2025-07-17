import React from 'react';

interface Product {
  id: number;
  title: string;
  price: string;
  rating: number;
  image: string;
}

const TopRatedProducts: React.FC = () => {
  // Sample data - replace with your actual data source
  const products: Product[] = [
    {
      id: 1,
      title: 'World History for UPSC',
      price: '349.00',
      rating: 4,
      image: 'https://via.placeholder.com/60x80?text=Book+Cover'
    },
    {
      id: 2,
      title: 'Indian Polity for UPSC',
      price: '399.00',
      rating: 4,
      image: 'https://via.placeholder.com/60x80?text=Book+Cover'
    },
    {
      id: 3,
      title: 'Geography for UPSC',
      price: '299.00',
      rating: 4,
      image: 'https://via.placeholder.com/60x80?text=Book+Cover'
    }
  ];

  // Function to render star rating
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="w-full max-w-md mx-auto bg-bg-light-secondary dark:bg-bg-dark-secondary rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-border-light dark:border-border-dark">
        <h2 className="text-xl font-semibold text-text-primary dark:text-text-primary">
          TOP RATED PRODUCTS
        </h2>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {products.map((product) => (
          <div key={product.id} className="p-4 hover:bg-gray-50 dark:hover:bg-bg-dark transition-colors duration-200">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <img 
                  className="w-15 h-20 object-cover rounded" 
                  src={product.image} 
                  alt={product.title} 
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary dark:text-text-primary truncate">
                  {product.title}
                </p>
                <div className="flex items-center mt-1">
                  <div className="flex">
                    {renderStars(product.rating)}
                  </div>
                </div>
                <p className="text-sm font-semibold text-primary mt-1">
                  ₹{product.price}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopRatedProducts;