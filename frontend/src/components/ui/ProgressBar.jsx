import React from 'react';

const ProgressBar = ({ value = 0, max = 100, className = '', showLabel = true, color = 'focus' }) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colors = {
    focus: 'bg-focus-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm text-calm-600 dark:text-calm-400 mb-1">
          <span>{Math.round(percentage)}%</span>
          <span>{value}/{max}</span>
        </div>
      )}
      <div className="w-full bg-calm-200 dark:bg-calm-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ease-out ${colors[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;