import { useEffect, useState, Component, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/route';
import { Button } from '../ui/button';
import { format, parseISO } from 'date-fns';
import { 
  Loader2, 
  ArrowLeft, 
  Package, 
  MapPin, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RotateCw 
} from 'lucide-react';
// Error Boundary Component
class OrderDetailErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('OrderDetail Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">We couldn't load the order details. Please try again later.</p>
          <Button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RotateCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string | null;
}

interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  orderDate: string;
  totalAmount: number;
  status: OrderStatus;
  userId: number;
  billingAddressId: number | null;
  shippingAddressId: number | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  trackingNumber?: string;
  estimatedDelivery?: string;
}

interface OrderStatusProps {
  status: OrderStatus;
  updatedAt?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

interface OrderItemCardProps {
  item: OrderItem;
}

interface OrderSummaryProps {
  totalAmount: number;
  orderId: number;
  createdAt: string;
  updatedAt: string;
}

const formatDate = (dateString: string) => {
  try {
    return format(parseISO(dateString), 'MMMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date not available';
  }
};

function OrderDetailContent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        console.log('Fetching order with ID:', id);
        // The correct endpoint is /api/v1/order/:id (singular) as per backend routes
        if (!id) {
          throw new Error('Order ID is missing');
        }
        const response = await api.get<{ success: boolean; data: Order }>(`order/${id}`);
        if (!response || !response.data) {
          throw new Error('No data received from server');
        }
        console.log('Order data received:', response);
        setOrder(response.data);
      } catch (err) {
        setError('Failed to load order details');
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const getStatusColor = useCallback((status: OrderStatus) => {
    const statusColors: Record<OrderStatus, string> = {
      'delivered': 'bg-green-100 text-green-800',
      'shipped': 'bg-blue-100 text-blue-800',
      'processing': 'bg-yellow-100 text-yellow-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }, []);

  const ErrorState = useCallback(({ error }: { error: string | null }) => (
    <div className="text-center py-12">
      <XCircle className="mx-auto h-12 w-12 text-red-500" />
      <h3 className="mt-2 text-lg font-medium text-gray-900">
        {error?.includes('Order ID is missing') ? 'Invalid Order' : 'Order not found'}
      </h3>
      <p className="mt-1 text-gray-500">
        {error?.includes('Order ID is missing') 
          ? 'The order ID is missing from the URL.' 
          : 'We couldn\'t find the order you\'re looking for.'}
      </p>
      <p className="text-sm text-red-500 mt-2">
        {error || 'The order might have been moved or deleted.'}
      </p>
      <div className="mt-6 space-x-4">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
        <Button onClick={() => navigate('/myorders')}>
          View All Orders
        </Button>
      </div>
    </div>
  ), [navigate]);

  if (error || !order) {
    return <ErrorState error={error} />;
  }

  const OrderHeader = memo(({ order, onBack }: { order: Order; onBack: () => void }) => (
    <div className="mb-8">
      <Button 
        variant="outline" 
        onClick={onBack}
        className="mb-6"
        aria-label="Go back to orders"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Button>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Order #{order.id}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center">
          <span 
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
            aria-label={`Order status: ${order.status}`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
      </div>
    </div>
  ));

  const OrderItemCard = memo(({ item }: OrderItemCardProps) => (
    <div className="p-6 flex" role="listitem">
      <div className="flex-shrink-0 h-24 w-24 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
        {item.product.image ? (
          <img
            src={item.product.image}
            alt={item.product.name}
            className="h-full w-full object-cover object-center"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = '/placeholder-product.jpg';
            }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
            <Package className="h-8 w-8" />
          </div>
        )}
      </div>
      <div className="ml-6 flex-1">
        <div className="flex flex-col sm:flex-row sm:justify-between">
          <h4 className="text-sm font-medium text-gray-900">
            {item.product.name}
          </h4>
          <p className="mt-1 sm:mt-0 text-sm font-medium text-gray-900">
            ${item.price.toFixed(2)}
          </p>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Qty: {item.quantity}
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Total: ${(item.price * item.quantity).toFixed(2)}
        </p>
      </div>
    </div>
  ));

  const OrderStatusSection = memo(({ status, updatedAt, trackingNumber, estimatedDelivery }: OrderStatusProps) => (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
          <Package className="mr-2 h-5 w-5 text-indigo-600" />
          Order Status
        </h3>
      </div>
      <div className="px-6 py-5">
        <div className="space-y-4">
          <div className="flex items-center">
            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
              status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                Order {status}
              </p>
              {status === 'delivered' && updatedAt && (
                <p className="text-sm text-gray-500">
                  Delivered on {formatDate(updatedAt)}
                </p>
              )}
            </div>
          </div>
          
          {trackingNumber && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-900">Tracking Number</p>
              <p className="text-sm text-gray-500">{trackingNumber}</p>
            </div>
          )}
          
          {estimatedDelivery && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-900">Estimated Delivery</p>
              <p className="text-sm text-gray-500">
                {format(parseISO(estimatedDelivery), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  ));

  const OrderSummary = memo(({ totalAmount, orderId, createdAt, updatedAt }: OrderSummaryProps) => (
    <div className="space-y-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Order Summary
          </h3>
        </div>
        <div className="px-6 py-5">
          <dl className="space-y-4">
            <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
              <dt className="text-base font-medium text-gray-900">Total</dt>
              <dd className="text-base font-medium text-gray-900">${totalAmount.toFixed(2)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <MapPin className="mr-2 h-5 w-5 text-indigo-600" />
            Shipping Address
          </h3>
        </div>
        <div className="px-6 py-5">
          <div className="text-sm text-gray-600">
            {order.shippingAddressId ? (
              <p>Shipping address ID: {order.shippingAddressId}</p>
            ) : (
              <p>No shipping address provided</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <CreditCard className="mr-2 h-5 w-5 text-indigo-600" />
            Payment Information
          </h3>
        </div>
        <div className="px-6 py-5">
          <div className="text-sm text-gray-600">
            <p>Payment information not available</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-indigo-600" />
            Order Information
          </h3>
        </div>
        <div className="px-6 py-5">
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="text-sm font-medium text-gray-900">#{orderId}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-gray-600">Order Date</p>
              <p className="text-sm text-gray-900">
                {formatDate(createdAt)}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="text-sm text-gray-900">
                {formatDate(updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <OrderHeader 
        order={order} 
        onBack={() => navigate(-1)} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h2 className="text-lg leading-6 font-medium text-gray-900">
                Order Items
              </h2>
            </div>
            <div className="divide-y divide-gray-200" role="list">
              {order.items?.length ? (
                order.items.map((item) => (
                  <OrderItemCard key={item.id} item={item} />
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No items found in this order
                </div>
              )}
            </div>
          </div>

          <OrderStatusSection 
            status={order.status}
            updatedAt={order.updatedAt}
            trackingNumber={order.trackingNumber}
            estimatedDelivery={order.estimatedDelivery}
          />
        </div>

        <OrderSummary 
          totalAmount={order.totalAmount}
          orderId={order.id}
          createdAt={order.createdAt}
          updatedAt={order.updatedAt}
        />
      </div>
    </div>
  );
}

// Memoize the main component to prevent unnecessary re-renders
const MemoizedOrderDetailContent = memo(OrderDetailContent);

// Wrap the component with Error Boundary
export default function OrderDetail() {
  return (
    <OrderDetailErrorBoundary>
      <MemoizedOrderDetailContent />
    </OrderDetailErrorBoundary>
  );
}