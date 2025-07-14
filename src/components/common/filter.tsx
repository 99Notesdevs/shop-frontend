import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';

type PriceRange = {
  min: number;
  max: number;
};

export default function PriceRangeFilter() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Default price range (you can adjust these values based on your products)
  const [priceRange] = useState<PriceRange>({
    min: 0,
    max: 10000
  });
  
  const [selectedRange, setSelectedRange] = useState<[number, number]>([0, 10000]);

  // Update URL when price range changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    if (selectedRange[0] > 0 || selectedRange[1] < priceRange.max) {
      params.set('minPrice', selectedRange[0].toString());
      params.set('maxPrice', selectedRange[1].toString());
    } else {
      params.delete('minPrice');
      params.delete('maxPrice');
    }
    
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [selectedRange, navigate, location.pathname, searchParams, priceRange.max]);

  // Handle slider change
  const handleRangeChange = (value: number[]) => {
    setSelectedRange([value[0], value[1]]);
  };

  // Handle manual input change
  const handleInputChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0;
    if (type === 'min') {
      setSelectedRange([Math.min(numValue, selectedRange[1] - 1), selectedRange[1]]);
    } else {
      setSelectedRange([selectedRange[0], Math.max(numValue, selectedRange[0] + 1)]);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-medium">Price Range</h3>
      
      <div className="space-y-4">
        <Slider
          min={priceRange.min}
          max={priceRange.max}
          step={10}
          value={selectedRange}
          onValueChange={handleRangeChange}
          minStepsBetweenThumbs={1}
          className="w-full"
        />
        
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <label className="text-sm text-muted-foreground mb-1 block">Min</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ₹
              </span>
              <Input
                type="number"
                value={selectedRange[0]}
                onChange={(e) => handleInputChange('min', e.target.value)}
                className="pl-8"
                min={priceRange.min}
                max={selectedRange[1] - 1}
              />
            </div>
          </div>
          
          <div className="h-0.5 w-4 bg-border mt-6" />
          
          <div className="flex-1">
            <label className="text-sm text-muted-foreground mb-1 block">Max</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ₹
              </span>
              <Input
                type="number"
                value={selectedRange[1]}
                onChange={(e) => handleInputChange('max', e.target.value)}
                className="pl-8"
                min={selectedRange[0] + 1}
                max={priceRange.max}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
