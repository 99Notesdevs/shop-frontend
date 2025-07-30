import { ProductCard } from '../product/product-card';
import React from 'react';

interface ProductData {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  imageUrl: string;
  type: 'foundation' | 'test' | 'subject';
}

interface ShowProductProps {
  onAddToCart: (id: string) => void;
}

const productData: ProductData[] = [
  {
    id: 'foundation-course',
    name: 'Foundation Course',
    category: 'Premium Course',
    description: 'Comprehensive foundation course covering all the basics to get you started on your learning journey.',
    price: 4999,
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    type: 'foundation'
  },
  {
    id: 'test-series',
    name: 'Test Series',
    category: 'Practice Tests',
    description: 'Comprehensive test series to help you prepare for your exams with real-time performance analysis.',
    price: 2999,
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    type: 'test'
  },
  {
    id: 'subject-wise',
    name: 'Subject-wise Courses',
    category: 'Focused Learning',
    description: 'In-depth courses on individual subjects to strengthen your understanding in specific areas.',
    price: 1999,
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    type: 'subject'
  }
];

export const ShowProduct: React.FC<ShowProductProps> = ({ onAddToCart }) => {
  const renderProductSection = (type: ProductData['type'], title: string) => {
    const products = productData.filter(product => product.type === type);
    
    return (
      <div key={type} className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard 
              key={product.id}
              id={product.id}
              name={product.name}
              category={product.category}
              description={product.description}
              price={product.price}
              imageUrl={product.imageUrl}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {renderProductSection('foundation', 'Foundation Course')}
        {renderProductSection('test', 'Test Series')}
        {renderProductSection('subject', 'Subject-wise Courses')}
      </div>
    </section>
  );
};

export default ShowProduct;