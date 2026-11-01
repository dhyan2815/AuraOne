// Loaders — full-screen pulsing blob with "Mapping your day…", or an inline variant for the page area while a route chunk loads.

interface LoaderProps {
  inline?: boolean; // Render inside the layout instead of covering the screen.
}

const Loader = ({ inline = false }: LoaderProps) => {
  if (inline) {
    // Fade in after a short delay so fast chunk loads don't flash a spinner.
    return (
      <div
        className="grid min-h-[50vh] place-items-center animate-in fade-in fill-mode-both duration-300 delay-200"
        role="status"
        aria-label="Loading page"
      >
        <div className="lm-blob lm-pulse h-16 w-16" />
      </div>
    );
  }

  return (
    <div className="sec-today fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-water" role="status">
      <div className="lm-blob lm-pulse h-24 w-24" />
      <p className="lm-display text-4xl text-ink">Mapping your day…</p>
    </div>
  );
};

export default Loader;
