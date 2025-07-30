import React, { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import CategoriesDropdown from './categories';

interface FilterProps {
  onFilterChange: (filters: {
    category: string | null;
    priceRange: [number, number];
    brands: string[];
  }) => void;
}

const brands = [
  { id: 'nike', name: 'Nike' },
  { id: 'adidas', name: 'Adidas' },
  { id: 'puma', name: 'Puma' },
  { id: 'reebok', name: 'Reebok' },
  { id: 'new-balance', name: 'New Balance' },
];

const Filter: React.FC<FilterProps> = ({ onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newPriceRange = [...priceRange] as [number, number];
    newPriceRange[index] = Number(e.target.value);
    setPriceRange(newPriceRange);
    applyFilters(selectedCategory, newPriceRange, selectedBrands);
  };

  const handleBrandToggle = (brandId: string) => {
    const newSelectedBrands = selectedBrands.includes(brandId)
      ? selectedBrands.filter(id => id !== brandId)
      : [...selectedBrands, brandId];
    setSelectedBrands(newSelectedBrands);
    applyFilters(selectedCategory, priceRange, newSelectedBrands);
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    applyFilters(categoryId, priceRange, selectedBrands);
  };

  const applyFilters = (
    category: string | null,
    price: [number, number],
    brands: string[]
  ) => {
    onFilterChange({
      category,
      priceRange: price,
      brands,
    });
  };

  const resetFilters = () => {
    setSelectedCategory(null);
    setPriceRange([0, 1000]);
    setSelectedBrands([]);
    onFilterChange({
      category: null,
      priceRange: [0, 1000],
      brands: [],
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span>Filters</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 w-64 mt-2 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="p-4 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Filters</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Categories */}
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-900">Categories</h4>
                <div className="space-y-2">
                  <CategoriesDropdown 
                    // onCategorySelect={handleCategorySelect}
                    selectedCategory={selectedCategory}
                  />
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-900">Price Range</h4>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={priceRange[0]}
                      onChange={(e) => handlePriceChange(e, 0)}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={priceRange[1]}
                      onChange={(e) => handlePriceChange(e, 1)}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Brands */}
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-900">Brands</h4>
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <div key={brand.id} className="flex items-center">
                      <input
                        id={`brand-${brand.id}`}
                        type="checkbox"
                        checked={selectedBrands.includes(brand.id)}
                        onChange={() => handleBrandToggle(brand.id)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <label
                        htmlFor={`brand-${brand.id}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {brand.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={resetFilters}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter;