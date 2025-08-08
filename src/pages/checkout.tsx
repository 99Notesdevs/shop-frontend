import React, { useState, useEffect, type ChangeEvent, type FormEvent, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { env } from "../config/env";
import { api } from "../api/route";

interface UserAddress {
  id: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber: string;
  isDefault: boolean;
}

interface Address {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock?: number;
  imageUrl?: string;
  category?: {
    id: number;
    name: string;
  };
}

interface OrderData {
  orderId: string;
  productId: number;
  phonepe_transactionId: string;
  status: string;
  amount: number;
  redirectUrl: string;
  validity: number;
  quantity: number;
}

interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: number;
    name: string;
    description: string;
    price: number;
    images?: Array<{ url: string }>;
  };
}
interface CartData {
  id: number;
  userId: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  cartItems: CartItem[];
}
interface LocationState {
  orderData: OrderData;
  cartData: CartData;
}

const emptyAddress: Address = {
  fullName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  phoneNumber: "",
};

const Checkout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as LocationState | undefined;

  // Redirect to home if invalid access
  // useEffect(() => {
  //   if (!state || !state.orderData || !state.product) {
  //     toast.error("Invalid access. Please select a product first.");
  //     navigate("/", { replace: true });
  //   }
  // }, [state, navigate]);

  const orderData = state?.orderData;
  const cartData = state?.cartData;

  // Address states
  const [deliveryAddress, setDeliveryAddress] = useState<Address>(emptyAddress);
  const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  
  // Validation error state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fetch user addresses
  const fetchUserAddresses = useCallback(async () => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('Please login to view saved addresses');
        return;
      }
      
      const response = await api.get<{ data: UserAddress[] }>(`/address/${userId}`);
      setUserAddresses(response.data);
      
      // Select default address if available
      const defaultAddress = response.data.find(addr => addr.isDefault);
      if (defaultAddress) {
        setDeliveryAddress(defaultAddress);
        setSelectedAddressId(defaultAddress.id);
      }
      
      // Show address form if no addresses exist
      if (response.data.length === 0) {
        setShowAddressForm(true);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load saved addresses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserAddresses();
  }, [fetchUserAddresses]);

  // Handle address selection
  const handleAddressSelect = (address: UserAddress) => {
    setDeliveryAddress(address);
    setSelectedAddressId(address.id);
    setShowAddressForm(false);
  };


  // Handle form input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDeliveryAddress(prev => ({ ...prev, [name]: value }));
  };

  // Validate an address, set errors if any, and return boolean
  const validateAddress = (address: Address): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!address.fullName.trim()) newErrors.fullName = "Full Name is required.";
    if (!address.addressLine1.trim()) newErrors.addressLine1 = "Address Line 1 is required.";
    if (!address.city.trim()) newErrors.city = "City is required.";
    if (!address.state.trim()) newErrors.state = "State is required.";
    if (!address.zipCode.trim()) newErrors.zipCode = "Postal Code is required.";
    if (!address.country.trim()) newErrors.country = "Country is required.";
    if (!address.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required.";
    } else if (!/^\+?[0-9\- ]{7,15}$/.test(address.phoneNumber)) {
      newErrors.phoneNumber = "Phone number format is invalid.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Save a new address
  const saveNewAddress = async (address: Omit<UserAddress, 'id' | 'isDefault'>) => {
    try {
      setIsAddingAddress(true);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('Please login to save address');
        return false;
      }

      // Prepare the address data in the format expected by the backend
      const addressData = {
        fullName: address.fullName,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || '',
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        phoneNumber: address.phoneNumber,
        isDefault: userAddresses.length === 0, // Set as default if first address
        userId: userId // Include userId in the request body
      };

      const response = await api.post<{ data: UserAddress }>('/address', addressData);
      
      // Refresh the addresses list
      await fetchUserAddresses();
      
      // Select the newly added address
      setDeliveryAddress(response.data);
      setSelectedAddressId(response.data.id);
      setShowAddressForm(false);
      
      toast.success('Address saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address');
      return false;
    } finally {
      setIsAddingAddress(false);
    }
  };

  // Submit handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // If showing address form, save the new address first
    if (showAddressForm) {
      const isAddressValid = validateAddress(deliveryAddress);
      if (!isAddressValid) {
        toast.error("Please correct the errors in the form.");
        return;
      }
      
      const saved = await saveNewAddress(deliveryAddress as any);
      if (!saved) return;
      return; // Stop here, will continue after address is saved
    }

    // If no address is selected but there are addresses available
    if (!selectedAddressId && userAddresses.length > 0) {
      toast.error("Please select a delivery address");
      return;
    }

    if (!orderData) {
      toast.error("Order details missing.");
      return;
    }

    try {
      const finalOrder = {
        ...orderData,
        deliveryAddress,
        status: "Confirmed",
      };
      console.log("finalOrder",finalOrder);
      const res = await fetch(`${env.API}/payment/create-order-product`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalOrder),
      });

      if (!res.ok) throw new Error("Order completion failed");
      console.log("res",res);
      const respData = await res.json();
      console.log("respData",respData);
      window.location.href = respData.data;
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Order processing error");
    }
  };

  if (!orderData) return null;

  const calculateTotal = () => orderData ? orderData.amount : 0;
  const total = calculateTotal(); // Use the function to fix the lint warning

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--heading)]">Checkout</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Delivery Address */}
          <div className="lg:w-2/3">
            <form onSubmit={handleSubmit} noValidate className="space-y-8">
        {!showAddressForm && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Select Delivery Address</h2>
              <button
                type="button"
                onClick={() => setShowAddressForm(true)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Add New Address
              </button>
            </div>

          {!showAddressForm && userAddresses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {userAddresses.map((address) => (
                <div
                  key={address.id}
                  onClick={() => handleAddressSelect(address)}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedAddressId === address.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === address.id}
                      onChange={() => {}}
                      className="mt-1 mr-2"
                    />
                    <div>
                      <p className="font-medium">{address.fullName}</p>
                      <p className="text-gray-700">{address.addressLine1}</p>
                      {address.addressLine2 && (
                        <p className="text-gray-700">{address.addressLine2}</p>
                      )}
                      <p className="text-gray-700">
                        {address.city}, {address.state} {address.zipCode}
                      </p>
                      <p className="text-gray-700">{address.country}</p>
                      <p className="text-gray-700 mt-1">Phone: {address.phoneNumber}</p>
                      {address.isDefault && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded mt-1">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!showAddressForm && userAddresses.length === 0 && !isLoading && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    No saved addresses found. Please add a new delivery address.
                  </p>
                </div>
              </div>
            </div>
          )}
          </section>
        )}

        {/* Delivery Address Form */}
        {showAddressForm && (
          <section>
          <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { label: "Full Name", name: "fullName", required: true },
              { label: "Address Line 1", name: "addressLine1", required: true },
              { label: "Address Line 2", name: "addressLine2", required: false },
              { label: "City", name: "city", required: true },
              { label: "State", name: "state", required: true },
              { label: "Postal Code", name: "zipCode", required: true },
              { label: "Country", name: "country", required: true },
              { label: "Phone Number", name: "phoneNumber", required: true, type: "tel" },
            ].map(({ label, name, required, type }) => (
              <div key={`delivery-${name}`} className="flex flex-col">
                <label htmlFor={`delivery-${name}`} className="mb-1 font-medium">
                  {label}
                  {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  id={`delivery-${name}`}
                  name={name}
                  type={type || "text"}
                  value={deliveryAddress[name as keyof Address] || ""}
                  onChange={handleInputChange}
                  className={`border rounded px-3 py-2 focus:outline-none focus:ring ${
                    errors[name] ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-blue-300"
                  }`}
                  required={required}
                />
                {errors[name] && (
                  <span className="mt-1 text-xs text-red-600">{errors[name]}</span>
                )}
              </div>
            ))}
          </div>
          
          {/* Save Address Button - Only shown when adding/editing address */}
          {showAddressForm && (
            <div className="mt-6">
              <button
                type="submit"
                className="w-full py-3 bg-[var(--button)] hover:bg-[var(--button-hover)] text-white font-semibold rounded-lg transition disabled:opacity-50"
                disabled={isAddingAddress}
              >
                {isAddingAddress ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : 'Save Address'}
              </button>
            </div>
          )}
        </section>
        )}
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white shadow rounded-lg p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              {cartData?.cartItems && cartData.cartItems.length > 0 ? (
              <div className="space-y-6">
                <h3 className="font-semibold">Your Items ({cartData.cartItems.length})</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {cartData.cartItems.map((item) => (
                    <div key={item.id} className="flex items-start justify-between border-b pb-4">
                      <div className="flex space-x-4">
                        {item.product?.images?.[0]?.url ? (
                          <img 
                            src={item.product.images[0].url} 
                            alt={item.product.name}
                            className="w-20 h-20 object-cover rounded"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium">{item.product?.name || 'Product not found'}</h4>
                          <p className="text-gray-600">Qty: {item.quantity}</p>
                          <p className="text-gray-800 font-medium">
                            ₹{item.product ? (item.product.price * item.quantity).toFixed(2) : '0.00'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
    
    <div className="border-t pt-4 space-y-3">
      <div className="flex justify-between text-lg">
        <span className="font-medium">Subtotal</span>
        <span>₹{cartData.totalAmount?.toFixed(2) || '0.00'}</span>
      </div>
      <div className="flex justify-between text-lg font-semibold">
        <span>Total</span>
        <span>₹{cartData.totalAmount?.toFixed(2) || '0.00'}</span>
      </div>
    </div>

    <button
      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
      type="submit"
      onClick={handleSubmit}
      disabled={!selectedAddressId}
    >
      Proceed to Payment
    </button>
  </div>
) : (
  <p className="text-gray-500">Your cart is empty</p>
)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;