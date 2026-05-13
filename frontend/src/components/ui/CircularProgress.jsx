import React from 'react';

const CircularProgress = ({ 
  value = 0, 
  size = 120, 
  strokeWidth = 8, 
  className = '',
  children,
  color = 'focus'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  
  const colors = {
    focus: 'stroke-focus-500',
    success: 'stroke-green-500',
    warning: 'stroke-yellow-500',
    danger: 'stroke-red-500',
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-calm-200 dark:text-calm-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${colors[color]} transition-all duration-500 ease-out`}
          style={{
            filter: 'drop-shadow(0 0 8px rgba(14, 165, 233, 0.3))',
          }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
};

export default CircularProgress;