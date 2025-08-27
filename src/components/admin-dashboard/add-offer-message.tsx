'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiAlertTriangle, FiCheckCircle, FiEdit, FiTrash2 } from 'react-icons/fi';
import { api } from '../../api/route';

interface Offer {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export const AddOfferMessage = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await api.get('/offers') as {data: Offer[]};
      setOffers(response.data);
      setIsLoading(false);
    } catch (err) {
      setError("No offer found");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter an offer name');
      return;
    }
    if (!description.trim()) {
      setError('Please enter an offer description');
      return;
    }

    try {
      if (editingId) {
        // Update existing offer
        await api.put(`/offers/${editingId}`, { name, description });
        setSuccess('Offer updated successfully');
      } else {
        // Create new offer
        await api.post('/offers', { 
          name, 
          description
        });
        setSuccess('Offer created successfully');
      }
      
      resetForm();
      fetchOffers();
    } catch (err) {
      setError('Failed to save offer');
    } finally {
      setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
    }
  };

  const handleEdit = (offer: Offer) => {
    setName(offer.name || '');
    setDescription(offer.description || '');
    setEditingId(offer.id);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        await api.delete(`/offers/${id}`);
        setSuccess('Offer deleted successfully');
        fetchOffers();
      } catch (err) {
        setError('Failed to delete offer');
      }
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setEditingId(null);
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Manage Offers</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Offer Messages</h1>
          <p className="mt-2 text-gray-600">Create and manage special offers for your customers</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r">
            <div className="flex items-center">
              <FiAlertTriangle className="h-5 w-5 text-red-500 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r">
            <div className="flex items-center">
              <FiCheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8 transition-all duration-200 hover:shadow-md">
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingId ? 'Edit Offer Message' : 'Create New Offer'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {editingId ? 'Update the offer details below' : 'Fill in the details to create a new offer'}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Offer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g., Summer Sale, Black Friday, etc."
                  required
                />
              </div>
              
              <div className="space-y-1">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Offer Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  rows={3}
                  className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter the offer details, terms, and conditions..."
                  required
                />
              </div>
              
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center transition-colors duration-200"
                >
                  <FiSave className="mr-2 h-4 w-4" />
                  {editingId ? 'Update Offer' : 'Create Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Active Offers</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {offers.length} {offers.length === 1 ? 'Offer' : 'Offers'}
              </span>
            </div>
          </div>
        
          {offers.length === 0 ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <FiAlertTriangle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No offers yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                You haven't created any offers yet. Click the "Create Offer" button above to get started.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {offers.map((offer) => (
                <li key={offer.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-medium text-gray-900 truncate">{offer.name}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{offer.description}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 mr-1.5">Created:</span>
                          <time dateTime={offer.createdAt}>
                            {new Date(offer.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </time>
                        </div>
                        {offer.updatedAt !== offer.createdAt && (
                          <div className="flex items-center">
                            <span className="font-medium text-gray-700 mr-1.5">Updated:</span>
                            <time dateTime={offer.updatedAt}>
                              {new Date(offer.updatedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </time>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:ml-4 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(offer)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                        title="Edit offer"
                        aria-label="Edit offer"
                      >
                        <FiEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(offer.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                        title="Delete offer"
                        aria-label="Delete offer"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddOfferMessage;