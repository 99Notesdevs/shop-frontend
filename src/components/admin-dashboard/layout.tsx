import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { 
  FiPlus, FiEdit, FiList, FiSettings, 
  FiChevronLeft, FiMenu, FiX, FiUser, FiLogOut,FiMessageCircle
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isCollapsed, toggleSidebar }: { isCollapsed: boolean; toggleSidebar: () => void }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const location = useLocation();

  const menuItems = [
    {
      category: 'Product Management',
      icon: FiList,
      items: [
        { icon: FiPlus, text: 'Add Product', path: '/admin/add-product' },
        { icon: FiPlus, text: 'Add Category', path: '/admin/add-category' },
        { icon: FiList, text: 'Manage Product', path: '/admin/manage-product' },
        { icon: FiEdit, text: 'Manage Category', path: '/admin/manage-category' },
      ],
    },
    {
      category: 'Administration',
      icon: FiSettings,
      items: [
        { icon: FiSettings, text: 'Admin Panel', path: '/admin' },
        {icon: FiMessageCircle, text:'Offer Message', path:'/admin/offer-message'},
        {icon: FiList, text:'Manage Orders', path:'/admin/manage-orders'},
      ],
    },
  ];

  useEffect(() => {
    // Set active section based on current route
    const currentSection = menuItems.find(section => 
      section.items.some(item => location.pathname.includes(item.path))
    );
    if (currentSection) {
      setActiveSection(currentSection.category);
    }
  }, [location.pathname]);

  const toggleSection = (category: string) => {
    setActiveSection(activeSection === category ? null : category);
  };

  return (
    <div 
      className={`h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Admin Panel
          </h1>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700"
        >
          {isCollapsed ? <FiMenu size={20} /> : <FiX size={20} />}
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((section, index) => (
          <div key={index} className="mb-2">
            {!isCollapsed && (
              <button
                onClick={() => toggleSection(section.category)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                <div className="flex items-center">
                  <section.icon className="mr-3 h-5 w-5" />
                  <span>{section.category}</span>
                </div>
                <FiChevronLeft 
                  className={`h-4 w-4 transition-transform duration-200 ${
                    activeSection === section.category ? 'transform rotate-90' : ''
                  }`} 
                />
              </button>
            )}
            
            {(isCollapsed || activeSection === section.category) && (
              <ul className={`mt-1 ${isCollapsed ? 'space-y-2' : 'pl-11 pr-2'} space-y-1`}>
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center ${isCollapsed ? 'justify-center px-3 py-3' : 'px-3 py-2'} text-sm font-medium rounded-md transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                      }
                      title={isCollapsed ? item.text : undefined}
                    >
                      <item.icon className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5`} />
                      {!isCollapsed && <span>{item.text}</span>}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>
      
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
            <FiUser className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Admin User</p>
              <button 
                onClick={async (e) => {
                  e.preventDefault();
                  try {
                    await logout();
                    navigate('/admin/login');
                  } catch (error) {
                    console.error('Logout failed:', error);
                  }
                }}
                className="flex items-center text-xs text-gray-500 hover:text-gray-700"
              >
                <FiLogOut className="mr-1 h-3 w-3" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



interface AdminLayoutProps {
  children?: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="relative flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - positioned absolutely on mobile, fixed on larger screens */}
      <div 
        className={`fixed md:relative z-20 h-full transition-transform duration-300 ease-in-out ${
          isSidebarCollapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'
        }`}
      >
        <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      </div>
      
      {/* Overlay for mobile when sidebar is open */}
      {!isSidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header with hamburger button */}
        <header className="md:hidden bg-white border-b border-gray-200 p-2 z-10">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle menu"
          >
            <FiMenu className="h-6 w-6" />
          </button>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 w-full transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;