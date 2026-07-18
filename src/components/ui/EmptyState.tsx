import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLink?: string;
  actionLabel?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, actionLink, actionLabel }) => {
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center py-20 sm:py-24 gap-4 text-center glass rounded-2xl sm:rounded-[2rem] border-dashed border-primary/20 p-6"
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary/40 mb-2">
        {icon}
      </div>
      <p className="text-lg sm:text-xl font-bold text-text">{title}</p>
      <p className="text-xs sm:text-sm text-text-variant max-w-xs mx-auto">
        {description}
      </p>
      {actionLink && actionLabel && (
        <Link to={actionLink} className="mt-2 sm:mt-4">
          <button className="btn-aurora px-8 sm:px-10 py-2.5 sm:py-3 text-xs">
            {actionLabel}
          </button>
        </Link>
      )}
    </motion.div>
  );
};

export default EmptyState;
