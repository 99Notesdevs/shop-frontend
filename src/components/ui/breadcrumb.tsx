import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

type BreadcrumbItem = {
  label: string;
  href: string;
};

export function Breadcrumb() {
  const location = useLocation();
  
  // Generate breadcrumb items based on the current path
  const pathnames = location.pathname.split('/').filter((x) => x);
  
  const items: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    ...pathnames.map((name, index) => {
      const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
      return {
        label: name.charAt(0).toUpperCase() + name.slice(1),
        href: routeTo
      };
    })
  ];

  return (
    <nav className="flex items-center text-sm text-gray-600" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index === 0 ? (
              <Link to="/" className="text-gray-500 hover:text-gray-700">
                <Home className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
                <Link
                  to={item.href}
                  className={`${index === items.length - 1 ? 'text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                  aria-current={index === items.length - 1 ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
