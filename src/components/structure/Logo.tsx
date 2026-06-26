// Brand Logo Component — Renders the AuraOne logo using a gradient-filled SVGs representing an orbit / neural connection.

import React from 'react';

// Configuration properties for rendering options of the logo and name text.
interface LogoProps {
  className?: string;     // Custom outer wrapper styling class.
  iconClassName?: string; // Custom classes for the SVG element.
  textClassName?: string; // Custom classes for brand text.
  iconOnly?: boolean;     // Toggle to render only the SVG icon.
  textOnly?: boolean;     // Toggle to render only the text label.
}

const Logo: React.FC<LogoProps> = ({ 
  className = '',
  iconClassName = 'w-8 h-8',
  textClassName = 'text-xl',
  iconOnly = false,
  textOnly = false
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Render the neural network/orbit design elements inside SVG wrapper. */}
      {!textOnly && (
        <svg 
          className={iconClassName} 
          viewBox="0 0 100 100" 
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main orbit circles. */}
          <circle cx="50" cy="50" r="45" fill="url(#logoGradient)" fillOpacity="0.1" />
          <circle cx="50" cy="50" r="30" stroke="url(#logoGradient)" strokeWidth="3" />
          {/* Orbit node junctions representing AI neurons. */}
          <circle cx="50" cy="30" r="5" fill="#a3a6ff" />
          <circle cx="50" cy="70" r="5" fill="#a3a6ff" />
          <circle cx="30" cy="50" r="5" fill="#52ddfc" />
          <circle cx="70" cy="50" r="5" fill="#52ddfc" />
          <circle cx="50" cy="50" r="8" fill="#6366f1" />
          {/* Logo linear color gradient definition. */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>
      )}
      
      {/* Render brand text "AuraOne" with custom theme styling. */}
      {!iconOnly && (
        <span className={`${textClassName} font-bold tracking-tight`}>
          <span className="text-indigo-500">Aura</span><span className="text-cyan-400 italic font-light">One</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
