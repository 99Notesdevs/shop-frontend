import { useNavigate } from 'react-router-dom';
import { type FormEvent, useRef } from 'react';
import { Search } from 'lucide-react';



export const SearchBar = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);


  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const searchQuery = searchInputRef.current?.value.trim();
    
    if (searchQuery) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
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