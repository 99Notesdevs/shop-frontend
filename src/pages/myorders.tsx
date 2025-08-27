import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/route';
import { 
  Package, 
  Calendar, 
  Truck, 
  AlertCircle,
  Loader2,
  Eye,
  Check
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

// Types
type ShippingStatus =  'Processing' | 'Shipped' | 'Cancelled' | 'Delivered';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string | null;
  description?: string;
}

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  productId: number;
  product: Product;
}

interface Shipping {
  id: number;
  orderId: number;
  trackingNumber: string;
  carrier: string;
  shippingDate: string;
  estimatedDelivery: string;
  status: string;  // Changed from Shippingstatus to status to match API
  Shippingstatus?: string; // Keep for backward compatibility
  createdAt: string;
  updatedAt: string;
  shippingAddress?: string;
}

interface Order {
  id: number;
  orderDate: string;
  totalAmount: number;
  status: string;
  shippingStatus: ShippingStatus; // Shipping status
  userId: number;
  createdAt: string;
  updatedAt: string;
  billingAddressId: number | null;
  shippingAddressId: number | null;
  billingAddress: {
    id: number;
    userId: number;
    name: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phoneNumber: string;
    createdAt: string;
    updatedAt: string;
  };
  shippingAddress: {
    id: number;
    userId: number;
    name: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phoneNumber: string;
    createdAt: string;
    updatedAt: string;
  };
  orderItems: OrderItem[];
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    password: string;
    oauthId: string | null;
    oauthProvider: string;
    createdAt: string;
    updatedAt: string;
  };
}

export default function MyOrders() {
  const { user} = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!user) {
      console.log('User not authenticated, redirecting to login');
      setError('Please login to view your orders');
      setLoading(false);
      return;
    }

    fetchOrders();
  }, [user, navigate]);

  interface OrderResponse {
    success: boolean;
    data: Order[];
    message?: string;
  }
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      console.log('Fetching orders for user:', user.id);
      const response = await api.get<OrderResponse>(`/order/user/${user.id}`) as { success: boolean; data: Order[] };
      console.log('Orders API response:', response);
      
      if (!response.success) {
        const errorMsg = 'Failed to fetch orders';
        console.error('Error fetching orders:', errorMsg);
        throw new Error(errorMsg);
      }

      const ordersData = response.data;
      console.log('Orders data:', ordersData);
      
      // Fetch shipping status for each order
      const ordersWithShipping = await Promise.all(
        ordersData.map(async (order) => {
          try {
            console.log('Fetching shipping for order:', order.id);
            const { data: shippingResponse } = await api.get(`/shipping/${order.id}`) as { success: boolean; data: Shipping[] };
            console.log('Shipping API response for order', order.id, ':', shippingResponse);
            
            if (shippingResponse && shippingResponse.length > 0) {
              const latestShipping = shippingResponse[0]; // Get the latest shipping info
              console.log('Latest shipping data for order', order.id, ':', latestShipping);
              
              // Get status from the correct property and ensure it's properly typed
              const shippingStatus = (latestShipping.status || latestShipping.Shippingstatus || 'Processing') as ShippingStatus;
              console.log('Derived shipping status:', shippingStatus);
              
              return {
                ...order,
                shippingStatus,
                trackingNumber: latestShipping.trackingNumber,
                estimatedDelivery: latestShipping.estimatedDelivery || order.orderDate // Fallback to order date if no estimated delivery
              };
            }
            return { ...order, shippingStatus: 'Processing' as ShippingStatus };
          } catch (error) {
            console.warn(`Could not fetch shipping for order ${order.id}:`, error);
            return { ...order, shippingStatus: 'Processing' as ShippingStatus };
          }
        })
      );
      
      // Log all orders with their shipping status for debugging
      console.log('All orders with shipping status:', ordersWithShipping);
      
      // Set all orders and check if there are more to load
      setOrders(ordersWithShipping);
      setHasMore(ordersWithShipping.length > itemsPerPage);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Date not available';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const getShippingStatusIndex = (status: ShippingStatus): number => {
   
    if (!status) {
   return 0;
    }
    const statusStr = status.toString().trim().toLowerCase();
    
    let result: number;
    switch(statusStr) {
      case 'processing':result = 0;
        break;
      case 'shipped':result = 1;
        break;
      case 'delivered':result = 2;
        break;
      case 'cancelled':result = -1;
        break;
      default:result = 0;
    }
    return result;
  };

  const getStatusText = (status: ShippingStatus): string => {
    if (!status) return 'Order Placed';
    const statusStr = status.toString().toLowerCase().trim();
    
    switch(statusStr) {
      case 'processing': return 'Processing your order';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Order Cancelled';
      default: return 'Order Placed';
    }
  };

  const renderShippingStatus = (status: ShippingStatus | undefined) => {
    if (!status) {
      status = 'Processing'; // Default status
    }
    
    const statuses = ['Processing', 'Shipped', 'Delivered'] as const;
    const currentStatusIndex = getShippingStatusIndex(status);
    const isCancelled = status.toString().toLowerCase() === 'cancelled';
    

    return (
      <div className="relative px-4 py-5 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/30 rounded-xl -z-10"></div>
        <div className="flex items-center justify-between relative">
          {statuses.map((stage, index) => {
            const isActive = currentStatusIndex >= index;
            const isLast = index === statuses.length - 1;
            const isCompleted = currentStatusIndex > index;
            const isCurrent = currentStatusIndex === index && !isCancelled;
            
            return (
              <div key={stage} className="flex-1 flex flex-col items-center relative">
                {/* Progress line */}
                {!isLast && (
                  <div className="absolute left-[calc(50%+16px)] right-0 h-1 top-4">
                    <div className={`h-full rounded-full ${
                      isCancelled 
                        ? 'bg-red-100' 
                        : isCompleted
                          ? 'bg-gradient-to-r from-indigo-400 to-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]'
                          : 'bg-gray-100'
                    }`}></div>
                  </div>
                )}
                {/* Progress line before */}
                {index > 0 && (
                  <div className="absolute right-[calc(50%+16px)] left-0 h-1 top-4">
                    <div className={`h-full rounded-full ${
                      isCancelled 
                        ? 'bg-red-100' 
                        : isCompleted || isActive
                          ? 'bg-gradient-to-r from-indigo-400 to-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]'
                          : 'bg-gray-100'
                    }`}></div>
                  </div>
                )}
                
                {/* Status indicator */}
                <div className="relative z-10 group">
                  <div 
                    className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 relative z-20 ${
                      isCancelled 
                        ? 'bg-red-50 border-2 border-red-200 text-red-500 shadow-sm' 
                        : isCurrent
                          ? 'animate-pulse bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110 border-2 border-white'
                          : isActive
                            ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-100 border-2 border-white'
                            : 'bg-gray-50 border-2 border-gray-100 text-gray-400'
                    }`}
                    style={{
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    {isCancelled ? (
                      <AlertCircle className="h-4 w-4" strokeWidth={2.5} />
                    ) : isActive ? (
                      <Check className="h-4 w-4" strokeWidth={3} />
                    ) : (
                      <span className="text-xs font-semibold">{index + 1}</span>
                    )}
                  </div>
                  
                  {/* Status tooltip */}
                  <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                    isCancelled 
                      ? 'bg-red-50 text-red-600' 
                      : isActive 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'bg-gray-50 text-gray-500'
                  }`}>
                    {stage}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 ${
                      isCancelled 
                        ? 'bg-red-50' 
                        : isActive 
                          ? 'bg-indigo-50' 
                          : 'bg-gray-50'
                    }"></div>
                  </div>
                </div>
                
                {/* Status label */}
                <span className={`text-xs mt-3 font-medium tracking-wide ${
                  isCancelled 
                    ? 'text-red-500' 
                    : isCurrent 
                      ? 'text-indigo-600 font-semibold' 
                      : isActive 
                        ? 'text-indigo-500' 
                        : 'text-gray-400'
                }`}>
                  {stage}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const viewOrderDetails = (order: Order) => {
    navigate(`/order/${order.id}`, { state: { order } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={fetchOrders} className="bg-indigo-600 hover:bg-indigo-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet. Start shopping to see your orders here.</p>
            <Button 
              onClick={() => navigate('/')}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.slice(0, currentPage * itemsPerPage).map((order) => (
              <div key={order.id} className="bg-white shadow rounded-lg overflow-hidden">
                {/* Order Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Package className="h-5 w-5 text-indigo-600" />
                        <span className="text-sm font-medium text-gray-900">
                          Order #{order.id}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatDate(order.orderDate)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}>
                        <span className="ml-1 capitalize">{order.status}</span>
                      </span>
                      <Button
                        onClick={() => viewOrderDetails(order)}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Details</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-6 py-4">
                  <div className="space-y-4">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <img
                            src={item.product.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAyMEMyNS4zNzIgMjAgMjAgMjUuMzcyIDIwIDMyQzIwIDM4LjYyOCAyNS4zNzIgNDQgMzIgNDRDMzguNjI4IDQ0IDQ0IDM4LjYyOCA0NCAzMkM0NCAyNS4zNzIgMzguNjI4IDIwIDMyIDIwWk0zMiA0MEMyOC42ODYgNDAgMjYgMzcuMzE0IDI2IDMzQzI2IDI5LjY4NiAyOC42ODYgMjcgMzIgMjdDMzUuMzE0IDI3IDM4IDI5LjY4NiAzOCAzM0MzOCAzNy4zMTQgMzUuMzE0IDQwIDMyIDQwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'}
                            alt={item.product.name}
                            className="h-16 w-16 object-cover rounded-md bg-gray-100"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAyMEMyNS4zNzIgMjAgMjAgMjUuMzcyIDIwIDMyQzIwIDM4LjYyOCAyNS4zNzIgNDQgMzIgNDRDMzguNjI4IDQ0IDQ0IDM4LjYyOCA0NCAzMkM0NCAyNS4zNzIgMzguNjI4IDIwIDMyIDIwWk0zMiA0MEMyOC42ODYgNDAgMjYgMzcuMzE0IDI2IDMzQzI2IDI5LjY4NiAyOC42ODYgMjcgMzIgMjdDMzUuMzE0IDI3IDM4IDI5LjY4NiAzOCAzM0MzOCAzNy4zMTQgMzUuMzE0IDQwIDMyIDQwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity}
                          </p>
                          <p className="text-sm text-gray-500">
                            Price per item: {formatPrice(item.price)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="mb-4">
                    {renderShippingStatus(order.shippingStatus)}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        {order.shippingStatus === 'Cancelled' ? (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        ) : order.shippingStatus === 'Shipped' || order.shippingStatus === 'Delivered' ? (
                          <Truck className="h-4 w-4 text-indigo-600" />
                        ) : (
                          <Truck className="h-4 w-4 text-gray-400" />
                        )}
                        <span className={`text-sm ${order.shippingStatus === 'Cancelled' ? 'text-red-600' : 'text-gray-600'}`}>
                          {getStatusText(order.shippingStatus)}
                        </span>
                      </div>
                      {/* {order.shippingStatus.trackingNumber && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {order.shippingStatus.trackingNumber}
                          </span>
                        </div>
                      )} */}
                      
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatPrice(order.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {orders.length > currentPage * itemsPerPage && (
              <div className="flex justify-center mt-6">
                <Button 
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  variant="outline"
                  className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
                >
                  Load More Orders
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
