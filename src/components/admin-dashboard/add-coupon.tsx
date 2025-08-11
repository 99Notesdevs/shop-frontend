import { useState, useEffect } from 'react';
import { api } from '../../api/route';
import { toast } from 'react-toastify';
// Format function removed as it's not being used
import type { AxiosResponse } from 'axios';



interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

interface Coupon {
  id: number;
  code: string;
  discount: number;
  validity: number;
  type: string;
  usageLimit?: number;
  timesUsed: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  users?: any[]; // Assuming UserData type is not critical for the frontend
}

interface CouponFormData {
  code: string;
  discount: number;
  validity: number;
  type: string;
  usageLimit?: number;
}

export default function AddCoupon() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    discount: 0,
    validity: 30, // Default validity of 30 days
    type: 'percentage', // Default type
    usageLimit: undefined
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'discount' || name === 'validity' || name === 'usageLimit'
        ? value ? Number(value) : undefined 
        : value
    }));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      console.log('Fetching coupons...');
      const response = await api.get('/coupon');
      console.log('Raw API Response:', response);
      
      // Handle different response formats
      if (response && typeof response === 'object') {
        // Case 1: Response has success and data properties
        if ('success' in response && 'data' in response) {
          if (response.success && Array.isArray(response.data)) {
            console.log('Setting coupons:', response.data);
            setCoupons(response.data);
            return;
          }
        }
        // Case 2: Response is directly an array of coupons
        else if (Array.isArray(response)) {
          console.log('Setting coupons (direct array):', response);
          setCoupons(response);
          return;
        }
      }
      
      console.error('Unexpected response format:', response);
      toast.error('Unexpected response format from server');
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to fetch coupons');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const couponData = {
        ...formData,
        // Remove any undefined values
        ...(formData.usageLimit === undefined ? {} : { usageLimit: formData.usageLimit })
      };
      
      if (editingId) {
        const response: AxiosResponse<ApiResponse> = await api.put(`/coupon/${editingId}`, couponData);
        if (response.data.success) {
          toast.success('Coupon updated successfully!');
        }
      } else {
        const response: AxiosResponse<ApiResponse> = await api.post('/coupon', couponData);
        if (response.data.success) {
          toast.success('Coupon created successfully!');
        }
      }
      
      fetchCoupons();
      resetForm();
      setEditingId(null);
    } catch (error) {
      console.error(`Error ${editingId ? 'updating' : 'creating'} coupon:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to ${editingId ? 'update' : 'create'} coupon`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setFormData({
      code: coupon.code,
      discount: coupon.discount,
      validity: coupon.validity,
      type: coupon.type,
      usageLimit: coupon.usageLimit,
      // Remove minPurchaseAmount since it's not in the Coupon interface
    });
    setEditingId(coupon.id);
    // Scroll to the form header
    const formHeader = document.getElementById('coupon-form-header');
    if (formHeader) {
      formHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        const response: AxiosResponse<ApiResponse> = await api.delete(`/coupon/${id}`);
        if (response.data.success) {
          toast.success('Coupon deleted successfully!');
          fetchCoupons();
        }
      } catch (error) {
        console.error('Error deleting coupon:', error);
        toast.error('Failed to delete coupon');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discount: 0,
      validity: 30,
      type: 'percentage',
      usageLimit: undefined
      // Removed minPurchaseAmount since it's not in the Coupon interface
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 id="coupon-form-header" className="text-2xl font-bold mb-6 text-gray-800">
          {editingId ? 'Update Coupon' : 'Create New Coupon'}
        </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700">
            Coupon Code *
          </label>
          <input
            type="text"
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="discount" className="block text-sm font-medium text-gray-700">
              Discount Amount *
            </label>
            <div className="mt-1 relative">
              <input
                type="number"
                id="discount"
                name="discount"
                min="0"
                step="0.01"
                value={formData.discount}
                onChange={handleChange}
                className="block w-full pr-10 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="validity" className="block text-sm font-medium text-gray-700">
              Validity (days) *
            </label>
            <input
              type="number"
              id="validity"
              name="validity"
              min="1"
              value={formData.validity}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              required
            />
          </div>

          <div>
            <label htmlFor="usageLimit" className="block text-sm font-medium text-gray-700">
              Maximum Usage per User (leave empty for unlimited)
            </label>
            <input
              type="number"
              id="usageLimit"
              name="usageLimit"
              min="1"
              value={formData.usageLimit || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              required
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>


        </div>

        <div className="pt-2">
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : editingId ? 'Update Coupon' : 'Create Coupon'}
          </button>
        </div>
      </form>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">All Coupons</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{coupon.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{coupon.discount}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <p className="text-sm text-gray-500">
                      <span className="text-gray-900 font-medium">Validity:</span> {coupon.validity} days
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="text-gray-900 font-medium">Usage Limit:</span> {coupon.usageLimit || 'Unlimited'}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="text-gray-900 font-medium">Times Used:</span> {coupon.timesUsed || 0}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(coupon)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No coupons found. Create your first coupon above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}