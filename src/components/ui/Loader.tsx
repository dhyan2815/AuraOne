
const Loader = () => {
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

  const randomPunchline = punchlines[Math.floor(Math.random() * punchlines.length)];

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-white dark:bg-slate-900">
      <div className="w-12 h-12 border-4 border-primary-500 dark:border-primary-400 border-t-transparent rounded-full animate-spin mb-6"></div>
      <p className="text-slate-600 dark:text-slate-400 text-lg font-medium animate-pulse">
        {randomPunchline}
      </p>
    </div>
  )
}

export default Loader
