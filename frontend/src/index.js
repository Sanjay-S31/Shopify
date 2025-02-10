import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthContextProvider } from './context/AuthContext'
import { ProductContextProvider } from './context/ProductsContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthContextProvider>
    <ProductContextProvider>
      <App />
    </ProductContextProvider>
  </AuthContextProvider>
);
