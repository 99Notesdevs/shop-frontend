import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { api } from '../../api/route';
import { uploadImageToS3 } from '../../config/imageUploadS3';

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
  imageUrl: string; // This will store comma-separated URLs
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
  const [imagePreviews, setImagePreviews] = useState<{url: string, isMain: boolean}[]>([]);
  const [isUploading, setIsUploading] = useState(false);

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
        setImagePreviews(product.imageUrl ? product.imageUrl.split(',').filter(Boolean).map((url, index) => ({url, isMain: index === 0})) : []);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Filter only image files
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast.error('Please upload image files only');
      return;
    }

    // Set previews
    const newPreviews = await Promise.all(
      imageFiles.map(file => {
        return new Promise<{url: string, isMain: boolean}>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              url: reader.result as string,
              isMain: imagePreviews.length === 0 // First image is main by default
            });
          };
          reader.readAsDataURL(file);
        });
      })
    );

    setImagePreviews(prev => [...prev, ...newPreviews]);

    // Upload to S3
    try {
      setIsUploading(true);
      const uploadPromises = imageFiles.map(file => {
        const formData = new FormData();
        console.log(file)
        formData.append('imageUrl', file);
        console.log(formData)
        return uploadImageToS3(formData, 'shop-products',file.name);
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(url => url) as string[];
      
      if (validUrls.length > 0) {
        setFormData(prev => ({
          ...prev,
          imageUrl: [...(prev.imageUrl ? prev.imageUrl.split(',') : []), ...validUrls].filter(Boolean).join(',')
        }));
      } else {
        toast.error('Failed to upload some images');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Error uploading images');
    } finally {
      setIsUploading(false);
    }
  };

  const setAsMainImage = (index: number) => {
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      // Set all images' isMain to false
      newPreviews.forEach(img => img.isMain = false);
      // Set the selected image as main
      newPreviews[index].isMain = true;
      // Move the main image to the first position
      const mainImage = newPreviews.splice(index, 1)[0];
      return [mainImage, ...newPreviews];
    });
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      const isRemovingMain = newPreviews[index].isMain;
      newPreviews.splice(index, 1);
      
      // If we removed the main image and there are other images, set the next one as main
      if (isRemovingMain && newPreviews.length > 0) {
        newPreviews[0].isMain = true;
      }
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        imageUrl: newPreviews.map(img => img.url.split('?')[0]).join(',')
      }));
      
      return newPreviews;
    });
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
    
    // Check if the field is a metadata field
    if (['author', 'language', 'publisher', 'pages', 'weight', 'dimensions', 'edition'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [name]: value
        }
      }));
    } else {
      // Handle regular fields
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
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

            {/* Image Upload */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Product Images
              </label>
              <div className="mt-1 flex items-center">
                <label className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  {isUploading ? 'Uploading...' : 'Choose Images'}
                  <input
                    type="file"
                    className="sr-only"
                    onChange={handleImageUpload}
                    multiple
                    accept="image/*"
                    disabled={isUploading}
                  />
                </label>
              </div>
              
              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={preview.url} 
                        alt={`Preview ${index + 1}`} 
                        className={`w-full h-32 object-cover rounded-lg border-2 ${preview.isMain ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}
                      />
                      <div className="absolute top-2 left-2 flex space-x-1">
                        {!preview.isMain && (
                          <button
                            type="button"
                            onClick={() => setAsMainImage(index)}
                            className="p-1 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100"
                            title="Set as main"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="p-1 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100"
                          title="Remove image"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      {preview.isMain && (
                        <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Main
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

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

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
            
            <div className='flex justify-center bg-gray-200 h-8 font-semibold' >
            <p>Optional Fields</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              
              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                  Author
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.metadata?.author || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                  Language
                </label>
                <input
                  type="text"
                  id="language"
                  name="language"
                  value={formData.metadata?.language || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label htmlFor="publisher" className="block text-sm font-medium text-gray-700">
                  Publisher
                </label>
                <input
                  type="text"
                  id="publisher"
                  name="publisher"
                  value={formData.metadata?.publisher || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label htmlFor="pages" className="block text-sm font-medium text-gray-700">
                  Pages
                </label>
                <input
                  type="text"
                  id="pages"
                  name="pages"
                  value={formData.metadata?.pages || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                  Weight
                </label>
                <input
                  type="text"
                  id="weight"
                  name="weight"
                  value={formData.metadata?.weight || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700">
                  Dimensions
                </label>
                <input
                  type="text"
                  id="dimensions"
                  name="dimensions"
                  value={formData.metadata?.dimensions || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  placeholder="e.g., 8.5 x 11 x 1 inches"
                />
              </div>
              <div>
                <label htmlFor="edition" className="block text-sm font-medium text-gray-700">
                  Edition
                </label>
                <input
                  type="text"
                  id="edition"
                  name="edition"
                  value={formData.metadata?.edition || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  placeholder="e.g., 1st Edition"
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
