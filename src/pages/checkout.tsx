// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import Cookies from 'js-cookie';
// import { api } from '../api/route';
// import { useAuth } from '../contexts/AuthContext';
// interface PaymentResponse {
//   redirectUrl?: string;
//   data?: {
//     redirectUrl?: string;
//     [key: string]: any;
//   };
//   [key: string]: any;
// }

// interface Address {
//   id: string;
//   street: string;
//   city: string;
//   state: string;
//   zipCode: string;
//   isDefault: boolean;
//   country?: string;
//   phoneNumber?: string;
//   fullName?: string;
//   // Add any other fields that your backend might return
// }

// interface CartItem {
//   id: string;
//   name: string;
//   price: number;
//   quantity: number;
//   image: string;
// }

// const CheckoutPage = () => {
//   const navigate = useNavigate();
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [addresses, setAddresses] = useState<Address[]>([]);
//   const [selectedAddress, setSelectedAddress] = useState<string>('');
//   const [showNewAddressForm, setShowNewAddressForm] = useState(false);
//   const [cartItems, setCartItems] = useState<CartItem[]>([]);
//   const [currentProduct, setCurrentProduct] = useState<any | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [newAddress, setNewAddress] = useState({
//     fullName: '',
//     street: '',
//     city: '',
//     state: '',
//     zipCode: '',
//     country: 'India',
//     phoneNumber: '',
//     isDefault: false,
//   });
//   const {user} = useAuth();

//   // Check if user is logged in and fetch data
//   useEffect(() => {
//     const token = Cookies.get('token');
//     const isLoggedIn = !!token;
//     setIsLoggedIn(isLoggedIn);
    
//     // Try to load cart items from localStorage first
//     const loadCartItems = () => {
//       try {
//         // Check for items from Buy Now flow
//         const buyNowItems = localStorage.getItem('checkoutItems');
        
//         if (buyNowItems) {
//           const items = JSON.parse(buyNowItems);
//           setCurrentProduct(items);
//           // Keep the items in localStorage in case of page refresh
//           localStorage.setItem('checkoutCart', buyNowItems);
//           localStorage.removeItem('checkoutItems');
//           return true;
//         }
        
//         // Check for existing cart in localStorage
//         const savedCart = localStorage.getItem('checkoutCart');
//         if (savedCart) {
//           setCurrentProduct(JSON.parse(savedCart));
//           return true;
//         }
        
//         return false;
//       } catch (error) {
//         console.error('Error loading cart from localStorage:', error);
//         return false;
//       }
//     };
    
//     const initializeCheckout = async () => {
//       const hasLocalCart = loadCartItems();
      
//       if (isLoggedIn) {
//         try {
//           // Always try to sync with server if logged in
//           await fetchCartItems();
//         } catch (error) {
//           console.error('Error fetching cart from server:', error);
//           // If we have local cart but server fetch fails, continue with local cart
//           if (!hasLocalCart) {
//             toast.error('Failed to load cart from server');
//           }
//         }
//         fetchAddresses();
//       } else if (!hasLocalCart) {
//         // No local cart and not logged in
//         toast.info('Your cart is empty');
//         navigate('/');
//       }
      
//       setIsLoading(false);
//     };
    
//     initializeCheckout();
    
//     // Cleanup function
//     return () => {
//       // Only clear temporary items if not in payment flow
//       if (!window.location.href.includes('payment')) {
//         localStorage.removeItem('checkoutItems');
//       }
//     };
//   }, []);
  
//   // Save cart items to localStorage whenever they change
//   useEffect(() => {
//     if (currentProduct.length > 0) {
//       localStorage.setItem('checkoutCart', JSON.stringify(currentProduct));
//     } else {
//       localStorage.removeItem('checkoutCart');
//     }
//   }, [currentProduct]);

//   // const fetchCartItems = async () => {
//   //   try {
//   //     const data = await api.get(`/cart/user/${user?.id}`) as { success: boolean; data: {cartItems: any[]} };
//   //     const cartItems = data.cartItems;
//   //     // Transform API response to match our CartItem interface
//   //     const items = (cartItems || []).map((item: any) => ({
//   //       id: item.productId || item.id,
//   //       name: item.name || item.product?.name || 'Product',
//   //       price: item.price || item.product?.price || 0,
//   //       quantity: item.quantity || 1,
//   //       image: item.image || item.product?.imageUrl || '/placeholder-product.jpg'
//   //     }));
//   //     setCartItems(items);
//   //   } catch (error) {
//   //     console.error('Error fetching cart items:', error);
//   //     toast.error('Failed to load cart items');
//   //   } finally {
//   //     setIsLoading(false);
//   //   }
//   // };

//   const fetchAddresses = async () => {
//     setIsLoading(true);
//     try {
//       // Get the current user ID from your auth context or token
//       const userId = 1; // Replace with actual user ID from your auth context
      
//       const responseData = await api.get(`/address/${userId}`) as { data: any[] ,credentials: 'include' };
      
//       // Check if the response has a data property with the addresses
//       const addressesData = responseData.data || [];
      
//       if (!Array.isArray(addressesData)) {
//         throw new Error('Invalid addresses data format');
//       }
      
//       // Map the backend fields to our frontend Address interface
//       const formattedAddresses = addressesData.map((addr: any) => ({
//         id: addr.id.toString(),
//         street: addr.addressLine1,
//         city: addr.city,
//         state: addr.state,
//         zipCode: addr.zipCode,
//         country: addr.country,
//         phoneNumber: addr.phoneNumber,
//         fullName: addr.fullName || '',
//         isDefault: false, // Set this based on your backend if available
//       }));
      
//       setAddresses(formattedAddresses);
      
//       // Select the first address by default if none selected
//       if (formattedAddresses.length > 0 && !selectedAddress) {
//         setSelectedAddress(formattedAddresses[0].id);
//       }
      
//     } catch (error) {
//       console.error('Error fetching addresses:', error);
//       toast.error('Failed to load addresses');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleAddressSelect = (addressId: string) => {
//     setSelectedAddress(addressId);
//   };

//   const handleNewAddressSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const toastId = toast.loading('Adding address...');
    
//     try {
//       // Prepare the address data according to the backend's expected format
//       const addressData = {
//         addressLine1: newAddress.street,
//         addressLine2: '',
//         city: newAddress.city,
//         state: newAddress.state,
//         zipCode: newAddress.zipCode,
//         country: newAddress.country || 'India',
//         phoneNumber: newAddress.phoneNumber,
//         fullName: newAddress.fullName,
//       };

//       await api.post('/address', addressData);

//       // Reset form and fetch updated addresses
//       setShowNewAddressForm(false);
//       setNewAddress({
//         fullName: '',
//         street: '',
//         city: '',
//         state: '',
//         zipCode: '',
//         country: 'India',
//         phoneNumber: '',
//         isDefault: false,
//       });
      
//       // Fetch updated addresses
//       await fetchAddresses();
      
//       toast.update(toastId, {
//         render: 'Address added successfully',
//         type: 'success',
//         isLoading: false,
//         autoClose: 3000,
//       });
//     } catch (error) {
//       console.error('Error adding address:', error);
//       toast.update(toastId, {
//         render: error instanceof Error ? error.message : 'Failed to add address',
//         type: 'error',
//         isLoading: false,
//         autoClose: 3000,
//       });
//     }
//   };

//   const calculateTotal = () => {
//     return cartItems.reduce(
//       (total, item) => total + item.price * item.quantity,
//       0
//     );
//   };

//   const handleProceedToPayment = async () => {
//     if (!selectedAddress) {
//       toast.error('Please select a delivery address');
//       return;
//     }

//     const toastId = toast.loading('Processing your order...');
    
//     try {
//       // Create the order first
//       const orderData = {
//         orderDate: new Date().toISOString(),
//         totalAmount: calculateTotal(),
//         status: 'Pending',
//         billingAddress: selectedAddress,
//         shippingAddress: selectedAddress,
//         items: cartItems.map(item => ({
//           productId: item.id,
//           quantity: item.quantity,
//           price: item.price,
//         })),
//       };

//       // Create order
//       const orderResponseData = await api.post('/order', orderData) as { data?: { id: string } };
//       console.log("Order created:", orderResponseData);
      
//       const orderId = orderResponseData.data?.id;
//       if (!orderId) {
//         throw new Error('No order ID received from server');
//       }

//       // For each product in cart, create a payment
//       for (const item of cartItems) {
//         const paymentData = {
//           orderId: orderId,
//           productId: Number(item.id), // Ensure productId is a number
//           phonepe_transactionId: "",
//           status: "",
//           amount: 1, // Using fixed amount as in the working example
//           redirectUrl: "",
//           validity: 10
//         };

//         try {
//           console.log("Payment data:", paymentData);
//           const paymentResponseData = await api.post<PaymentResponse>('/payments/create-order-product', paymentData);
//           console.log("Payment response:", paymentResponseData);
          
//           const redirectUrl = paymentResponseData.redirectUrl || paymentResponseData.data?.redirectUrl;
          
//           if (redirectUrl) {
//             toast.update(toastId, {
//               render: 'Redirecting to payment...',
//               type: 'success',
//               isLoading: false,
//               autoClose: 2000,
//             });
//             window.location.href = redirectUrl;
//             return; // Exit after first successful payment creation
//           }
//         } catch (error) {
//           console.error('Error processing payment:', error);
//           toast.update(toastId, {
//             render: 'Error processing payment. Please try again.',
//             type: 'error',
//             isLoading: false,
//             autoClose: 3000,
//           });
//           throw error; // Re-throw to be caught by the outer catch block
//         }
//       }
      
//       throw new Error('No redirect URL received from payment service');
      
//     } catch (error) {
//       console.error('Error during checkout:', error);
//       toast.update(toastId, {
//         render: error instanceof Error ? error.message : 'Failed to process your order. Please try again.',
//         type: 'error',
//         isLoading: false,
//         autoClose: 3000,
//       });
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   if (!isLoggedIn) {
//     return (
//       <div className="max-w-4xl mx-auto p-6">
//         <div className="bg-white rounded-lg shadow-md p-6 text-center">
//           <h2 className="text-2xl font-bold mb-4">Please Login to Continue</h2>
//           <p className="mb-6">You need to be logged in to proceed with checkout.</p>
//           <button
//             onClick={() => navigate('/login')}
//             className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
//           >
//             Go to Login
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-6xl mx-auto p-4 md:p-6">
//       <h1 className="text-2xl md:text-3xl font-bold mb-6">Checkout</h1>
      
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Left Column - Delivery Address */}
//         <div className="lg:col-span-2 space-y-6">
//           <div className="bg-white rounded-lg shadow-md p-6">
//             <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
            
//             {addresses.length > 0 && (
//               <div className="mb-6">
//                 <h3 className="font-medium mb-3">Select a saved address</h3>
//                 <div className="space-y-3">
//                   {addresses.map((address) => (
//                     <div 
//                       key={address.id}
//                       className={`border rounded-md p-4 cursor-pointer transition-colors ${
//                         selectedAddress === address.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
//                       }`}
//                       onClick={() => handleAddressSelect(address.id)}
//                     >
//                       <div className="flex items-start">
//                         <input
//                           type="radio"
//                           checked={selectedAddress === address.id}
//                           onChange={() => handleAddressSelect(address.id)}
//                           className="mt-1 mr-3"
//                         />
//                         <div>
//                           {address.fullName && <p className="font-medium">{address.fullName}</p>}
//                           <p className="text-gray-600">{address.street}</p>
//                           <p className="text-gray-600">
//                             {address.city}, {address.state} {address.zipCode}
//                           </p>
//                           {address.country && <p className="text-gray-600">{address.country}</p>}
//                           {address.phoneNumber && <p className="text-gray-600">Phone: {address.phoneNumber}</p>}
//                           {address.isDefault && (
//                             <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-1">
//                               Default
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <button
//               onClick={() => setShowNewAddressForm(!showNewAddressForm)}
//               className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4"
//             >
//               {showNewAddressForm ? 'Cancel' : '+ Add a new address'}
//             </button>

//             {showNewAddressForm && (
//               <form onSubmit={handleNewAddressSubmit} className="mt-4 space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Full Name *
//                     </label>
//                     <input
//                       type="text"
//                       value={newAddress.fullName}
//                       onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Phone Number *
//                     </label>
//                     <input
//                       type="tel"
//                       value={newAddress.phoneNumber}
//                       onChange={(e) => setNewAddress({ ...newAddress, phoneNumber: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Street Address *
//                   </label>
//                   <input
//                     type="text"
//                     value={newAddress.street}
//                     onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     required
//                   />
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
//                     <input
//                       type="text"
//                       value={newAddress.city}
//                       onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
//                     <input
//                       type="text"
//                       value={newAddress.state}
//                       onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       ZIP Code *
//                     </label>
//                     <input
//                       type="text"
//                       value={newAddress.zipCode}
//                       onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Country *
//                     </label>
//                     <select
//                       value={newAddress.country}
//                       onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       required
//                     >
//                       <option value="India">India</option>
//                       <option value="United States">United States</option>
//                       <option value="United Kingdom">United Kingdom</option>
//                       {/* Add more countries as needed */}
//                     </select>
//                   </div>
//                 </div>

//                 <div className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id="defaultAddress"
//                     checked={newAddress.isDefault}
//                     onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
//                     className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                   />
//                   <label htmlFor="defaultAddress" className="ml-2 block text-sm text-gray-700">
//                     Set as default address
//                   </label>
//                 </div>

//                 <div className="flex justify-end space-x-3 pt-2">
//                   <button
//                     type="button"
//                     onClick={() => setShowNewAddressForm(false)}
//                     className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//                   >
//                     Save Address
//                   </button>
//                 </div>
//               </form>
//             )}
//           </div>

//           {/* Order Items */}
//           <div className="bg-white rounded-lg shadow-md p-6">
//             <h2 className="text-xl font-semibold mb-4">Order Items</h2>
//             {currentProduct.length === 0 ? (
//               <p className="text-gray-500">Your cart is empty</p>
//             ) : (
//               <div className="space-y-4">
//                 {currentProduct.map((item) => (
//                   <div key={item.id} className="flex items-center border-b pb-4">
//                     <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden mr-4">
//                       <img
//                         src={item.image || '/placeholder-product.jpg'}
//                         alt={item.name}
//                         className="w-full h-full object-cover"
//                       />
//                     </div>
//                     <div className="flex-1">
//                       <h3 className="font-medium">{item.name}</h3>
//                       <p className="text-gray-600">Qty: {item.quantity}</p>
//                     </div>
//                     <div className="text-right">
//                       <p className="font-medium">${item.price.toFixed(2)}</p>
//                       <p className="text-sm text-gray-500">${(item.price * item.quantity).toFixed(2)}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Right Column - Order Summary */}
//         <div className="lg:col-span-1">
//           <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
//             <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
//             <div className="space-y-3 mb-6">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Subtotal</span>
//                 <span>${calculateTotal().toFixed(2)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Shipping</span>
//                 <span>Free</span>
//               </div>
//               <div className="border-t border-gray-200 my-2"></div>
//               <div className="flex justify-between text-lg font-semibold">
//                 <span>Total</span>
//                 <span>${calculateTotal().toFixed(2)}</span>
//               </div>
//             </div>

//             <button
//               onClick={handleProceedToPayment}
//               disabled={!selectedAddress || cartItems.length === 0}
//               className={`w-full py-3 px-4 rounded-md text-white font-medium ${
//                 !selectedAddress || cartItems.length === 0
//                   ? 'bg-gray-400 cursor-not-allowed'
//                   : 'bg-blue-600 hover:bg-blue-700'
//               } transition-colors`}
//             >
//               Proceed to Payment
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CheckoutPage;
