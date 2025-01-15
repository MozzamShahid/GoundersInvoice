import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className={`w-full ${isHome ? 'absolute top-0 left-0' : 'bg-white shadow-sm'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">📄</span>
            <span className={`font-bold text-xl ${isHome ? 'text-white' : 'text-gray-900'}`}>
              InvoiceGen
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/dashboard" 
              className={`${isHome ? 'text-white' : 'text-gray-600'} hover:text-gray-900`}
            >
              Dashboard
            </Link>
            <Link 
              to="/invoice/new" 
              className={`${
                isHome 
                  ? 'bg-white text-blue-600 hover:bg-gray-50' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } px-4 py-2 rounded-lg transition-colors`}
            >
              Create Invoice
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 