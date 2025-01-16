import React from 'react';
import ReactDOM from 'react-dom/client';
import 'antd/dist/reset.css';  // or the modern way: import 'antd/dist/antd.css';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

