import { ChevronRight } from 'lucide-react';
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
        label: name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        href: routeTo
      };
    })
  ];

  return (
    <nav className="flex items-center text-sm text-gray-600" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />}
            <Link
              to={item.href}
              className={`hover:text-gray-900 ${index === items.length - 1 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}
              aria-current={index === items.length - 1 ? 'page' : undefined}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
