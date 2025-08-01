import { useState } from 'react';
import type { FC } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface HighlightItem {
  label: string;
  value: string;
}

interface ProductHighlightsProps {
  className?: string;
}

const ProductHighlights: FC<ProductHighlightsProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  
  const highlights: HighlightItem[] = [
    { label: 'Author', value: 'Pulakit Bharti' },
    { label: 'Language', value: 'English' },
    { label: 'Publisher', value: 'Dilshad' },
    { label: 'Pages', value: '335' },
    { label: 'Weight', value: '0.5 kg' },
    { label: 'Dimensions', value: '26*16*7' },
    { label: 'Edition', value: '34th' },
  ];

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <div 
        className="flex justify-between items-center p-4 cursor-pointer bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-semibold text-gray-900">Product Highlights</h3>
        {isOpen ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
      </div>
      
      {isOpen && (
        <>
          <div className="px-4 py-2">
            {highlights.map((item, index) => (
              <div key={index} className="flex justify-between py-1 text-gray-700">
                <span className="font-light w-1/2">{item.label} :</span>
                <span className="w-1/2">{item.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductHighlights;