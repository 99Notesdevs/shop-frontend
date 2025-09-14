import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseStyles = 'rounded-md font-medium transition-colors duration-200 cursor-pointer';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
    const variantStyles = {
    primary: 'bg-[var(--button)] text-white shadow-md hover:from-yellow-500 hover:via-orange-500 hover:to-yellow-600 focus:ring-2 focus:ring-orange-300',
    secondary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-indigo-300',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-300'
  };

  return (
    <button 
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};