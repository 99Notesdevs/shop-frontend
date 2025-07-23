import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Slider } from '../ui/slider';

type PriceRange = {
  min: number;
  max: number;
};

export default function PriceRangeFilter() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [priceRange] = useState<PriceRange>({
    min: 0,
    max: 10000
  });
  
  const [selectedRange, setSelectedRange] = useState<[number, number]>([0, 10000]);
  const [isDragging, setIsDragging] = useState(false);

  // Format price with currency symbol and thousand separators
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Update URL when price range changes (with debounce)
  useEffect(() => {
    if (!isDragging) {
      const params = new URLSearchParams(searchParams);
      
      if (selectedRange[0] > priceRange.min || selectedRange[1] < priceRange.max) {
        params.set('minPrice', selectedRange[0].toString());
        params.set('maxPrice', selectedRange[1].toString());
      } else {
        params.delete('minPrice');
        params.delete('maxPrice');
      }
      
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }
  }, [selectedRange, isDragging, navigate, location.pathname, searchParams, priceRange.min, priceRange.max]);

  // Handle slider change
  const handleRangeChange = (value: number[]) => {
    setSelectedRange([value[0], value[1]]);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Price Range</h3>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <label htmlFor="minPrice" className="block text-sm font-medium text-gray-600 mb-1">
              Min
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₹</span>
              </div>
              <input
                type="number"
                id="minPrice"
                min={priceRange.min}
                max={selectedRange[1] - 1}
                value={selectedRange[0]}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || priceRange.min;
                  setSelectedRange([Math.min(value, selectedRange[1] - 1), selectedRange[1]]);
                }}
                className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="h-0.5 w-4 bg-gray-300 mt-5"></div>
          
          <div className="flex-1">
            <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-600 mb-1">
              Max
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₹</span>
              </div>
              <input
                type="number"
                id="maxPrice"
                min={selectedRange[0] + 1}
                max={priceRange.max}
                value={selectedRange[1]}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || priceRange.max;
                  setSelectedRange([selectedRange[0], Math.max(value, selectedRange[0] + 1)]);
                }}
                className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
        
        <div className="px-2">
          <Slider
            min={priceRange.min}
            max={priceRange.max}
            step={100}
            value={selectedRange}
            onValueChange={handleRangeChange}
            onPointerDown={() => setIsDragging(true)}
            onPointerUp={() => setIsDragging(false)}
            minStepsBetweenThumbs={1}
            className="w-full"
          />
        </div>
        
        <div className="flex justify-between text-sm text-gray-500 px-1">
          <span>{formatPrice(priceRange.min)}</span>
          <span>{formatPrice(priceRange.max)}</span>
        </div>
      </div>
    </div>
  );
}
