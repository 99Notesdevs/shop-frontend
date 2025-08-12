import React, { useState, useEffect } from 'react';
import { X, SlidersHorizontal, Tag, IndianRupee } from 'lucide-react';
import { api } from '../../api/route';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '../../lib/utils';

interface Category {
  _id: string;
  name: string;
  // Add other category properties as needed
}

interface FilterProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterChange: (filters: {
    category: string | null;
    priceRange: [number, number];
  }) => void;
}

const MIN_PRICE = 50;
const MAX_PRICE = 2000;

const Filter: React.FC<FilterProps> = ({ isOpen, onClose, onFilterChange }) => {
  const [priceRange, setPriceRange] = useState<[number, number]>([MIN_PRICE, MAX_PRICE]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([MIN_PRICE, MAX_PRICE]);
  // Track the currently selected category ID
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/category') as { success: boolean; data: Category[] };
        if (response.success) {
          setCategories(response.data);
        } else {
          setError('Failed to fetch categories');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Initialize states when the component opens
  useEffect(() => {
    if (isOpen) {
      setTempPriceRange(priceRange);
      setSelectedCategoryId(selectedCategory);
    }
  }, [isOpen, priceRange, selectedCategory]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = Number(e.target.value);
    const newPriceRange = [...tempPriceRange] as [number, number];
    newPriceRange[index] = value;
    
    // Ensure min is not greater than max and vice versa
    if (index === 0 && value > tempPriceRange[1]) {
      newPriceRange[1] = value;
    } else if (index === 1 && value < tempPriceRange[0]) {
      newPriceRange[0] = value;
    }
    
    setTempPriceRange(newPriceRange);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };
  
  const handleClearCategory = () => {
    setSelectedCategoryId(null);
  };
  
  const applyFilters = () => {
    setPriceRange(tempPriceRange);
    setSelectedCategory(selectedCategoryId);
    onFilterChange({
      category: selectedCategoryId,
      priceRange: tempPriceRange,
    });
    onClose();
  };



  // Reset all filters
  const resetFilters = () => {
    setSelectedCategoryId(null);
    setTempPriceRange([MIN_PRICE, MAX_PRICE]);
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="h-5 w-5 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">Filters</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-gray-50 transition-colors"
                aria-label="Close filters"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8">
            {/* Categories Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-700">
                <Tag className="h-4 w-4" />
                <h4 className="text-sm font-medium">Categories</h4>
              </div>
              
              {loading ? (
                <div className="py-2 text-sm text-gray-500">Loading categories...</div>
              ) : error ? (
                <div className="py-2 text-sm text-red-500">{error}</div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {categories.map((category) => (
                    <Label 
                      key={category._id} 
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                        selectedCategoryId === category._id 
                          ? "bg-blue-50 border border-blue-100" 
                          : "hover:bg-gray-50 border border-transparent"
                      )}
                    >
                      <div className={cn(
                        "h-4 w-4 rounded-full border flex items-center justify-center transition-all",
                        selectedCategoryId === category._id 
                          ? "border-blue-500 bg-blue-500" 
                          : "border-gray-300"
                      )}>
                        {selectedCategoryId === category._id && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-sm text-gray-700">{category.name}</span>
                      <input
                        type="radio"
                        name="category-selection"
                        checked={selectedCategoryId === category._id}
                        onChange={() => handleCategorySelect(category._id)}
                        className="sr-only"
                      />
                    </Label>
                  ))}
                </div>
              )}
            </div>

            {/* Price Range Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-700">
                <IndianRupee className="h-4 w-4" />
                <h4 className="text-sm font-medium">Price Range</h4>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-gray-500">Min</span>
                    <span className="text-sm font-medium">₹{tempPriceRange[0]}</span>
                  </div>
                  <div className="h-px w-4 bg-gray-200" />
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-gray-500">Max</span>
                    <span className="text-sm font-medium">₹{tempPriceRange[1]}</span>
                  </div>
                </div>
                
                <div className="relative h-2">
                  <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-gray-100" />
                  <div 
                    className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-blue-500"
                    style={{
                      left: `${(tempPriceRange[0] / MAX_PRICE) * 100}%`,
                      right: `${100 - (tempPriceRange[1] / MAX_PRICE) * 100}%`,
                    }}
                  />
                  <input
                    type="range"
                    min={MIN_PRICE}
                    max={MAX_PRICE}
                    value={tempPriceRange[0]}
                    onChange={(e) => handlePriceChange(e, 0)}
                    className="absolute top-1/2 left-0 h-full w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-blue-500 [&::-webkit-slider-thumb]:ring-offset-2 [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-150 [&::-webkit-slider-thumb]:ease-in-out"
                  />
                  <input
                    type="range"
                    min={MIN_PRICE}
                    max={MAX_PRICE}
                    value={tempPriceRange[1]}
                    onChange={(e) => handlePriceChange(e, 1)}
                    className="absolute top-1/2 left-0 h-full w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-blue-500 [&::-webkit-slider-thumb]:ring-offset-2 [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-150 [&::-webkit-slider-thumb]:ease-in-out"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 bg-white">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className="flex-1 py-2.5 px-4 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="flex-1 py-2.5 px-4 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Filter;