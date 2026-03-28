// test/setup.js
import { JSDOM } from 'jsdom';
import React from 'react';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });

global.window = dom.window;
global.document = dom.window.document;
global.React = React;

// Define a writable navigator property
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'node.js',
  },
  writable: true,
});
