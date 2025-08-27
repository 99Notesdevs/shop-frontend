"use client";

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { api } from '../../api/route';

interface CategoryFormData {
  name: string;
  description: string;
}

const AddCategoryPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (isEditMode) {
      const fetchCategory = async () => {
        try {
          const response = await api.get(`/category/${id}`) as {
            success: boolean;
            data: CategoryFormData;
          };

          if (response.success && response.data) {
            setFormData({
              name: response.data.name,
              description: response.data.description
            });
          }
        } catch (error) {
          console.error('Error fetching category:', error);
          toast.error('Failed to load category data');
          navigate('/admin/categories');
        } finally {
          setLoading(false);
        }
      };

      fetchCategory();
    }
  }, [id, isEditMode, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      let response;

      if (isEditMode) {
        response = await api.put(`/category/${id}`, formData) as {
          success: boolean;
          message?: string
        };
      } else {
        response = await api.post('/category', formData) as {
          success: boolean;
          message?: string
        };
      }

      if (!response.success) {
        throw new Error(response.message || `Failed to ${isEditMode ? 'update' : 'create'} category`);
      }

      toast.success(`Category ${isEditMode ? 'updated' : 'created'} successfully!`);
      navigate('/admin/manage-category');
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} category:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'create'} category`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isEditMode ? 'Edit Category' : 'Add New Category'}
          </h1>
          <p className="text-gray-600">
            {isEditMode
              ? 'Update the category details below.'
              : 'Create a new product category for your store'}
          </p>
        </div>

        <Card className="p-8 shadow-lg rounded-xl border border-gray-100 bg-white">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="name" className="text-base font-medium text-gray-700">
                    Category Name <span className="text-red-500">*</span>
                  </Label>
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Electronics, Clothing, Home & Living"
                  disabled={loading}
                  className={`h-12 text-base ${errors.name ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-primary/50'}`}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description" className="text-base font-medium text-gray-700">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                </div>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide a detailed description of this category..."
                  rows={5}
                  disabled={loading}
                  className={`min-h-[120px] text-base ${errors.description ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-primary/50'}`}
                />
                <p className="text-sm text-gray-500 mt-1">
                  This will help customers find products in this category.
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white pb-4 pt-4 border-t border-gray-100 -mx-8 px-8 -mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Button
                    type="submit"
                    disabled={loading || submitting}
                    className="w-full sm:w-auto px-8 py-2.5 text-base font-medium bg-blue-700 hover:bg-blue-800 text-white transition-all duration-200 transform hover:scale-[1.02] active:scale-95"
                  >
                    {loading
                      ? 'Loading...'
                      : submitting
                        ? (isEditMode ? 'Updating...' : 'Creating...')
                        : (isEditMode ? 'Update Category' : 'Create Category')}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AddCategoryPage;