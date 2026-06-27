// PostCSS configuration — Preprocesses styles using Tailwind CSS and Autoprefixer.

export default {
  // Register build plugins.
  plugins: {
    tailwindcss: {}, // Compiles tailwind directives into CSS rules.
    autoprefixer: {}, // Vendor-prefixes CSS rules for cross-browser support.
  },
};
