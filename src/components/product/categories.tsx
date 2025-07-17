import React, { useEffect, useState } from 'react';
import { api } from '../../api/route';

interface Category {
  id: number | string;
  name: string;
  description: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoriesDropdownProps {
  onCategorySelect?: (categoryId: number | string | null) => void;
  selectedCategory?: number | string | null;
}

const CategoriesDropdown: React.FC<CategoriesDropdownProps> = ({ onCategorySelect, selectedCategory }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/category') as { success: boolean; data: Category[] };
        console.log(response);
        if (response.success) {
          setCategories(response.data);
        } else {
          setError('Failed to fetch categories');
        }
      } catch (err) {
        setError('Error fetching categories. Please try again later.');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="px-4 py-2 text-sm text-gray-600">
        Loading categories...
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-2 text-sm text-red-600">
        {error}
      </div>
    );
  }
  const handleCategoryClick = (categoryId: number | string | null) => {
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    }
  };

  return (
    <div className="relative group">
      <div className="flex items-center gap-2">
        <button 
          type="button"
          className="flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span>{selectedCategory ? 
            categories.find(cat => cat.id === selectedCategory)?.name || 'Select Category' 
            : 'All Categories'}
          </span>
          <svg 
            className="w-5 h-5 ml-2 -mr-1" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
              clipRule="evenodd" 
            />
          </svg>
        </button>
        
        {selectedCategory && (
          <button
            type="button"
            onClick={() => handleCategoryClick(null)}
            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
            title="Clear filter"
          >
            ×
          </button>
        )}
      </div>
      
      <div 
        className="absolute right-0 z-10 w-56 mt-2 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="categories-menu"
      >
        <div className="py-1" role="none">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`w-full text-left px-4 py-2 text-sm ${!selectedCategory ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`}
            role="menuitem"
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`w-full text-left px-4 py-2 text-sm ${selectedCategory === category.id ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`}
              role="menuitem"
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesDropdown;