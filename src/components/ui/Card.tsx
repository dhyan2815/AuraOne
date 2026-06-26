// Reusable glassmorphic Card component — Provides standard containers with hover animations, headers, and action buttons.

import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Data shape for the reusable Card properties.
interface CardProps {
  title?: string; // Optional card header title.
  children: ReactNode; // Sub-components rendered inside the card body.
  className?: string; // Additional classes for custom layout overrides.
  actionLabel?: string; // Text for the header action link/button.
  actionHref?: string; // Navigation endpoint target for anchor tag behavior.
  actionIcon?: ReactNode; // Prefix/suffix icon to render beside the action text.
  onClick?: () => void; // Triggered when card wrapper or button gets clicked.
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
  return (
    // Outer card container styled with glassmorphism effects and custom timing transitions.
    <div 
      className={`glass rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${className}`}
      onClick={onClick}
    >
      {/* Conditional header block. */}
      {title && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
          <h3 className="text-xl font-semibold text-text">{title}</h3>
          
          {/* Conditionally render router navigation link or simple button. */}
          {actionLabel && (
            actionHref ? (
              <Link 
                to={actionHref}
                className="flex items-center text-sm text-primary hover:underline"
              >
                {actionIcon && <span className="mr-1">{actionIcon}</span>}
                {actionLabel}
                {!actionIcon && <ArrowRight size={16} className="ml-1" />}
              </Link>
            ) : (
              <button
                onClick={onClick}
                className="flex items-center text-sm text-primary hover:underline"
              >
                {actionIcon && <span className="mr-1">{actionIcon}</span>}
                {actionLabel}
                {!actionIcon && <ArrowRight size={16} className="ml-1" />}
              </button>
            )
          )}
        </div>
      )}
      
      {/* Card body container. */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;