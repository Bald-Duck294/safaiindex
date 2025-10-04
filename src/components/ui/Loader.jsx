// src/components/ui/Loader.jsx
import React from 'react';

const Loader = ({ 
  size = 'medium', 
  color = '#514b82', 
  className = '', 
  message = '',
  overlay = false 
}) => {
  const sizeClasses = {
    small: 'w-[30px]',
    medium: 'w-[50px]', 
    large: 'w-[70px]',
    xl: 'w-[100px]'
  };

  const loaderClass = `loader ${sizeClasses[size]} ${className}`;

  const loaderElement = (
    <div className="flex flex-col items-center justify-center gap-3 p-5">
      <div 
        className={`${loaderClass} aspect-square relative`}
        style={{
          '--c': `no-repeat radial-gradient(farthest-side, ${color} 92%, transparent)`,
          background: 'var(--c) 50% 0, var(--c) 50% 100%, var(--c) 100% 50%, var(--c) 0 50%',
          backgroundSize: '10px 10px',
          animation: 'spin18 1s infinite linear'
        }}
      >
        <div 
          className="absolute inset-0 m-[3px] rounded-full"
          style={{
            background: `repeating-conic-gradient(transparent 0 35deg, ${color} 0 90deg)`,
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), black 0)',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), black 0)'
          }}
        />
      </div>
      {message && (
        <p className="text-sm text-gray-600 text-center font-medium">
          {message}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
        {loaderElement}
      </div>
    );
  }

  return loaderElement;
};

// Add the keyframes using a style tag
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin18 {
      100% { transform: rotate(0.5turn); }
    }
  `;
  document.head.appendChild(style);
}

export default Loader;
