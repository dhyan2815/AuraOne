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
  return (
    <div 
      className={`bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${className}`}
      onClick={onClick}
    >
      {title && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5">
          <h3 className="text-xl font-semibold text-text dark:text-white">{title}</h3>
          
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
      
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;