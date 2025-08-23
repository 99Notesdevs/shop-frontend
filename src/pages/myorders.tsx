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
    salePrice?: number;
    quantity: number;
    image?: string;
    product?: {
        id: string;
        name: string;
        price: number;
        salePrice?: number;
        images?: string;
    };
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

const OrderItemCard = ({ item }: { item: OrderItem }) => {
    const displayPrice = item.product?.salePrice || item.salePrice || item.price;
    const originalPrice = item.product?.price || item.price;
    const hasDiscount = displayPrice < originalPrice;
    const imageUrl = item.product?.images || item.image || 'https://via.placeholder.com/80';
    const productName = item.product?.name || item.name;

    return (
        <div className="p-4 hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-b-0">
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 relative group">
                    <div className="absolute inset-0 bg-black/5 rounded-lg -z-10 group-hover:scale-105 transition-transform duration-300"></div>
                    <img
                        src={imageUrl}
                        alt={productName}
                        className="h-20 w-20 rounded-lg object-cover border border-gray-100 group-hover:shadow-sm transition-all duration-300"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/80';
                        }}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {productName}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span>Qty: {item.quantity}</span>
                        <span className="text-gray-300 hidden sm:inline">•</span>
                        <div className="flex items-center space-x-2">
                            {hasDiscount && (
                                <span className="text-gray-400 line-through">
                                    ₹{(originalPrice / 100).toFixed(2)}
                                </span>
                            )}
                            <span className="text-indigo-600 font-medium">
                                ₹{(displayPrice / 100).toFixed(2)} each
                            </span>
                        </div>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                        <p className="text-sm font-semibold text-gray-900">
                            ₹{((displayPrice * item.quantity) / 100).toFixed(2)}
                        </p>
                        {hasDiscount && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                {Math.round(((originalPrice - displayPrice) / originalPrice) * 100)}% OFF
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const MyOrders = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/order/user/${user?.id}`) as {success:boolean; data:Order[]};
                setOrders(response.data);
            } catch (err) {
                setError('Failed to load orders');
                console.error('Error fetching orders:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchOrders();
        } else {
          <p>please login first</p>
        }
    }, [user, navigate]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">My Orders</h1>
                <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <Skeleton className="h-6 w-48" />
                                    <Skeleton className="h-5 w-24" />
                                </div>
                                <div className="mt-2 flex space-x-4">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex space-x-4">
                                    <Skeleton className="h-20 w-20 rounded" />
                                    <div className="flex-1">
                                        <Skeleton className="h-5 w-48 mb-2" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                    <Skeleton className="h-10 w-24" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-12 text-center">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No orders yet</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            You haven't placed any orders yet. Start shopping to see your orders here.
                        </p>
                        <div className="mt-6">
                            <Button
                                onClick={() => navigate('/')}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Continue Shopping
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">My Orders</h1>
            <div className="space-y-6">
                {orders.map((order) => (
                    <div key={order.id} className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                <div className="flex items-center">
                                    <span className="text-sm font-medium text-gray-900">
                                        Order #{order.orderNumber}
                                    </span>
                                    <span className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                </div>
                                <div className="mt-2 sm:mt-0 text-sm text-gray-500">
                                    Placed on {new Date(order.orderDate).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                                <span>Total: ₹{(order.total / 100).toFixed(2)}</span>
                                {order.deliveryDate && (
                                    <>
                                        <span className="text-gray-300 hidden sm:inline">•</span>
                                        <span>Delivery by {new Date(order.deliveryDate).toLocaleDateString()}</span>
                                    </>
                                )}
                                {order.trackingNumber && (
                                    <>
                                        <span className="text-gray-300 hidden sm:inline">•</span>
                                        <span className="text-indigo-600 hover:text-indigo-500 cursor-pointer">
                                            Track Order
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        <div className="p-4">
                            {(order.items || []).map((item, index) => (
                                <OrderItemCard key={`${item.id}-${index}`} item={item} />
                            ))}
                            
                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                <Button
                                    variant="outline"
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                    onClick={() => navigate(`/orders/${order.id}`)}
                                >
                                    View Order Details
                                </Button>
                                <Button
                                    variant="outline"
                                    className="ml-3 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                                    onClick={() => navigate(`/orders/${order.id}/reorder`)}
                                >
                                    Reorder
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyOrders;