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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your product categories
          </p>
        </div>
        <Button 
          onClick={() => navigate('/admin/categories/add')}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
        >
          + Add New Category
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
          <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 1.1.9 2 2 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H6a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No categories</h3>
          <p className="mt-1 text-sm text-gray-600">
            Get started by creating your first category.
          </p>
          <div className="mt-6">
            <Button 
              onClick={() => navigate('/admin/categories/add')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add Category
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50 h-20">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {category.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 line-clamp-1">
                        {category.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(category.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(category)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(category.id)}
                          disabled={deletingId === category.id}
                        >
                          {deletingId === category.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
