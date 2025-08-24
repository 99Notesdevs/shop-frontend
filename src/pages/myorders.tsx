import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/route';
import { 
  Package, 
  Calendar, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Loader2,
  Eye
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

// Types
type OrderStatus = 'Completed' | 'Pending' | 'Processing' | 'Shipped' | 'Cancelled';

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
  status: OrderStatus;
}

interface Order {
  id: number;
  orderDate: string;
  totalAmount: number;
  status: OrderStatus;
  userId: number;
  billingAddressId: number | null;
  shippingAddressId: number | null;
  billingAddress: {
    id: number;
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    zipCode: string;
  };
  shippingAddress: {
    id: number;
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  shipping: Shipping[];
}

interface OrderWithDetails extends Order {
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export default function MyOrders() {
  const { user} = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  interface ShippingResponse {
    success: boolean;
    data: Shipping[];
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
        ordersData.map(async (order: Order) => {
          try {
            console.log('Fetching shipping for order:', order.id);
            const { data: shippingResponse } = await api.post<ShippingResponse>('/shipping', { orderId: order.id });
            console.log('Shipping API response for order', order.id, ':', shippingResponse);
            
            if (shippingResponse && shippingResponse.length > 0) {
              const latestShipping = shippingResponse[0]; // Get the latest shipping info
              return {
                ...order,
                status: latestShipping.status as OrderStatus,
                trackingNumber: latestShipping.trackingNumber,
                estimatedDelivery: latestShipping.estimatedDelivery
              };
            }
            return order;
          } catch (error) {
            console.warn(`Could not fetch shipping for order ${order.id}:`, error);
            return order;
          }
        })
      );

      setOrders(ordersWithShipping);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };


  const getStatusColor = (status: OrderStatus) => {
    const statusColors: Record<OrderStatus, string> = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Processing': 'bg-blue-100 text-blue-800',
      'Shipped': 'bg-purple-100 text-purple-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };


  const getStatusIcon = (status: OrderStatus) => {
    const statusIcons: Record<OrderStatus, React.ReactNode> = {
      'Pending': <Clock className="h-4 w-4" />,
      'Processing': <Package className="h-4 w-4" />,
      'Shipped': <Truck className="h-4 w-4" />,
      'Completed': <CheckCircle2 className="h-4 w-4" />,
      'Cancelled': <AlertCircle className="h-4 w-4" />
    };
    return statusIcons[status] || <Package className="h-4 w-4" />;
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

  const viewOrderDetails = (orderId: number) => {
    navigate(`/order/${orderId}`);
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-2 text-gray-600">Track your orders and view order history</p>
        </div>

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
            {orders.map((order) => (
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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </span>
                      <Button
                        onClick={() => viewOrderDetails(order.id)}
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Truck className="h-4 w-4 text-gray-400" />
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{order.status}</span>
                        </span>
                      </div>
                      {order.trackingNumber && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Tracking: {order.trackingNumber}
                          </span>
                        </div>
                      )}
                      {order.estimatedDelivery && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Est. Delivery: {formatDate(order.estimatedDelivery)}
                          </span>
                        </div>
                      )}
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
          </div>
        )}
      </div>
    </div>
  );
}
