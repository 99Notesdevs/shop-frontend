import { useState } from 'react';
import type { FC } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ProductHighlightsProps {
  className?: string;
  metaData?: Record<string, string>;
}

const defaultHighlights = [
  'Author',
  'Language',
  'Publisher',
  'Pages',
  'Weight',
  'Dimensions',
  'Edition'
];

const ProductHighlights: FC<ProductHighlightsProps> = ({ className = '', metaData = {} }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const highlights = defaultHighlights
    .filter(key => {
      const lowerKey = key.toLowerCase();
      const metaValue = Object.entries(metaData).find(([k]) => k.toLowerCase() === lowerKey)?.[1];
      return metaValue && String(metaValue).trim() !== '';
    })
    .map(key => {
      const lowerKey = key.toLowerCase();
      const metaEntry = Object.entries(metaData).find(([k]) => k.toLowerCase() === lowerKey);
      return {
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim(),
        value: String(metaEntry?.[1] || '')
      };
    });

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
            {highlights.length > 0 ? (
              highlights.map((item, index) => (
                <div key={index} className="flex justify-between py-1 text-gray-700">
                  <span className="font-light w-1/2">{item.label} :</span>
                  <span className="w-1/2">{item.value}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 py-2 text-center">No highlights available</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductHighlights;