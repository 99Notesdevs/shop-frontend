import React, { useState, useEffect, type ChangeEvent, type FormEvent, useCallback } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { env } from "../config/env";
import { api } from "../api/route";

interface Address {
  id: number;  // Optional since it might not be needed in all contexts
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber: string;
  isDefault?: boolean;  // Optional since it might not be needed in all contexts
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  stock?: number;
  imageUrl?: string;
  shippingCharge?: number;
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
    salePrice?: number;
    images?: string;
    shippingCharge?: number;
  };
}
interface CartData {
  id: number;
  userId: number;
  totalAmount: number;
  shippingCharge?: number;
  couponDiscount?: number;
  couponCode?: string;
  createdAt: string;
  updatedAt: string;
  cartItems: CartItem[];
}
interface LocationState {
  orderData: OrderData;
  cartData?: CartData;
  product?: Product & { quantity: number };
}

const emptyAddress: Address = {
  id: 0,
  name: "",
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
  const state = location.state as LocationState | undefined;

  // Redirect to home if invalid access
  // useEffect(() => {
  //   if (!state || !state.orderData || !state.product) {
  //     toast.error("Invalid access. Please select a product first.");
  //     navigate("/", { replace: true });
  //   }
  // }, [state, navigate]);

  // const orderData = state?.orderData;
  const cartData = state?.cartData;
  const product = state?.product;
  console.log("product",product);

  // Address states
  const [deliveryAddress, setDeliveryAddress] = useState<Address>(emptyAddress);
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address| null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  
  // Validation error state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Clear coupon when product changes
  useEffect(() => {
    // Clear any existing coupon when product changes
    if (product) {
      setAppliedCoupon('');
      setCouponDiscount(0);
      setCouponCode('');
      localStorage.removeItem('appliedCoupon');
    }
  }, [product?.id]); // Trigger when product ID changes

  // Restore applied coupon from localStorage if it was applied on cart page
  useEffect(() => {
    // Only restore coupon if we're in cart checkout mode (not direct product purchase)
    if (!product) {
      try {
        const savedCouponRaw = localStorage.getItem('appliedCoupon');
        if (savedCouponRaw) {
          const saved = JSON.parse(savedCouponRaw) as { code?: string; discount?: number };
          if (saved?.code) {
            setAppliedCoupon(saved.code);
            setCouponDiscount(saved.discount || 0);
          }
        }
      } catch {
        // ignore JSON parse errors
      }
    }
  }, [product]);

  // Fetch user addresses
  const fetchUserAddresses = useCallback(async () => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('Please login to view saved addresses');
        return;
      }
      
      const response = await api.get<{ data: Address[] }>(`/address`);
      setUserAddresses(response.data);
      
      // Select default address if available
      const defaultAddress = response.data.find(addr => addr.isDefault);
      if (defaultAddress) {
        setDeliveryAddress(defaultAddress);
        setSelectedAddress(defaultAddress);
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
  const handleAddressSelect = (address:Address) => {
    setDeliveryAddress(address);
    setSelectedAddress(address);
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

    if (!address.name?.trim()) newErrors.name = "Name is required.";
    if (!address.addressLine1?.trim()) newErrors.addressLine1 = "Address Line 1 is required.";
    if (!address.city?.trim()) newErrors.city = "City is required.";
    if (!address.state?.trim()) newErrors.state = "State is required.";
    if (!address.zipCode?.trim()) newErrors.zipCode = "Postal Code is required.";
    if (!address.country?.trim()) newErrors.country = "Country is required.";
    if (!address.phoneNumber?.trim()) {
      newErrors.phoneNumber = "Phone number is required.";
    } else if (!/^\+?[0-9\- ]{7,15}$/.test(address.phoneNumber)) {
      newErrors.phoneNumber = "Phone number format is invalid.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save a new address
  const saveNewAddress = async (address: Omit<Address, 'id' | 'isDefault'>) => {
    try {
      setIsAddingAddress(true);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('Please login to save address');
        return false;
      }

      // Prepare the address data in the format expected by the backend
      const addressData = {
        name: address.name,
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

      const response = await api.post<{ data: Address }>('/address', addressData);
      
      // Refresh the addresses list
      await fetchUserAddresses();
      
      // Select the newly added address
      setDeliveryAddress(response.data);
      setSelectedAddress(response.data);
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
  // Apply coupon function
  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    // Calculate subtotal first
    const currentSubtotal = cartData 
      ? cartData.cartItems.reduce((sum, item) => {
          const price = item.product?.salePrice ?? item.product?.price ?? 0;
          return sum + (price * item.quantity);
        }, 0)
      : product
      ? (product.salePrice || product.price) * (product.quantity || 1)
      : 0;

    // Calculate shipping
    const currentShipping = calculateShipping();
    const totalWithShipping = currentSubtotal + currentShipping;
    
    const response = await api.post(`/coupon/use/${couponCode}`, {
      totalAmount: totalWithShipping,
    }) as { success: boolean; data: any };
    
    if (response.success) {
      const { discount, type: discountType } = response.data;
      let discountAmount = 0;
      
      // Apply discount to the total (subtotal + shipping)
      if (discountType === 'percentage') {
        discountAmount = (totalWithShipping * discount) / 100;
      } else {
        discountAmount = Math.min(discount, totalWithShipping); // Ensure discount doesn't exceed total
      }
      
      setCouponDiscount(discountAmount);
      setAppliedCoupon(response.data.code);
      setCouponCode('');

      // Persist coupon across pages
      localStorage.setItem('appliedCoupon', JSON.stringify({
        code: response.data.code,
        discount: discountAmount,
      }));
      
      toast.success('Coupon applied successfully!');
    } else {
      toast.error('Failed to apply coupon');
    }
  };

  // Remove coupon function
  const removeCoupon = async () => {
    if (appliedCoupon) {
      await api.post(`/coupon/remove/${appliedCoupon}`);
    }
    setAppliedCoupon('');
    setCouponDiscount(0);
    localStorage.removeItem('appliedCoupon');
  };

  // Calculate subtotal
  const subtotal = cartData 
    ? cartData.cartItems.reduce((sum, item) => {
        const price = item.product?.salePrice ?? item.product?.price ?? 0;
        return sum + (price * item.quantity);
      }, 0)
    : product
    ? (product.salePrice || product.price) * (product.quantity || 1)
    : 0;

  // Calculate shipping charge
  const calculateShipping = () => {
    if (cartData) {
      // If cartData has shippingCharge, use it (passed from cart page)
      if (cartData.shippingCharge !== undefined) {
        return cartData.shippingCharge;
      }
      
      // Otherwise calculate it like in the cart page
      const maxShippingCharge = cartData.cartItems.length > 0 
        ? Math.max(...cartData.cartItems.map(item => item.product?.shippingCharge ?? 0).filter(charge => charge > 0))
        : 0;
      
      return subtotal >= 499 ? 0 : (maxShippingCharge > 0 ? maxShippingCharge : 50);
    } else if (product) {
      // For single product checkout
      const productShipping = product.shippingCharge || 50; // Default to 50 if not specified
      return subtotal >= 499 ? 0 : productShipping * (product.quantity || 1);
    }
    return 0;
  };

  const shipping = calculateShipping();
  // Apply coupon discount to (subtotal + shipping)
  const displayTotal = Math.max(0, (subtotal + shipping) - (couponDiscount || 0));
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
    if (!selectedAddress && userAddresses.length > 0) {
      toast.error("Please select a delivery address");
      return;
    }

    // Handle direct product purchase (from product page)
    if (location.state?.orderData && location.state?.product) {
      try {
        const { orderData: existingOrder } = location.state;
        
        const finalOrder = {
          ...existingOrder,
          amount: subtotal + shipping,
          deliveryAddress: {
            id: selectedAddress?.id || 0,
            name: selectedAddress?.name || "",
            addressLine1: selectedAddress?.addressLine1 || "",
            addressLine2: selectedAddress?.addressLine2 || '',
            city: selectedAddress?.city || "",
            state: selectedAddress?.state || "",
            zipCode: selectedAddress?.zipCode || "",
            country: selectedAddress?.country || "",
            phoneNumber: selectedAddress?.phoneNumber || ""
          },
          status: "Confirmed",
          couponcode: appliedCoupon ? appliedCoupon : null
        };

        console.log("Final order for direct purchase:", finalOrder);
        
        const res = await fetch(`${env.API}/payment/create-order-product`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalOrder),
        });

        if (!res.ok) throw new Error("Order completion failed");
        
        const respData = await res.json();
        console.log("Payment response:", respData);
        
        // Create shipping details with default status 'Processing'
        if (location.state?.orderData.orderId) {
          try {
            const shippingResponse = await fetch(`${env.API}/shipping/${location.state.orderData.orderId}`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                shippingAddress: {
                  name: selectedAddress?.name || '',
                  addressLine1: selectedAddress?.addressLine1 || '',
                  addressLine2: selectedAddress?.addressLine2 || '',
                  city: selectedAddress?.city || '',
                  state: selectedAddress?.state || '',
                  zipCode: selectedAddress?.zipCode || '',
                  country: selectedAddress?.country || '',
                  phoneNumber: selectedAddress?.phoneNumber || ''
                },
                trackingNumber: 'N/A',
                carrier: 'N/A',
                status: 'Processing',
                shippingDate: new Date().toISOString()
              })
            });

            if (!shippingResponse.ok) {
              throw new Error('Failed to create shipping details');
            }
            console.log('Shipping details created successfully');
          } catch (error) {
            console.error('Error creating shipping details:', error);
            // Continue with the payment flow even if shipping details creation fails
          }
        }
        
        // Redirect to payment URL

        if (respData.data) {
          window.location.href = respData.data;
        } else {
          throw new Error('Payment URL not found in response');
        }
        
      } catch (error) {
        console.error('Error processing direct purchase:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to process payment');
      }
      return;
    }

    // Handle cart purchase flow
    if (!cartData) {
      toast.error("Cart data missing.");
      return;
    }

    try {
      const data = {
        orderDate: new Date().toISOString(),
        products: cartData.cartItems.map((item: CartItem) => ({
          productId: item.productId,
          product: item.product,
          quantity: item.quantity,
          price: item.product?.price,

        })),
        totalAmount: Math.max(0, (subtotal + shipping) - (couponDiscount || 0)),
        status: "Pending",
        billingAddressId: selectedAddress?.id,
        shippingAddressId: selectedAddress?.id,
      };
      
      console.log("Order data:", data);
      const response = await api.post<{ success: boolean; data: any }>(`/order`, data);
      const orderforshipping=response.data.id;
      if (!response.success) {
        toast.error('Failed to create order');
        return;
      }
      
      console.log("Order response:", response);
      const responseData = response.data;
      const orderId = responseData.id;
      
      const orderData = {
        orderId,
        phonepe_transactionId: "",
        status: "",
        validity: 10,
      };
      
      const finalOrder = {
        ...orderData,
        deliveryAddress: {
          id: selectedAddress?.id || 0,
          name: selectedAddress?.name || "",
          addressLine1: selectedAddress?.addressLine1 || "",
          addressLine2: selectedAddress?.addressLine2 || '',
          city: selectedAddress?.city || "",
          state: selectedAddress?.state || "",
          zipCode: selectedAddress?.zipCode || "",
          country: selectedAddress?.country || "",
          phoneNumber: selectedAddress?.phoneNumber || ""
        },
        status: "Confirmed",
        couponcode: appliedCoupon ? appliedCoupon : null
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
      console.log("respData", respData);
      
      // Create shipping details with default status 'Processing'
      if (orderforshipping) {
        try {
          const shippingAdress = JSON.stringify({
            name: selectedAddress?.name || '',
            addressLine1: selectedAddress?.addressLine1 || '',
            addressLine2: selectedAddress?.addressLine2 || '',
            city: selectedAddress?.city || '',
            state: selectedAddress?.state || '',
            zipCode: selectedAddress?.zipCode || '',
            country: selectedAddress?.country || '',
            phoneNumber: selectedAddress?.phoneNumber || ''
          })
          const shippingResponse = await fetch(`${env.API}/shipping/${orderforshipping}`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              shippingAddress: shippingAdress,
              trackingNumber: '00000', // Will be updated when shipped
              carrier: 'N/A', // Will be updated when shipped
              status: 'Processing',
              shippingDate: new Date().toISOString()
            })
          });

          if (!shippingResponse.ok) {
            throw new Error('Failed to create shipping details');
          }
          console.log('Shipping details created successfully');
        } catch (error) {
          console.error('Error creating shipping details:', error);
          // Continue with the payment flow even if shipping details creation fails
          // The admin can add these details later
        }
      }
      
      window.location.href = respData.data;
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Order processing error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--heading)]">Checkout</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Delivery Address and Coupon */}
          <div className="lg:w-2/3 space-y-6">
            {/* Delivery Address Section */}
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
                        selectedAddress?.id === address.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start">
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddress?.id === address.id}
                          onChange={() => {}}
                          className="mt-1 mr-2"
                        />
                        <div>
                          <p className="font-medium">{address.name}</p>
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
                  { label: "Name", name: "name", required: true },
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
                      value={String(deliveryAddress[name as keyof Address] || "")}
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
                    className="w-full py-3 bg-[var(--button)] hover:bg-[var(--button-hover)] text-white font-semibold rounded-lg transition disabled:opacity-50 cursor-pointer"
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

            {/* Coupon Code - Moved from right column */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Have a coupon code?
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
                    value={appliedCoupon || couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={couponDiscount > 0}
                  />
                  {couponCode && !couponDiscount && (
                    <button 
                      onClick={() => setCouponCode('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {couponDiscount > 0 ? (
                  <button 
                    onClick={removeCoupon}
                    className="px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove Coupon
                  </button>
                ) : (
                  <button 
                    onClick={applyCoupon}
                    className="px-6 py-3 bg-[var(--button)] text-white font-medium rounded-lg hover:bg-[var(--button-hover)] transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Apply Coupon
                  </button>
                )}
              </div>
              {couponDiscount > 0 && (
                <p className="mt-3 text-sm text-green-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Coupon <span className="font-semibold mx-1">{appliedCoupon}</span> applied! ₹{couponDiscount.toFixed(2)} discount has been applied to your order.
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>               
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping > 0 ? `₹${shipping.toFixed(2)}` : 'Free'}
                  </span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-red-600">Coupon Discount</span>
                    <span className="text-red-600 font-medium">-₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-xl font-bold text-gray-900">
                      ₹{displayTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                onClick={handleSubmit}
                className={`w-full mt-6 py-3 px-4 rounded-lg font-medium text-white transition-all ${
                  selectedAddress 
                    ? 'bg-[var(--button)] hover:bg-[var(--button-hover)] cursor-pointer' 
                    : 'bg-gray-400 cursor-not-allowed opacity-70'
                }`}
              >
                {selectedAddress ? 'Proceed to Payment' : 'Select an address to continue'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;