// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import { env } from '../config/env';
// import { toast } from 'react-toastify';
// import { loadStripe } from '@stripe/stripe-js';
// import axios from 'axios';

// const stripePromise = loadStripe(env.VITE_STRIPE_PUBLIC_KEY);

// interface FormData {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   address: string;
//   city: string;
//   state: string;
//   zipCode: string;
//   paymentMethod: 'credit_card' | 'paypal' | 'phonepe' | '';
//   saveInfo: boolean;
// }

// export default function CheckoutPage() {
//   const { user: currentUser, cart, clearCart } = useAuth();
//   const navigate = useNavigate();
//   const [isLoading, setIsLoading] = useState(false);
//   const [formData, setFormData] = useState<FormData>({
//     firstName: currentUser?.firstName || '',
//     lastName: currentUser?.lastName || '',
//     email: currentUser?.email || '',
//     phone: currentUser?.phone || '',
//     address: currentUser?.address || '',
//     city: currentUser?.city || '',
//     state: currentUser?.state || '',
//     zipCode: currentUser?.zipCode || '',
//     paymentMethod: '',
//     saveInfo: true
//   });

//   const [errors, setErrors] = useState<Partial<FormData>>({});

//   useEffect(() => {
//     if (!currentUser) {
//       navigate('/login', { state: { from: '/checkout' } });
//       return;
//     }

//     if (!cart || cart.items.length === 0) {
//       navigate('/cart');
//     }
//   }, [currentUser, cart, navigate]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value, type } = e.target;
//     const target = e.target as HTMLInputElement;
//     const newValue = type === 'checkbox' ? target.checked : value;
    
//     setFormData(prev => ({
//       ...prev,
//       [name]: newValue
//     }));

//     // Clear error when user starts typing
//     if (errors[name as keyof typeof errors]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: undefined
//       }));
//     }
//   };

//   const validateForm = (): boolean => {
//     const newErrors: Partial<FormData> = {};
    
//     if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
//     if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
//     if (!formData.email.trim()) {
//       newErrors.email = 'Email is required';
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = 'Email is invalid';
//     }
//     if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
//     if (!formData.address.trim()) newErrors.address = 'Address is required';
//     if (!formData.city.trim()) newErrors.city = 'City is required';
//     if (!formData.state.trim()) newErrors.state = 'State is required';
//     if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
//     if (!formData.paymentMethod) newErrors.paymentMethod = 'Please select a payment method';

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const calculateTotal = () => {
//     if (!cart) return 0;
//     return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!validateForm()) return;
//     if (!cart || cart.items.length === 0) {
//       toast.error('Your cart is empty');
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const orderData = {
//         userId: currentUser?.id,
//         items: cart.items,
//         total: calculateTotal(),
//         shippingAddress: {
//           address: formData.address,
//           city: formData.city,
//           state: formData.state,
//           zipCode: formData.zipCode,
//         },
//         paymentMethod: formData.paymentMethod,
//       };

//       // Save order and process payment
//       const response = await axios.post(`${env.VITE_API_URL}/api/orders`, orderData, {
//         headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
//       });

//       if (response.data.paymentUrl) {
//         // Redirect to payment gateway
//         window.location.href = response.data.paymentUrl;
//       } else {
//         // Payment processed successfully
//         toast.success('Order placed successfully!');
//         clearCart();
//         navigate('/orders');
//       }
//     } catch (error: any) {
//       console.error('Checkout error:', error);
//       toast.error(error.response?.data?.message || 'Failed to process order');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (!currentUser || !cart) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto">
//         <div className="md:grid md:grid-cols-3 md:gap-6">
//           <div className="md:col-span-2">
//             <div className="bg-white shadow rounded-lg p-6 mb-6">
//               <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Information</h2>
              
//               <form onSubmit={handleSubmit}>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                   <div>
//                     <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
//                       First Name *
//                     </label>
//                     <input
//                       type="text"
//                       id="firstName"
//                       name="firstName"
//                       value={formData.firstName}
//                       onChange={handleChange}
//                       className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.firstName ? 'border-red-500' : ''}`}
//                     />
//                     {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
//                   </div>
//                   <div>
//                     <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
//                       Last Name *
//                     </label>
//                     <input
//                       type="text"
//                       id="lastName"
//                       name="lastName"
//                       value={formData.lastName}
//                       onChange={handleChange}
//                       className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.lastName ? 'border-red-500' : ''}`}
//                     />
//                     {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
//                   </div>
//                 </div>

//                 <div className="mb-4">
//                   <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//                     Email Address *
//                   </label>
//                   <input
//                     type="email"
//                     id="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.email ? 'border-red-500' : ''}`}
//                   />
//                   {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
//                 </div>

//                 <div className="mb-4">
//                   <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
//                     Phone Number *
//                   </label>
//                   <input
//                     type="tel"
//                     id="phone"
//                     name="phone"
//                     value={formData.phone}
//                     onChange={handleChange}
//                     className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.phone ? 'border-red-500' : ''}`}
//                   />
//                   {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
//                 </div>

//                 <div className="mb-4">
//                   <label htmlFor="address" className="block text-sm font-medium text-gray-700">
//                     Street Address *
//                   </label>
//                   <input
//                     type="text"
//                     id="address"
//                     name="address"
//                     value={formData.address}
//                     onChange={handleChange}
//                     className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.address ? 'border-red-500' : ''}`}
//                   />
//                   {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//                   <div>
//                     <label htmlFor="city" className="block text-sm font-medium text-gray-700">
//                       City *
//                     </label>
//                     <input
//                       type="text"
//                       id="city"
//                       name="city"
//                       value={formData.city}
//                       onChange={handleChange}
//                       className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.city ? 'border-red-500' : ''}`}
//                     />
//                     {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
//                   </div>
//                   <div>
//                     <label htmlFor="state" className="block text-sm font-medium text-gray-700">
//                       State/Province *
//                     </label>
//                     <input
//                       type="text"
//                       id="state"
//                       name="state"
//                       value={formData.state}
//                       onChange={handleChange}
//                       className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.state ? 'border-red-500' : ''}`}
//                     />
//                     {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
//                   </div>
//                   <div>
//                     <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
//                       ZIP/Postal Code *
//                     </label>
//                     <input
//                       type="text"
//                       id="zipCode"
//                       name="zipCode"
//                       value={formData.zipCode}
//                       onChange={handleChange}
//                       className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.zipCode ? 'border-red-500' : ''}`}
//                     />
//                     {errors.zipCode && <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>}
//                   </div>
//                 </div>

//                 <div className="border-t border-gray-200 pt-6">
//                   <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h2>
                  
//                   <div className="space-y-4">
//                     <div className="flex items-center">
//                       <input
//                         id="credit_card"
//                         name="paymentMethod"
//                         type="radio"
//                         value="credit_card"
//                         checked={formData.paymentMethod === 'credit_card'}
//                         onChange={handleChange}
//                         className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
//                       />
//                       <label htmlFor="credit_card" className="ml-3 block text-sm font-medium text-gray-700">
//                         Credit Card
//                       </label>
//                     </div>

//                     <div className="flex items-center">
//                       <input
//                         id="paypal"
//                         name="paymentMethod"
//                         type="radio"
//                         value="paypal"
//                         checked={formData.paymentMethod === 'paypal'}
//                         onChange={handleChange}
//                         className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
//                       />
//                       <label htmlFor="paypal" className="ml-3 block text-sm font-medium text-gray-700">
//                         PayPal
//                       </label>
//                     </div>

//                     <div className="flex items-center">
//                       <input
//                         id="phonepe"
//                         name="paymentMethod"
//                         type="radio"
//                         value="phonepe"
//                         checked={formData.paymentMethod === 'phonepe'}
//                         onChange={handleChange}
//                         className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
//                       />
//                       <label htmlFor="phonepe" className="ml-3 block text-sm font-medium text-gray-700">
//                         PhonePe
//                       </label>
//                     </div>
//                   </div>
//                   {errors.paymentMethod && <p className="mt-2 text-sm text-red-600">{errors.paymentMethod}</p>}
//                 </div>

//                 <div className="mt-6 flex items-center">
//                   <input
//                     id="save-info"
//                     name="saveInfo"
//                     type="checkbox"
//                     checked={formData.saveInfo}
//                     onChange={handleChange}
//                     className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
//                   />
//                   <label htmlFor="save-info" className="ml-2 block text-sm text-gray-900">
//                     Save this information for next time
//                   </label>
//                 </div>

//                 <div className="mt-8">
//                   <button
//                     type="submit"
//                     disabled={isLoading}
//                     className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {isLoading ? 'Processing...' : 'Place Order'}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>

//           <div className="md:col-span-1">
//             <div className="bg-white shadow rounded-lg p-6">
//               <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>
              
//               <div className="space-y-4">
//                 {cart.items.map((item) => (
//                   <div key={item.id} className="flex justify-between">
//                     <div className="flex">
//                       <div className="h-16 w-16 rounded-md overflow-hidden">
//                         <img
//                           src={item.image || '/placeholder-product.jpg'}
//                           alt={item.name}
//                           className="h-full w-full object-cover object-center"
//                         />
//                       </div>
//                       <div className="ml-4">
//                         <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
//                         <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
//                       </div>
//                     </div>
//                     <p className="text-sm font-medium text-gray-900">
//                       ${(item.price * item.quantity).toFixed(2)}
//                     </p>
//                   </div>
//                 ))}
//               </div>

//               <div className="mt-6 border-t border-gray-200 pt-6">
//                 <div className="flex justify-between text-base font-medium text-gray-900">
//                   <p>Subtotal</p>
//                   <p>${calculateTotal().toFixed(2)}</p>
//                 </div>
//                 <div className="flex justify-between text-sm text-gray-600 mt-1">
//                   <p>Shipping</p>
//                   <p>$0.00</p>
//                 </div>
//                 <div className="flex justify-between text-sm text-gray-600 mt-1">
//                   <p>Tax</p>
//                   <p>${(calculateTotal() * 0.1).toFixed(2)}</p>
//                 </div>
//                 <div className="mt-4 flex justify-between text-lg font-medium text-gray-900 border-t border-gray-200 pt-4">
//                   <p>Total</p>
//                   <p>${(calculateTotal() * 1.1).toFixed(2)}</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

function Checkout() {
return (
<div className="">
<div className="bg-[var(--bg-light)] text-[var(--text-primary)] dark:bg-[var(--bg-dark)] dark:text-[var(--text-dark)]">
  This will have a white background in light mode and dark background in dark mode
</div>
</div>
);
}
export default Checkout;