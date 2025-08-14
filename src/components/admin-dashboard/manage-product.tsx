"use client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

import { api } from "../../api/route";
import { toast } from "react-toastify";

interface Product {
  _id: string;
  id?: string; // Add optional id field for API compatibility
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  stock: number;
  category: string;
  imageurl: string;
  createdAt: string;
  updatedAt: string;
}

export function ManageProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ success: boolean; data: Product[] }>('/product');
      console.log('Fetched products:', response); // Debug log
      if (response.success && Array.isArray(response.data)) {
        // Filter out any products without an ID and ensure _id is always defined
        const validProducts = response.data
          .filter(product => product._id || product.id) // Only include products with an ID
          .map(product => ({
            ...product,
            _id: (product._id || product.id) as string // We know at least one is defined due to the filter
          }));
        console.log('Processed products:', validProducts); // Debug log
        setProducts(validProducts);
      } else {
        console.error('Unexpected API response format:', response);
        toast.error('Failed to load products: Invalid response format');
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId: string | undefined) => {
    if (!productId) {
      console.error('Product ID is undefined');
      toast.error('Cannot delete product: Invalid product ID');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      setDeleteLoading(productId);
      console.log('Deleting product with ID:', productId);
      const response = await api.delete(`/product/${productId}`);
      console.log('Delete response:', response);
      toast.success('Product deleted successfully');
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your product inventory and details
          </p>
        </div>
        <Button 
          onClick={() => window.location.href = '/admin/add-product'}
          className="w-full sm:w-auto"
        >
          + Add New Product
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
          <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No products</h3>
          <p className="mt-1 text-sm text-gray-600">
            Get started by adding your first product.
          </p>
          <div className="mt-6">
            <Button onClick={() => window.location.href = '/admin/add-product'}>
              Add Product
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div 
              key={product._id || Math.random().toString(36).substr(2, 9)}
              className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100"
            >
              <div className="relative aspect-square bg-gray-50 overflow-hidden">
                {product.imageurl && product.imageurl.length > 0 ? (
                  <img
                    src={product.imageurl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                    <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-500">No image available</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-gray-800">
                    {product.category}
                  </span>
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">
                      ${product.salePrice?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
                
                <p className="mt-2 text-sm text-gray-600 line-clamp-2 h-10">
                  {product.description || 'No description provided'}
                </p>
                
                <div className="mt-4 flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.stock > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Updated {formatDate(product.updatedAt)}
                  </span>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 transition-colors"
                    onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 transition-colors"
                    onClick={() => handleDelete(product._id)}
                    disabled={deleteLoading === product._id}
                  >
                    {deleteLoading === product._id ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                      </>
                    ) : 'Delete'}
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

export default ManageProducts;