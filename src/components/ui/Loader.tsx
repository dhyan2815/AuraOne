// Full-screen loader — pulsing blob with "Mapping your day…".

const Loader = () => {
  return (
    <div className="sec-today fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-water" role="status">
      <div className="lm-blob lm-pulse h-24 w-24" />
      <p className="lm-display text-4xl text-ink">Mapping your day…</p>
    </div>
  );
};

export default Loader;
