import React, {  useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Button } from '../ui/button';
import { ArrowLeft, Package, Truck, CreditCard,MapPin, Phone, Calendar, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    image: string | null;
    description: string | null;
  };
}

interface Order {
  id: number;
  orderDate: string;
  totalAmount: number;
  status: string;
  orderItems: OrderItem[];
  shippingAddress: {
    name: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phoneNumber: string;
  };
}

const OrderDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(location.state?.order || null);

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-12 md:py-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 text-center"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">Order not found</h3>
            <p className="mt-2 text-gray-600">We couldn't find the order you're looking for.</p>
            <div className="mt-6">
              <Button 
                onClick={() => navigate('/my-orders')}
                className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                Go back to orders
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="mb-8 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        

      <div 
        className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
      >
        {/* Order Header */}
        <div className="px-6 py-5 bg-gray-50 text-gray-900">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Order #{order.id}</h1>
              <div className="flex items-center mt-1 text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1.5" />
                <span>
                  {format(new Date(order.orderDate), 'MMMM d, yyyy')}
                </span>
              </div>
            </div>
            
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100">Order Items</h2>
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <motion.div 
                  key={item.id} 
                  whileHover={{ scale: 1.005, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center p-5 bg-white rounded-xl border border-gray-100 hover:border-blue-100 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                  onClick={() => navigate(`/product/${item.product.id}`)}
                >
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 border-gray-50 bg-white">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-full w-full object-cover object-center"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-50">
                        <Package className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="ml-5 flex-1">
                    <h3 className="text-base font-medium text-gray-900">
                      {item.product.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {item.product.description}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-base font-semibold text-gray-900">
                    ₹{item.price.toFixed(2)}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded-md inline-block">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-5">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="pt-3 mt-3 border-t border-blue-100 flex justify-between text-lg font-semibold text-gray-900">
                  <span>Total</span>
                  <span>₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Shipping Information */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm"
            >
              <div className="flex items-center mb-5">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <Truck className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Shipping Information</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Shipping Address</h3>
                  <div className="space-y-1.5 text-gray-700">
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{order.shippingAddress.name}</p>
                        <p>{order.shippingAddress.addressLine1}</p>
                        {order.shippingAddress.addressLine2 && (
                          <p>{order.shippingAddress.addressLine2}</p>
                        )}
                        <p>
                          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                        </p>
                        <p>{order.shippingAddress.country}</p>
                      </div>
                    </div>
                    <div className="flex items-center pt-1">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{order.shippingAddress.phoneNumber}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm"
            >
              <div className="flex items-center mb-5">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Payment Information</h2>
              </div>
              <div className="space-y-2 text-gray-700">
                <p className="flex items-center">
                  <span className="font-medium mr-2">Method:</span>
                  <span>Credit Card</span>
                </p>
                <p className="flex items-center">
                  <span className="font-medium mr-2">Status:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Paid
                  </span>
                </p>
                <p className="text-sm text-gray-500 pt-2 border-t border-gray-100 mt-3">
                  Billing address is the same as shipping address
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default OrderDetail;