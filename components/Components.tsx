import React from 'react';

export const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`card border-0 premium-card ${className}`}>
    <div className="card-body p-4">
      {children}
    </div>
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
  const baseStyle = "btn d-flex align-items-center justify-content-center gap-2 fw-semibold";
  const variants = {
    primary: "btn-premium-primary text-white shadow-sm",
    secondary: "btn-outline-secondary bg-white border text-dark",
    danger: "btn-danger bg-danger-subtle border-0 text-danger",
    ghost: "btn-link text-decoration-none text-secondary"
  };

  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant as keyof typeof variants] || variants.primary} ${className}`}
    >
      {children}
    </button>
  );
};

export const Badge = ({ children, color = 'blue' }: { children: React.ReactNode, color?: string }) => {
  const colors: Record<string, string> = {
    blue: 'bg-primary-subtle text-primary border border-primary-subtle',
    green: 'bg-success-subtle text-success border border-success-subtle',
    yellow: 'bg-warning-subtle text-warning border border-warning-subtle',
    red: 'bg-danger-subtle text-danger border border-danger-subtle',
    gray: 'bg-light text-dark border',
  };
  return (
    <span className={`badge rounded-pill px-2.5 py-1 text-xs fw-semibold ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
};

export const PageHeader = ({ title, subtitle, action }: any) => (
  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
    <div>
      <h1 className="fs-3 fw-bold text-dark mb-1">{title}</h1>
      {subtitle && <p className="text-muted mb-0 small">{subtitle}</p>}
    </div>
    {action}
  </div>
);
