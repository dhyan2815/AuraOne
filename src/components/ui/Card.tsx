import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

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
  return (
    <div 
      className={`bg-white dark:bg-slate-800 rounded-lg shadow-card overflow-hidden ${className}`}
      onClick={onClick}
    >
      {title && (
        <div className="flex items-center justify-between px-6 py-4 border-slate-100 dark:border-slate-700">
          <h3 className="text-3xl font-semibold">{title}</h3>
          
          {actionLabel && (
            actionHref ? (
              <Link 
                to={actionHref}
                className="flex items-center text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                {actionIcon && <span className="mr-1">{actionIcon}</span>}
                {actionLabel}
                {!actionIcon && <ChevronRight size={16} className="ml-1" />}
              </Link>
            ) : (
              <button
                className="flex items-center text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                {actionIcon && <span className="mr-1">{actionIcon}</span>}
                {actionLabel}
                {!actionIcon && <ChevronRight size={16} className="ml-1" />}
              </button>
            )
          )}
        </div>
      )}
      
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default Card;