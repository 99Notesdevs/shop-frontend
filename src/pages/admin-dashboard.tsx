import { Outlet, useLocation, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { FiPlus, FiList } from 'react-icons/fi';
import RevenueDashboard from '../components/admin-dashboard/revenue';

const WelcomeMessage = () => (
  <div className="p-6 md:p-10 text-center">
    <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Admin Dashboard</h1>
    <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">Manage the test portal from here. Get started with the following actions:</p>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      <Link 
        to="/admin/add-product" 
        className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col items-center text-center transform hover:-translate-y-1"
      >
        <div className="bg-primary/10 p-4 rounded-2xl mb-6 group-hover:bg-primary/20 transition-colors">
          <FiPlus className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Add Product</h3>
        <p className="text-gray-500">Create new Products</p>
      </Link>

      <Link 
        to="/admin/manage-orders" 
        className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col items-center text-center transform hover:-translate-y-1"
      >
        <div className="bg-primary/10 p-4 rounded-2xl mb-6 group-hover:bg-primary/20 transition-colors">
          <FiList className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Manage Orders</h3>
        <p className="text-gray-500">View and modify orders</p>
      </Link>

      <Link 
        to="/admin/add-category" 
        className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col items-center text-center transform hover:-translate-y-1"
      >
        <div className="bg-primary/10 p-4 rounded-2xl mb-6 group-hover:bg-primary/20 transition-colors">
          <FiPlus className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Create Category</h3>
        <p className="text-gray-500">Set up a new category</p>
      </Link>
    </div>
  </div>
);

const AdminDashboard = () => {
  const location = useLocation();
  const isRootPath = location.pathname === '/admin' || location.pathname === '/admin/';

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 overflow-auto py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className=" rounded-2xl shadow-sm border border-gray-200 overflow-hidden backdrop-blur-sm bg-white/50">
              {isRootPath ? <WelcomeMessage /> : <Outlet />}
            </div>
            <div className=" rounded-2xl shadow-sm border border-gray-200 overflow-hidden backdrop-blur-sm bg-white/50">
              <RevenueDashboard />
            </div>
          </div>
        </main>
        <Toaster position="top-right" />
      </div>
    </div>
  );
};

export default AdminDashboard;