// Reusable glassmorphic Card component — Provides standard containers with hover animations, headers, and action buttons.

import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  actionLabel?: string;
  actionHref?: string;
  actionIcon?: ReactNode;
  onClick?: () => void;
}

const Card = ({
  title,
  children,
  className = '',
  actionLabel,
  actionHref,
  actionIcon,
  onClick
}: CardProps) => {
  const renderAction = () => {
    if (!actionLabel) return null;

    const actionContent = (
      <>
        {actionIcon && <span className="mr-1">{actionIcon}</span>}
        {actionLabel}
        {!actionIcon && <ArrowRight size={16} className="ml-1" />}
      </>
    );

    const actionClassName = "flex items-center text-sm text-primary hover:underline";

    if (actionHref) {
      return (
        <Link to={actionHref} className={actionClassName}>
          {actionContent}
        </Link>
      );
    }

    return (
      <button onClick={onClick} className={actionClassName}>
        {actionContent}
      </button>
    );
  };

  return (
    <div 
      className={`glass rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${className}`}
      onClick={onClick}
    >
      {title && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
          <h3 className="text-xl font-semibold text-text">{title}</h3>
          {renderAction()}
        </div>
      )}
      
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;