import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";

interface AuthLayoutProps {
  children: React.ReactNode;
  leftContent?: React.ReactNode;
  navActionLabel?: string;
  navActionTo?: string;
  variant?: "split" | "centered";
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  leftContent, 
  navActionLabel, 
  navActionTo,
  variant = "split"
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="login min-h-screen text-aurora-on-surface" style={{ scrollBehavior: "smooth" }}>
      {/* Background Animated Gradient Mesh */}
      <div className="aurora-mesh fixed inset-0 z-[-1]" aria-hidden="true" />

      {/* Navigation (Only show if navActionTo is provided) */}
      {navActionTo && navActionLabel && (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'glass py-3 border-b border-primary/5' : 'bg-transparent py-6'}`}>
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex items-center justify-between">
            <Link to="/" className="hover:opacity-80 transition-opacity cursor-pointer inline-block">
              <Logo iconClassName="w-8 h-8 sm:w-10 sm:h-10" iconOnly />
            </Link>

            <div className="flex items-center space-x-4 sm:space-x-8">
              <Link
                to={navActionTo}
                className="text-xs sm:text-sm font-bold text-aurora-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest"
              >
                {navActionLabel}
              </Link>
              <Link to="/" className="btn-aurora-secondary px-4 sm:px-8 py-2 sm:py-3 text-xs sm:text-sm">
                Back to Home
              </Link>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <section className={variant === "split" ? "pt-28 pb-16 sm:pt-40 sm:pb-32" : "flex items-center justify-center min-h-screen px-4 py-8 relative overflow-hidden"}>
        <div className={variant === "split" ? "max-w-[1440px] mx-auto px-4 sm:px-6" : "w-full max-w-md relative z-10 mx-auto"}>
          {variant === "split" ? (
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              {leftContent}
              {children}
            </div>
          ) : (
            children
          )}
        </div>
      </section>

      {/* Enhanced Footer (Only show if split) */}
      {variant === "split" && (
        <footer className="py-10 sm:py-20 border-t border-primary/5">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-8">
            <Logo iconClassName="w-8 h-8" iconOnly />
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-primary/40 text-center sm:text-left">
              &copy; 2026 AuraOne. Developed by Dhyan Patel
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default AuthLayout;
