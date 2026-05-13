import React from 'react';

const Card = React.forwardRef(({ className = '', children, ...props }, ref) => (
  <div
    ref={ref}
    className={`bg-white/90 dark:bg-calm-800/90 backdrop-blur-xl border border-calm-200/50 dark:border-calm-700/50 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/20 p-6 ${className}`}
    {...props}
  >
    {children}
  </div>
));

const CardHeader = React.forwardRef(({ className = '', children, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col space-y-1.5 pb-4 ${className}`}
    {...props}
  >
    {children}
  </div>
));

const CardTitle = React.forwardRef(({ className = '', children, ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-xl font-semibold leading-none tracking-tight text-calm-900 dark:text-calm-100 ${className}`}
    {...props}
  >
    {children}
  </h3>
));

const CardDescription = React.forwardRef(({ className = '', children, ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-calm-600 dark:text-calm-400 ${className}`}
    {...props}
  >
    {children}
  </p>
));

const CardContent = React.forwardRef(({ className = '', children, ...props }, ref) => (
  <div ref={ref} className={`${className}`} {...props}>
    {children}
  </div>
));

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardTitle.displayName = 'CardTitle';
CardDescription.displayName = 'CardDescription';
CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardDescription, CardContent };