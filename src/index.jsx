import React from 'react';
import { createRoot } from 'react-dom/client';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
