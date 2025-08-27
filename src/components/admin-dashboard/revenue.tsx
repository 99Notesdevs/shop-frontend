"use client";

import { useEffect, useState } from 'react';
import { DollarSign, Package, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../../api/route';

// Format currency utility
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

interface Order {
  id: number;
  orderDate: string;
  totalAmount: number;
  status: 'Pending' | 'Failed' | 'Completed' | 'Canceled';
}

export default function RevenueDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Add new state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const ordersPerPage = 5;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/order') as { success: boolean; data: Order[] };
        if (!response.success) {
          throw new Error('Failed to fetch orders');
        }
        const data = response.data;
        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load order data');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter only completed orders
  const completedOrders = orders.filter(order => order.status === 'Completed');
  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  
  // For the recent orders table, we'll only show completed orders
  const sortedCompletedOrders = [...completedOrders].sort(
    (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
  );

  const totalPages = Math.ceil(sortedCompletedOrders.length / ordersPerPage);
  
  const paginatedOrders = showAllOrders 
    ? sortedCompletedOrders 
    : sortedCompletedOrders.slice(
        (currentPage - 1) * ordersPerPage,
        currentPage * ordersPerPage
      );

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleViewAllOrders = () => {
    setShowAllOrders((prev) => !prev);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-100 rounded-lg w-64 mb-8"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <div className="h-4 bg-gray-100 rounded w-24"></div>
                  <div className="h-8 w-8 bg-gray-100 rounded-full"></div>
                </div>
                <div className="h-8 bg-gray-100 rounded w-32 mt-2"></div>
                <div className="h-3 bg-gray-100 rounded w-20 mt-2"></div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <div className="h-6 bg-gray-100 rounded-lg w-48 mb-4"></div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                    <div className="h-4 bg-gray-100 rounded w-16"></div>
                    <div className="h-4 bg-gray-100 rounded w-24"></div>
                    <div className="h-4 bg-gray-100 rounded w-20"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Error loading data</h3>
              <div className="mt-1 text-sm text-gray-600">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Track your store's performance and revenue</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-gray-500 mt-1">From {completedOrders.length} orders</p>
            </div>
          </div>
        </div>

        {/* Completed Orders Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Completed Orders</h3>
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{completedOrders.length}</p>
              <p className="text-xs text-gray-500 mt-1">
                {orders.length > 0 ? Math.round((completedOrders.length / orders.length) * 100) : 0}% success rate
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
            <p className="text-sm text-gray-500 mt-1">Latest completed transactions</p>
          </div>
          {/* Replace the View all orders button with this */}
          <button 
            onClick={handleViewAllOrders}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            {showAllOrders ? "Show less ↑" : "View all orders →"}
          </button>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg mr-3">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                          <div className="text-xs text-gray-500">Completed</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(order.orderDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.orderDate).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.status}
                      </div>
                    </td>
                  </tr>
                ))}
                {completedOrders.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center">
                      <div className="text-gray-400 flex flex-col items-center">
                        <Package className="h-10 w-10 mb-2 text-gray-300" />
                        <p className="text-sm font-medium text-gray-500">No completed orders found</p>
                        <p className="text-xs text-gray-400 mt-1">Completed orders will appear here</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Replace the pagination section with this */}
          {completedOrders.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Showing <span className="font-medium">
                  {showAllOrders 
                    ? `all ${completedOrders.length}` 
                    : `${((currentPage - 1) * ordersPerPage) + 1}-${Math.min(currentPage * ordersPerPage, completedOrders.length)}`
                }</span> of <span className="font-medium">{completedOrders.length}</span> orders
              </p>
              {!showAllOrders && (
                <div className="flex space-x-2">
                  <button 
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md ${
                      currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <button 
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 text-xs font-medium text-white bg-blue-600 border border-transparent rounded-md ${
                      currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
