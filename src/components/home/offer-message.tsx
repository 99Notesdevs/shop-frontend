import { useState, useEffect, useCallback } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import { api } from '../../api/route';

interface Offer {
  id: string;
  description: string;
  // Add other offer properties as needed
}

export const OfferMessageDisplay = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, ] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const fetchOffers = useCallback(async () => {
    try {
      const response = await api.get('/offers') as { success: boolean; data: Offer[] };
      if (response.success && response.data.length > 0) {
        setOffers(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch offers', err);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  useEffect(() => {
    if (offers.length <= 1) return;

    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % offers.length);
        setIsAnimating(false);
      }, 500);
    }, 3000);

    return () => clearInterval(timer);
  }, [offers.length]);

  if (!offers.length || !isVisible) return null;

  return (
    <div className="bg-[var(--primary)] border-l-4 border-yellow-400 p-3 mb-2 relative overflow-hidden">
      <div className="flex items-center">
        <div className="relative w-full">
          <div className="relative h-6 overflow-hidden">
            <div 
              className={`absolute left-0 right-0 transition-all duration-500 ${
                isAnimating ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'
              }`}
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            >
              <div className="flex items-center justify-center pb-2">
                <FiAlertTriangle className="text-[var(--text-light)] mr-2 flex-shrink-0" />
                <p className="text-[var(--text-light)] font-medium text-sm">{offers[currentIndex]?.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferMessageDisplay;