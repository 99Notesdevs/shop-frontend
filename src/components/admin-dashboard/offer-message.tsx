import { useState, useEffect } from 'react';
import { FiEdit2, FiX, FiCheck, FiAlertTriangle } from 'react-icons/fi';

const OFFER_MESSAGE_KEY = 'site_offer_message';

export const OfferMessageAdmin = () => {
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [tempMessage, setTempMessage] = useState('');

  useEffect(() => {
    // Load saved message on component mount
    const savedMessage = localStorage.getItem(OFFER_MESSAGE_KEY);
    if (savedMessage) {
      setMessage(savedMessage);
    }
  }, []);

  const handleSave = () => {
    if (tempMessage.trim()) {
      setMessage(tempMessage);
      localStorage.setItem(OFFER_MESSAGE_KEY, tempMessage);
      setIsEditing(false);
    }
  };

  const handleClear = () => {
    setMessage('');
    localStorage.removeItem(OFFER_MESSAGE_KEY);
    setIsEditing(false);
  };



  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-6 relative">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Special Offer Message</h2>
      
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={tempMessage}
            onChange={(e) => setTempMessage(e.target.value)}
            placeholder="Enter offer message (e.g., Get 10% off on all products!)"
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm"
            >
              <FiCheck className="mr-1" /> Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-gray-700">
            {message || 'No offer message set'}
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setTempMessage(message);
                setIsEditing(true);
              }}
              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full"
              title="Edit message"
            >
              <FiEdit2 size={18} />
            </button>
            {message && (
              <button
                onClick={handleClear}
                className="p-1.5 text-red-600 hover:bg-red-100 rounded-full"
                title="Clear message"
              >
                <FiX size={18} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 relative">
      <div className="flex items-center">
        <FiAlertTriangle className="text-yellow-500 mr-2 flex-shrink-0" />
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