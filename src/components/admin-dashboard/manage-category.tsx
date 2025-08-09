import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

import { toast } from 'react-hot-toast';
import { api } from '../../api/route';
import { ErrorBoundary } from '../ErrorBoundary';

interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: Category[];
}

function ManageCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  const handleEdit = (category: Category) => {
    navigate(`/admin/categories/edit/${category.id}`);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse>('/category');
      if (response.success && Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        console.error('Unexpected API response format:', response);
        toast.error('Failed to load categories: Invalid response format');
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!id) {
      toast.error('Invalid category ID');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      setDeletingId(id);
      const response = await api.delete<{success: boolean; message?: string}>(`/category/${id}`);
      if (response.success) {
        toast.success('Category deleted successfully');
        fetchCategories();
      } else {
        toast.error(response.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-500">
            {loading ? 'Loading...' : `${categories.length} ${categories.length === 1 ? 'category' : 'categories'} in total`}
          </p>
        </div>
        <Button 
          onClick={() => navigate('/admin/categories/add')}
          className="mt-3 sm:mt-0"
        >
          Add Category
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-4 h-20" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No categories</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new category.</p>
          <div className="mt-6">
            <Button
              onClick={() => navigate('/admin/categories/add')}
              className="inline-flex items-center px-4 py-2"
            >
              New Category
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg divide-y divide-gray-200">
          {categories.map((category) => (
            <div key={category.id} className="px-4 py-5 sm:px-6 hover:bg-gray-50 transition-colors duration-150">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-900 truncate">{category.name}</h3>
                    <span className="ml-2 px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {new Date(category.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {category.description && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0 flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(category)}
                    className="text-gray-600 hover:text-gray-900 border-0 shadow-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                    disabled={deletingId === category.id}
                    className="text-red-600 hover:text-red-900 hover:bg-red-50 bg-transparent border-0 shadow-none"
                  >
                    {deletingId === category.id ? (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ManageCategoriesWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <ManageCategories />
    </ErrorBoundary>
  );
}
