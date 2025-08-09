'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

const OFFER_MESSAGE_KEY = 'site_offer_message';

export const AddOfferMessage = () => {
  const [message, setMessage] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load existing message on component mount
    const savedMessage = localStorage.getItem(OFFER_MESSAGE_KEY) || '';
    setMessage(savedMessage);
    setCurrentMessage(savedMessage);
    setIsLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      localStorage.setItem(OFFER_MESSAGE_KEY, message.trim());
      setCurrentMessage(message.trim());
      setIsSaved(true);
      
      // Reset saved state after 3 seconds
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const handleClear = () => {
    setMessage('');
    setCurrentMessage('');
    localStorage.removeItem(OFFER_MESSAGE_KEY);
    setIsSaved(true);
    
    // Reset saved state after 3 seconds
    setTimeout(() => setIsSaved(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Offer Message</h2>
      
      <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r">
        <div className="flex items-center">
          <FiAlertTriangle className="text-yellow-500 mr-2 flex-shrink-0" />
          <p className="text-yellow-700">
            This message will be displayed as a banner at the top of the website.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="offer-message" className="block text-sm font-medium text-gray-700 mb-2">
            Offer Message
          </label>
          <textarea
            id="offer-message"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your special offer or announcement..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-4">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={!message.trim() || message === currentMessage}
          >
            <FiSave className="mr-2" />
            Save Message
          </button>
          
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={!currentMessage}
          >
            Clear Message
          </button>

          {isSaved && (
            <div className="flex items-center text-green-600">
              <FiCheckCircle className="mr-1" />
              <span className="text-sm">Changes saved successfully!</span>
            </div>
          )}
        </div>
      </form>

      {currentMessage && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Current Message Preview</h3>
          <div className="bg-yellow-50 p-4 border-l-4 border-yellow-400 rounded-r">
            <div className="flex items-center">
              <FiAlertTriangle className="text-yellow-500 mr-2 flex-shrink-0" />
              <p className="text-yellow-700">{currentMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddOfferMessage;