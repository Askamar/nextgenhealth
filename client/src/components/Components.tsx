import React from 'react';

export const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
    {children}
  </div>
);

export const Button = ({ 
  children, 
  variant = 'primary', 
  className = '',
  onClick,
  type = 'button',
  disabled = false
}: any) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2";
  const variants = {
    primary: "bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/30",
    secondary: "bg-white border border-gray-200 text-slate-700 hover:bg-gray-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    ghost: "text-slate-600 hover:bg-slate-100"
  };

  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

export const Badge = ({ children, color = 'blue' }: { children: React.ReactNode, color?: string }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    red: 'bg-red-50 text-red-700',
    gray: 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
};

export const PageHeader = ({ title, subtitle, action }: any) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {action}
    </div>
);