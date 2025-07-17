import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { name: 'HOME', path: '/' },
    { name: 'BOOKS', path: '/books' },
    { name: 'TEST SERIES', path: '/test-series' },
    { name: 'NOTES', path: '/notes' },
    { name: 'CHECKOUT', path: '/checkout' },
    { name: 'CART', path: '/cart' },
    { name: 'CONTACT US', path: '/contact' },
    { name: 'CURRENT AFFAIRS', path: '/current-affairs' },
  ];
  
  // ... rest of your component

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    isActive
                      ? 'text-orange-500 border-b-2 border-orange-500'
                      : 'text-gray-700 hover:text-gray-900 hover:border-gray-300'
                  }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
      </div>    </nav>
  );
};

export default Navigation;