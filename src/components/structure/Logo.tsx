import React from 'react';

interface LogoProps {
  className?: string;     // Wrapper classes
  iconClassName?: string; // Icon classes
  textClassName?: string; // Text classes
  iconOnly?: boolean;     // Whether to hide the text
  textOnly?: boolean;     // Whether to hide the icon
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
      {/* Bioluminescent Neural Node Icon */}
      {!textOnly && (
        <svg 
          className={`${iconClassName} drop-shadow-[0_0_10px_rgba(163,166,255,0.4)]`} 
          fill="none" 
          viewBox="0 0 200 200" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="primaryGradient" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#a3a6ff"></stop>
              <stop offset="100%" stopColor="#5356a9"></stop>
            </linearGradient>
            <linearGradient id="secondaryGradient" x1="100%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#52ddfc"></stop>
              <stop offset="100%" stopColor="#00687a"></stop>
            </linearGradient>
            <filter height="140%" id="glowEffect" width="140%" x="-20%" y="-20%">
              <feGaussianBlur result="blur" stdDeviation="4"></feGaussianBlur>
              <feComposite in="SourceGraphic" in2="blur" operator="over"></feComposite>
            </filter>
          </defs>
          <circle cx="100" cy="100" opacity="0.3" r="85" stroke="url(#secondaryGradient)" strokeDasharray="4 8" strokeWidth="0.5"></circle>
          <circle cx="100" cy="100" opacity="0.5" r="70" stroke="url(#primaryGradient)" strokeDasharray="20 10" strokeWidth="1"></circle>
          <g filter="url(#glowEffect)">
            <circle cx="100" cy="100" fill="url(#primaryGradient)" fillOpacity="0.15" r="35"></circle>
            <circle cx="115" cy="85" fill="url(#secondaryGradient)" fillOpacity="0.2" r="25"></circle>
            <path d="M100 40 C 130 40, 160 70, 160 100 S 130 160, 100 160 S 40 130, 40 100 S 70 40, 100 40" stroke="url(#primaryGradient)" strokeLinecap="round" strokeWidth="2.5"></path>
            <path d="M100 65 C 120 65, 135 80, 135 100 S 120 135, 100 135 S 65 120, 65 100 S 80 65, 100 65" stroke="url(#secondaryGradient)" strokeLinecap="round" strokeWidth="1.5"></path>
            <circle cx="100" cy="100" fill="#f2effb" r="6"></circle>
            <circle cx="135" cy="100" fill="#52ddfc" r="3"></circle>
            <circle cx="65" cy="100" fill="#a3a6ff" r="3"></circle>
            <circle cx="100" cy="65" fill="#52ddfc" r="3"></circle>
            <circle cx="100" cy="135" fill="#a3a6ff" r="3"></circle>
          </g>
          <line opacity="0.6" stroke="#a3a6ff" strokeWidth="0.5" x1="100" x2="100" y1="65" y2="40"></line>
          <line opacity="0.6" stroke="#a3a6ff" strokeWidth="0.5" x1="100" x2="100" y1="135" y2="160"></line>
          <line opacity="0.6" stroke="#52ddfc" strokeWidth="0.5" x1="65" x2="40" y1="100" y2="100"></line>
          <line opacity="0.6" stroke="#52ddfc" strokeWidth="0.5" x1="135" x2="160" y1="100" y2="100"></line>
        </svg>
      )}
      
      {/* Wordmark */}
      {!iconOnly && (
        <span className={`${textClassName} font-bold tracking-tighter drop-shadow-[0_0_10px_rgba(163,166,255,0.3)]`}>
          <span className="text-[#a3a6ff]">Aura</span><span className="italic text-[#52ddfc] font-light">One</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
