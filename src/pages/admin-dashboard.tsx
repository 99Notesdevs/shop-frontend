import { Outlet, useLocation, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { FiPlus, FiList } from 'react-icons/fi';

const WelcomeMessage = () => (
  <div className="p-8 text-center">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Admin Dashboard</h1>
    <p className="text-gray-600 mb-8">Manage the test portal from here. Get started with the following actions:</p>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
      <Link 
        to="/admin/add-product" 
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col items-center text-center"
      >
        <div className="bg-blue-100 p-3 rounded-full mb-4">
          <FiPlus className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="font-medium text-gray-800 mb-1">Add Product</h3>
        <p className="text-sm text-gray-500">Create new Products</p>
      </Link>

      <Link 
        to="/admin/manage-product" 
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col items-center text-center"
      >
        <div className="bg-green-100 p-3 rounded-full mb-4">
          <FiList className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="font-medium text-gray-800 mb-1">Manage Product </h3>
        <p className="text-sm text-gray-500">View and modify products</p>
      </Link>

      <Link 
        to="/admin/add-category" 
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col items-center text-center"
      >
        <div className="bg-purple-100 p-3 rounded-full mb-4">
          <FiPlus className="h-6 w-6 text-purple-600" />
        </div>
        <h3 className="font-medium text-gray-800 mb-1">Create Category</h3>
        <p className="text-sm text-gray-500">Set up a new category</p>
      </Link>
    </div>
  </div>
);

const AdminDashboard = () => {
  const location = useLocation();
  const isRootPath = location.pathname === '/admin' || location.pathname === '/admin/';

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {isRootPath ? <WelcomeMessage /> : <Outlet />}
            </div>
          </div>
        </main>
        <Toaster position="top-right" />
      </div>
    </div>
  );
};

export default AdminDashboard;