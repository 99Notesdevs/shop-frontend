import { useState, useEffect } from 'react';
import { FiX,FiAlertTriangle } from 'react-icons/fi';

const OFFER_MESSAGE_KEY = 'site_offer_message';

export const OfferMessageDisplay = () => {
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Load message from local storage
    const savedMessage = localStorage.getItem(OFFER_MESSAGE_KEY);
    if (savedMessage) {
      setMessage(savedMessage);
    }
  }, []);

  if (!message || !isVisible) return null;

  return (
    <div className="bg-[var(--primary)] border-l-4 border-yellow-400 p-4 mb-2 relative">
      <div className="flex items-center pb-2">
        <FiAlertTriangle className="text-[var(--text-light)] mr-2 flex-shrink-0" />
        <p className="text-yellow-700">{message}</p>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-auto text-yellow-600 hover:text-yellow-800"
          aria-label="Dismiss"
        >
          <FiX size={18} />
        </button>
      </div>
    </div>
  );
};

export default OfferMessageDisplay;