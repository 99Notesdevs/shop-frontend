import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { api } from '../api/route';

// Simple Skeleton component
const Skeleton = ({ className = '' }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  total: number;
  orderDate: string;
  deliveryDate?: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
}

const statusColors = {
  pending: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
  processing: 'bg-blue-50 text-blue-800 border border-blue-200',
  shipped: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
  delivered: 'bg-green-50 text-green-800 border border-green-200',
  cancelled: 'bg-red-50 text-red-800 border border-red-200',
};

const statusSteps = [
  { id: 'pending', label: 'Order Placed' },
  { id: 'processing', label: 'Processing' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
];

export default function MyOrders() {
  const { isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError('');
        
        // Fetch orders for the current user
        const response = await api.get<any>(`/order/user/${user.id}`);
        
        // Log the response to debug
        console.log('Orders API Response:', response);
        
        // Handle different response formats
        let ordersData = [];
        
        // If response is an array, use it directly
        if (Array.isArray(response)) {
          ordersData = response;
        } 
        // If response is an object with a data property that's an array
        else if (response && Array.isArray(response.data)) {
          ordersData = response.data;
        }
        // If response is an object with a data property that's an object with an orders array
        else if (response?.data?.orders && Array.isArray(response.data.orders)) {
          ordersData = response.data.orders;
        }
        // If response is an object with an orders array
        else if (response?.orders && Array.isArray(response.orders)) {
          ordersData = response.orders;
        }
        
        // Transform the orders data to match our Order interface
        const formattedOrders = ordersData.map((order: any) => ({
          id: order.id || '',
          orderNumber: order.orderNumber || `#${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          status: order.status || 'pending',
          items: order.items || [],
          total: order.total || 0,
          orderDate: order.orderDate || new Date().toISOString(),
          deliveryDate: order.deliveryDate,
          shippingAddress: order.shippingAddress || {
            street: order.shippingAddress?.street || '',
            city: order.shippingAddress?.city || '',
            state: order.shippingAddress?.state || '',
            zipCode: order.shippingAddress?.zipCode || '',
            country: order.shippingAddress?.country || '',
          },
          trackingNumber: order.trackingNumber,
        }));
        
        setOrders(formattedOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.id) {
      fetchOrders();
    } else if (!isAuthenticated) {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusStep = (status: string) => {
    return statusSteps.findIndex(step => step.id === status) + 1;
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 w-full max-w-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">Please sign in to view your orders</p>
            </div>
          </div>
        </div>
        <Button onClick={() => navigate('/login')}>
          Sign In
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div className="mb-4 sm:mb-0">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-48" />
          </div>

          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-4 w-36" />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-6 w-24 ml-auto" />
                      <Skeleton className="h-4 w-16 mt-1 ml-auto" />
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {[1, 2].map((j) => (
                    <div key={j} className="p-4">
                      <div className="flex items-start gap-4">
                        <Skeleton className="h-16 w-16 rounded-md flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <Skeleton className="h-5 w-48 mb-2" />
                          <div className="flex items-center gap-4">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                          <Skeleton className="h-5 w-16 mt-1" />
                        </div>
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 px-6 py-4 flex flex-wrap justify-end gap-3 border-t border-gray-100">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="bg-blue-50 p-6 rounded-full mb-6">
          <svg className="h-16 w-16 text-blue-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
        <p className="text-gray-600 mb-6 max-w-md">You haven't placed any orders yet. Start shopping to see your orders here.</p>
        <Button onClick={() => navigate('/products')}>
          Start Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-1">Track and manage your orders</p>
          </div>
          <Button 
            onClick={() => navigate('/products')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4.59L7.3 9.24a.75.75 0 00-1.1 1.02l3.25 3.75a.75.75 0 001.1 0l3.25-3.75a.75.75 0 10-1.1-1.02l-1.95 2.25V6.75z" clipRule="evenodd" />
            </svg>
            <span>Continue Shopping</span>
          </Button>
        </div>

        <div className="space-y-8">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h2 className="text-lg font-semibold text-gray-900">Order #{order.orderNumber}</h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                      <span className="flex items-center">
                        <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(order.orderDate)}
                      </span>
                      {order.deliveryDate && (
                        <span className="flex items-center">
                          <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {formatDate(order.deliveryDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">₹{order.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</p>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                  {order.items.map((item) => (
                    <div key={item.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 relative group">
                          <div className="absolute inset-0 bg-black/5 rounded-lg -z-10 group-hover:scale-105 transition-transform duration-300"></div>
                          <img
                            src={item.image || 'https://via.placeholder.com/80'}
                            alt={item.name}
                            className="h-20 w-20 rounded-lg object-cover border border-gray-100 group-hover:shadow-sm transition-all duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/80';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">{item.name}</h3>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <span>Qty: {item.quantity}</span>
                            <span className="text-gray-300">•</span>
                            <span>₹{item.price.toFixed(2)} each</span>
                          </div>
                          <p className="mt-1 text-sm font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Status Progress */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                  <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Order Status
                  </h3>
                  <div className="relative">
                    <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 -z-10"></div>
                    <div 
                      className="absolute top-4 left-0 h-1 bg-gradient-to-r from-indigo-500 to-green-500 transition-all duration-500 -z-5"
                      style={{
                        width: `${(getStatusStep(order.status) / statusSteps.length) * 100}%`,
                        maxWidth: 'calc(100% - 32px)',
                        marginLeft: '16px'
                      }}
                    ></div>
                    <div className="flex items-center justify-between mb-2">
                      {statusSteps.map((step, index) => {
                        const isCompleted = index < getStatusStep(order.status);
                        const isCurrent = index === getStatusStep(order.status) - 1;
                        
                        return (
                          <div key={step.id} className="flex flex-col items-center relative">
                            <div 
                              className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                isCompleted 
                                  ? "bg-green-500 border-green-500 text-white shadow-md" 
                                  : isCurrent 
                                    ? "bg-white border-indigo-500 text-indigo-500 shadow-md" 
                                    : "bg-white border-gray-200 text-gray-400"
                              }`}
                            >
                              {isCompleted ? (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <span className="text-xs font-medium">{index + 1}</span>
                              )}
                            </div>
                            <span className={`text-xs mt-2 text-center max-w-20 leading-tight ${
                              isCompleted 
                                ? "text-green-600 font-semibold" 
                                : isCurrent 
                                  ? "text-indigo-600 font-semibold" 
                                  : "text-gray-500"
                            }`}>
                              {step.label}
                            </span>
                            {isCurrent && order.trackingNumber && (
                              <div className="absolute -bottom-6 whitespace-nowrap text-xs text-indigo-600 font-medium">
                                <span className="inline-flex items-center">
                                  <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                  </svg>
                                  Tracking: {order.trackingNumber}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              <div className="bg-gray-50 px-6 py-4 flex flex-wrap justify-end gap-3 border-t border-gray-100">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Details
                </Button>
                {order.trackingNumber && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                    onClick={() => window.open(`https://www.ups.com/track?tracknum=${order.trackingNumber}`, '_blank')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Track Order
                  </Button>
                )}
                {order.status === 'delivered' && (
                  <Button 
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                    onClick={() => navigate(`/review/${order.id}`)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Leave Review
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}