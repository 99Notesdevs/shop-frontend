'use client';

import { useState, useEffect } from 'react';
import { api } from '../../api/route';

type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Completed';

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  productId: number;
  orderId: number;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface Order {
  id: number;
  orderDate: string;
  totalAmount: number;
  status: OrderStatus;
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

const orderStatusStyles = {
  'Pending': 'bg-yellow-50 text-yellow-800 border-yellow-200',
  'Processing': 'bg-blue-50 text-blue-800 border-blue-200',
  'Shipped': 'bg-indigo-50 text-indigo-800 border-indigo-200',
  'Delivered': 'bg-green-50 text-green-800 border-green-200',
  'Cancelled': 'bg-red-50 text-red-800 border-red-200',
  'Completed': 'bg-green-50 text-green-800 border-green-200',
};

const statusIcons = {
  'Pending': '⏳',
  'Processing': '⚙️',
  'Shipped': '🚚',
  'Delivered': '✅',
  'Cancelled': '❌',
  'Completed': '✅',
};

export default function ManageOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState<Record<number, Product>>({});
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: ordersData } = await api.get<{ data: Order[] }>('/order');
        setOrders(ordersData);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const fetchProductDetails = async (productId: number) => {
    try {
      const response = await api.get(`/product/${productId}`) as { success: boolean; data: Product };
      console.log("product details",response);
      if (response.success) {
        setProducts(prev => ({
          ...prev,
          [productId]: response.data
        }));
      }
    } catch (error) {
      console.error(`Error fetching product ${productId}:`, error);
    }
  };

  useEffect(() => {
    if (selectedOrder) {
      // Fetch product details for all items in the order
      selectedOrder.orderItems.forEach(item => {
        if (!products[item.productId]) {
          fetchProductDetails(item.productId);
        }
      });
    }
  }, [selectedOrder]);

  const filteredOrders = orders.filter(order => {
    if (!order) return false;
    return statusFilter === 'all' || order.status === statusFilter;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const updateOrderStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await api.put(`/order/status/${orderId}`, { status: newStatus });
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status');
    }
  };

  const openOrderDetails = (order: Order) => {
    console.log('Opening order details:', order);
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handlePrint = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order #${order.id} - Print</title>
        <style>
          @media print {
            @page { margin: 0.5cm; }
            body { font-family: Arial, sans-serif; font-size: 12px; color: #000; background: #fff; }
            .print-container { max-width: 100%; padding: 10px; }
            .print-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .print-section { margin-bottom: 15px; }
            .print-section h3 { border-bottom: 1px solid #ddd; padding-bottom: 5px; margin: 15px 0 10px 0; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .text-right { text-align: right; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .text-bold { font-weight: bold; }
            .mt-3 { margin-top: 15px; }
            .mb-2 { margin-bottom: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="print-header">
            <h1>Order #${order.id}</h1>
            <p>Order Date: ${new Date(order.orderDate).toLocaleDateString()}</p>
            <p>Status: ${order.status}</p>
          </div>

          <div class="print-section">
            <h3>Customer Information</h3>
            <p>${order.user.firstName} ${order.user.lastName}</p>
            <p>Email: ${order.user.email}</p>
            ${order.user.phone ? `<p>Phone: ${order.user.phone}</p>` : ''}
          </div>

          <div class="grid-2">
            <div class="print-section">
              <h3>Billing Address</h3>
              <p>${order.billingAddress.name}</p>
              <p>${order.billingAddress.addressLine1}</p>
              ${order.billingAddress.addressLine2 ? `<p>${order.billingAddress.addressLine2}</p>` : ''}
              <p>${order.billingAddress.city}, ${order.billingAddress.state} ${order.billingAddress.zipCode}</p>
              <p>${order.billingAddress.country}</p>
              <p>Phone: ${order.billingAddress.phoneNumber}</p>
            </div>

            <div class="print-section">
              <h3>Shipping Address</h3>
              <p>${order.shippingAddress.name}</p>
              <p>${order.shippingAddress.addressLine1}</p>
              ${order.shippingAddress.addressLine2 ? `<p>${order.shippingAddress.addressLine2}</p>` : ''}
              <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>
              <p>${order.shippingAddress.country}</p>
              <p>Phone: ${order.shippingAddress.phoneNumber}</p>
            </div>
          </div>

          <div class="print-section">
            <h3>Order Items</h3>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.orderItems.map(item => {
                  const product = products[item.productId];
                  return `
                    <tr>
                      <td>${product?.name || `Product #${item.productId}`}</td>
                      <td>${product?.category || 'N/A'}</td>
                      <td>${item.quantity}</td>
                      <td>₹${item.price.toFixed(2)}</td>
                      <td>₹${(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div class="text-right mt-3">
            <p class="text-bold">Subtotal: ₹${order.totalAmount.toFixed(2)}</p>
            <p class="mb-2">Total: ₹${order.totalAmount.toFixed(2)}</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load before printing
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // printWindow.close(); // Uncomment this line to automatically close the print window after printing
      }, 500);
    };
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-pulse flex flex-col items-center space-y-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <p className="text-gray-600">Loading orders...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
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
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="mt-1 text-sm text-gray-500">View and manage customer orders</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="relative">
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as OrderStatus | 'all');
                setCurrentPage(1);
              }}
            >
              <option value="all">All Statuses</option>
              {Object.keys(orderStatusStyles).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.length > 0 ? (
              currentItems.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      {order.user && (
                        <>
                          {order.user.firstName} {order.user.lastName}
                        </>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.user?.email || 'No email provided'}
                    </div>
                    {order.user?.phone && (
                      <div className="text-sm text-gray-500">{order.user.phone}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.orderItems?.length || 0} items
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      {order.orderItems?.map((item) => (
                        <div key={item.id}>
                          Product #{item.productId} - Qty: {item.quantity} - ₹{item.price}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${orderStatusStyles[order.status]}`}>
                      {statusIcons[order.status]} {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-y-2">
                    <button
                      onClick={() => openOrderDetails(order)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
                    >
                      View Details
                    </button>
                    <select
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                    >
                      {Object.keys(orderStatusStyles).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {statusFilter === 'all' 
                      ? 'No orders have been placed yet.' 
                      : `No orders with status "${statusFilter}" found.`}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-lg">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, filteredOrders.length)}
                </span>{' '}
                of <span className="font-medium">{filteredOrders.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Order Details - #{selectedOrder.id}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Order Summary */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Order Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600 font-medium">Order Date:</span>
                    <div>{new Date(selectedOrder.orderDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Status:</span>
                    <div className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${orderStatusStyles[selectedOrder.status]}`}>
                      {statusIcons[selectedOrder.status]} {selectedOrder.status}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Total Amount:</span>
                    <div className="text-green-600 font-bold">₹{selectedOrder.totalAmount.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Items:</span>
                    <div>{selectedOrder.orderItems.length} products</div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600 font-medium">Name:</span>
                    <div className="font-semibold">{selectedOrder.user.firstName} {selectedOrder.user.lastName}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Email:</span>
                    <div>{selectedOrder.user.email}</div>
                  </div>
                  {selectedOrder.user.phone && (
                    <div>
                      <span className="text-gray-600 font-medium">Phone:</span>
                      <div>{selectedOrder.user.phone}</div>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600 font-medium">User ID:</span>
                    <div>#{selectedOrder.user.id}</div>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Billing Address */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Billing Address</h3>
                  <div className="space-y-1 text-sm">
                    <div className="font-medium">{selectedOrder.billingAddress.name}</div>
                    <div>{selectedOrder.billingAddress.addressLine1}</div>
                    {selectedOrder.billingAddress.addressLine2 && (
                      <div>{selectedOrder.billingAddress.addressLine2}</div>
                    )}
                    <div>
                      {selectedOrder.billingAddress.city}, {selectedOrder.billingAddress.state} {selectedOrder.billingAddress.zipCode}
                    </div>
                    <div>{selectedOrder.billingAddress.country}</div>
                    <div className="text-gray-600">Phone: {selectedOrder.billingAddress.phoneNumber}</div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Shipping Address</h3>
                  <div className="space-y-1 text-sm">
                    <div className="font-medium">{selectedOrder.shippingAddress.name}</div>
                    <div>{selectedOrder.shippingAddress.addressLine1}</div>
                    {selectedOrder.shippingAddress.addressLine2 && (
                      <div>{selectedOrder.shippingAddress.addressLine2}</div>
                    )}
                    <div>
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                    </div>
                    <div>{selectedOrder.shippingAddress.country}</div>
                    <div className="text-gray-600">Phone: {selectedOrder.shippingAddress.phoneNumber}</div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.orderItems.map((item) => {
                        const product = products[item.productId];
                        return (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  {product?.imageUrl ? (
                                    <img 
                                      className="h-10 w-10 rounded-md object-cover" 
                                      src={product.imageUrl} 
                                      alt={product.name}
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                                      <span className="text-gray-400 text-xs">No Image</span>
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{product?.name || `Product #${item.productId}`}</div>
                                  <div className="text-xs text-gray-500">ID: {item.productId}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {product?.category || 'N/A'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">₹{item.price.toFixed(2)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              ₹{(item.quantity * item.price).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => handlePrint(selectedOrder)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Print Order
                </button>
                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
