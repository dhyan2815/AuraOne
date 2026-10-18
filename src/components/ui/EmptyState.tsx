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
      className="lm-sheet flex flex-col items-center justify-center gap-4 py-16 text-center"
    >
      <div className="lm-blob flex h-24 w-24 items-center justify-center text-[#1F211E]" style={{ animation: 'none' }}>
        {icon}
      </div>
      <p className="lm-display text-4xl text-ink">{title}</p>
      <p className="mx-auto max-w-xs text-ink2">{description}</p>
      {actionLink && actionLabel && (
        <Link to={actionLink} className="lm-btn mt-2">
          {actionLabel}
        </Link>
      )}
    </motion.div>
  );
};

export default EmptyState;
