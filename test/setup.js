// test/setup.js
import { JSDOM } from 'jsdom';
import React from 'react';
import { stub } from 'sinon';

// --- JSDOM Configuration ---
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });

global.window = dom.window;
global.document = dom.window.document;
global.React = React;

// --- Global Navigator ---
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'node.js',
    geolocation: {
      getCurrentPosition: (success, error) => {
        success({ coords: { latitude: 51.5074, longitude: -0.1278 } });
      }
    }
  },
  writable: true,
});

// --- Mock Vite's import.meta.env ---
// This is a workaround to make Vite-specific code work in a Node.js test environment.
// We are dynamically importing the module loader to patch it.
(async () => {
    const { default: module } = await import('module');

    // This is a bit of a hack, but it's the most reliable way to mock `import.meta.env`
    // in a Mocha + tsx + ESM environment.
    module.prototype.import = function (specifier, options) {
        if (specifier === 'import.meta') {
            return Promise.resolve({
                env: {
                    DEV: true,
                    PROD: false,
                    VITE_WEATHER_API_KEY: 'test-weather-key',
                    VITE_NEWS_API_KEY: 'test-news-key',
                    VITE_GEMINI_API_KEY: 'test-gemini-key',
                }
            });
        }
        return import(specifier, options);
    };
})();
