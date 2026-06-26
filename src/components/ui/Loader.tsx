// Full-Screen Loader component — Displays a premium backdrop-blur screen with a pulsing logo and rotating motivational quotes.

import Logo from '../structure/Logo';

const Loader = () => {
  // Array of rotating productivity quotes displayed to the user during load states.
  const punchlines = [
    "Loading your awesome tasks...",
    "Brewing some productivity...",
    "Assembling your digital workspace...",
    "Charging up your motivation...",
    "Preparing your success toolkit...",
    "Loading brilliance in progress...",
    "Crafting your perfect workflow...",
    "Spinning up your productivity engine...",
    "Gathering your creative energy...",
    "Preparing your command center..."
  ];

  // Select a random string from the quotes list.
  const randomPunchline = punchlines[Math.floor(Math.random() * punchlines.length)];

  return (
    // Fixed backdrop blurring overlay container.
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm">
      {/* Pulse the brand logo to indicate active background loading processes. */}
      <div className="mb-8 animate-pulse">
        <Logo iconOnly iconClassName="w-20 h-20 drop-shadow-[0_0_20px_rgba(163,166,255,0.6)]" />
      </div>
      <p className="text-text/80 dark:text-white/80 text-lg font-medium animate-pulse">
        {randomPunchline}
      </p>
    </div>
  )
}

export default Loader;
