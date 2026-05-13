import React from 'react';

const Button = React.forwardRef(({ 
  className = '', 
  variant = 'default', 
  size = 'default', 
  children, 
  ...props 
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    default: 'bg-focus-600 text-white hover:bg-focus-700 shadow-lg shadow-focus-500/30 hover:shadow-xl hover:shadow-focus-500/40',
    secondary: 'bg-calm-100 text-calm-900 hover:bg-calm-200 dark:bg-calm-800 dark:text-calm-100',
    outline: 'border-2 border-focus-500 text-focus-600 hover:bg-focus-50 dark:hover:bg-focus-950',
    ghost: 'hover:bg-calm-100 dark:hover:bg-calm-800',
    destructive: 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30',
  };
  
  const sizes = {
    default: 'h-11 px-6 py-2',
    sm: 'h-9 px-4 text-sm',
    lg: 'h-14 px-8 text-lg',
    icon: 'h-10 w-10',
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
