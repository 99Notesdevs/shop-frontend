import { useNavigate } from 'react-router-dom';
import { type FormEvent, useRef, useState, useEffect } from 'react';
import { api } from '../../api/route';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export const SearchBar = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get<any>('/category');
        // Handle different possible response structures
        const fetchedCategories = Array.isArray(response) 
          ? response 
          : response?.data || response?.categories || [];
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const searchQuery = searchInputRef.current?.value.trim();
    
    if (searchQuery) {
      const searchParams = new URLSearchParams();
      searchParams.set('q', searchQuery);
      if (selectedCategory && selectedCategory !== 'all') {
        searchParams.set('category', selectedCategory);
      }
      navigate(`/search?${searchParams.toString()}`);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="flex items-center w-full">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            className="block w-full pl-10 pr-3 py-2 border border-r-0 border-gray-300 rounded-l-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search products..."
            type="text"
            ref={searchInputRef}
            aria-label="Search products"
          />
        </div>
        
        {/* Category Dropdown */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 pl-3 pr-8 text-sm border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            disabled={isLoading}
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category.slug || category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;