import { useNavigate } from 'react-router-dom';
import { type FormEvent, useRef, useState, useEffect } from 'react';
import { api } from '../../api/route';
import { Search, ChevronDown } from 'lucide-react';

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
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSearch} className="relative flex items-center w-full">
        <div className="relative flex-1">
          
          
          <input
            className="block w-full pl-2 pr-40 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
            placeholder="Search for products..."
            type="text"
            ref={searchInputRef}
            aria-label="Search products"
          />
          
          {/* Category Dropdown */}
          <div className="absolute inset-y-0 right-12 flex items-center pr-3 group">
            <div className="h-5 w-px bg-gray-300 mx-3"></div>
            <div className="relative">
              <div className="flex items-center space-x-1 cursor-pointer text-gray-700 hover:text-gray-900">
                <span className="text-sm font-medium">
                  {categories.find(cat => (cat.slug || cat._id) === selectedCategory)?.name || 'All Categories'}
                </span>
                <ChevronDown className="h-4 w-4" />
              </div>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    selectedCategory === 'all' ? 'bg-gray-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category._id}
                    type="button"
                    onClick={() => setSelectedCategory(category.slug || category._id)}
                    className={`block w-full text-left px-4 py-2 text-sm cursor-pointer ${
                      (category.slug === selectedCategory || category._id === selectedCategory) 
                        ? 'bg-gray-100 text-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            className="absolute inset-y-0 right-0 px-4 flex items-center text-black border-l-2 border-gray-200 rounded-r-lg transition-colors duration-200 cursor-pointer"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;