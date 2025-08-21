import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { api } from '../../api/route';

interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductData {
  id?: string;
  name: string;
  description: string;
  price: string;
  salePrice: string;
  stock: string;
  imageUrl: string;
  categoryId: string;
  validity: string;
  shippingCharges: string;
  type: 'softCopy' | 'hardCopy';
  metadata?: {
    author?: string;
    language?: string;
    publisher?: string;
    pages?: string | number;
    weight?: string | number;
    dimensions?: string;
    edition?: string;
  };
}

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.get('/category') as { success: boolean; data: Category[] };
        if (!data.success) {
          throw new Error('Failed to fetch categories');
        }
        if (data.success && data.data) {
          setCategories(data.data);
          
          // If in edit mode, fetch the product data
          if (isEditMode) {
            await fetchProduct();
          } else {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error(`Failed to load ${isEditMode ? 'product' : 'categories'}`);
        setIsLoading(false);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [id]);

  const fetchProduct = async () => {
    try {
      console.log('Fetching product with ID:', id); // Debug log
      const response = await api.get(`/product/${id}`) as { 
        success: boolean; 
        data: {
          name: string;
          description: string;
          price: number;
          salePrice: number | null;
          stock: number;
          imageUrl: string;
          categoryId: number;
          validity?: number;
          shippingCharges?: number;
          type?: 'softCopy' | 'hardCopy';
          metadata?: {
            author?: string;
            language?: string;
            publisher?: string;
            pages?: string;
            weight?: string;
            dimensions?: string;
            edition?: string;
          };
        } 
      };
      
      console.log('Product API response:', response); // Debug log
      
      if (response && response.success && response.data) {
        const product = response.data;
        const metadata = typeof product.metadata === 'string' ? JSON.parse(product.metadata) : {};
        
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price?.toString() || '',
          salePrice: product.salePrice?.toString() || '',
          stock: product.stock?.toString() || '0',
          imageUrl: product.imageUrl || '',
          categoryId: product.categoryId?.toString() || '',
          validity: product.validity?.toString() || '',
          shippingCharges: product.shippingCharges?.toString() || '50',
          type: product.type || 'softCopy',
          metadata: {
            author: metadata?.author || '',
            language: metadata?.language || '',
            publisher: metadata?.publisher || '',
            pages: metadata?.pages || '',
            weight: metadata?.weight || '',
            dimensions: metadata?.dimensions || '',
            edition: metadata?.edition || '',
          },
        });
      } else {
        console.error('Invalid product data format:', response);
        toast.error('Failed to load product data');
        navigate('/admin/manage-product');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
      navigate('/admin/manage-product');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize form with default values
  const [formData, setFormData] = useState<ProductData>({
    name: '',
    description: '',
    price: '',
    salePrice: '',
    stock: '0',
    imageUrl: '',
    categoryId: '',
    validity: '',
    shippingCharges: '50',
    type: 'softCopy',
    metadata: {
      author: '',
      language: '',
      publisher: '',
      pages: '',
      weight: '',
      dimensions: '',
      edition: '',
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    console.log('Form data updated:', { ...formData, [name]: value }); // Debug log
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare the product data
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        stock: parseInt(formData.stock, 10),
        categoryId: parseInt(formData.categoryId, 10),
        imageUrl: formData.imageUrl,
        validity: formData.validity ? parseInt(formData.validity, 10) : undefined,
        shippingCharges: parseFloat(formData.shippingCharges) || 0,
        type: formData.type || 'softCopy',
        metadata: JSON.stringify(formData.metadata || {}), // Stringify the metadata object
      };

      console.log('Submitting product data:', productData); // Debug log

      let response;
      if (isEditMode && id) {
        // Update existing product
        response = await api.put(`/product/${id}`, productData) as { 
          success: boolean; 
          data?: any;
          message?: string;
        };
        
        if (response.success) {
          toast.success('Product updated successfully!');
          navigate('/admin/manage-product');
          return;
        }
      } else {
        // Create new product
        response = await api.post('/product', productData) as { 
          success: boolean;
          data?: any;
          message?: string;
        };
        
        if (response.success) {
          toast.success('Product created successfully!', {
            position: 'top-center',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'light',
          });
          navigate('/admin/manage-product');
          return;
        }
      }
      
      // If we get here, there was an error
      throw new Error(response.message || 'Failed to process product');

    } catch (error: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} product:`, error);
      const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred';
      toast.error(`Failed to ${isEditMode ? 'update' : 'add'} product: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      
        <title>Add New Product</title>
      
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {isEditMode 
                ? 'Update the product details below.' 
                : 'Fill in the details below to add a new product to the store.'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                required
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  min="0"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div>
                <label htmlFor="salePrice" className="block text-sm font-medium text-gray-700">
                  Sale Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="salePrice"
                  name="salePrice"
                  min="0"
                  required
                  value={formData.salePrice}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              
            </div>

            <div className="space-y-2">
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              {isLoadingCategories ? (
                <div className="animate-pulse h-10 bg-gray-200 rounded-md"></div>
              ) : (
                <select
                  id="categoryId"
                  name="categoryId"
                  required
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Select a category for this product
              </p>
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                Image URL
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="shippingCharges" className="block text-sm font-medium text-gray-700">
                  Shipping Charges (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="shippingCharges"
                  name="shippingCharges"
                  min="0"
                  required
                  value={formData.shippingCharges}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div>
                <label htmlFor="salePrice" className="block text-sm font-medium text-gray-700">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                >
                  <option value="">Select Type</option>
                  <option value="softCopy">Soft Copy</option>
                  <option value="hardCopy">Hard Copy</option>
                </select>
              </div>

              
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="validity" className="block text-sm font-medium text-gray-700">
                Validity (in days)
              </label>
              <input
                type="number"
                id="validity"
                name="validity"
                min="1"
                value={formData.validity}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                placeholder="Optional"
              />
            </div>
            <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                  Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  min="0"
                  required
                  value={formData.stock}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
              </div>


            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting 
                  ? (isEditMode ? 'Updating...' : 'Adding...') 
                  : (isEditMode ? 'Update Product' : 'Add Product')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
