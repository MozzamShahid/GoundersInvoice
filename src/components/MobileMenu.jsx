import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white shadow-lg z-50">
          <div className="px-4 py-2 space-y-2">
            <Link
              to="/dashboard"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/invoice/new"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Create Invoice
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMenu; 