import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Checkbox } from '../ui/checkbox';

export default function StockStatusFilter() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize states from URL params
  const [isOnSale, setIsOnSale] = useState(false);
  const [isInStock, setIsInStock] = useState(false);

  // Read initial state from URL on component mount
  useEffect(() => {
    const onSale = searchParams.get('onSale') === 'true';
    const inStock = searchParams.get('inStock') === 'true';
    
    setIsOnSale(onSale);
    setIsInStock(inStock);
  }, [searchParams]);

  // Update URL when filter changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    if (isOnSale) {
      params.set('onSale', 'true');
    } else {
      params.delete('onSale');
    }
    
    if (isInStock) {
      params.set('inStock', 'true');
    } else {
      params.delete('inStock');
    }
    
    // Only update if there's a change to prevent unnecessary navigation
    if (params.toString() !== searchParams.toString()) {
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }
  }, [isOnSale, isInStock, navigate, location.pathname, searchParams]);

  return (
    <div className="space-y-4 p-4">
      <h3 className="font-medium">STOCK STATUS</h3>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="on-sale" 
            checked={isOnSale}
            onCheckedChange={(checked: boolean) => setIsOnSale(checked)}
          />
          <label
            htmlFor="on-sale"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            On sale
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="in-stock" 
            checked={isInStock}
            onCheckedChange={(checked: boolean) => setIsInStock(checked)}
          />
          <label
            htmlFor="in-stock"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            In stock
          </label>
        </div>
      </div>
    </div>
  );
}
