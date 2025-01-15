import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section with better gradient and layout */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
          <div className="container mx-auto px-4 py-32">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-6xl font-bold mb-8 leading-tight">
                Create Professional
                <span className="block text-blue-200">Invoices in Minutes</span>
              </h1>
              <p className="text-xl text-blue-100 mb-12 leading-relaxed">
                The easiest way to generate beautiful, professional invoices. 
                Choose from multiple templates, customize your design, and manage your billing with ease.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <span>Get Started Free</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  to="/invoice/new"
                  className="w-full sm:w-auto bg-transparent hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all border-2 border-white flex items-center justify-center"
                >
                  <span>Create First Invoice</span>
                  <span className="ml-2">📄</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section with better visuals */}
        <div className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
              Everything You Need for Professional Invoicing
            </h2>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <span className="text-3xl">📝</span>
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">Beautiful Templates</h3>
                <p className="text-gray-600 leading-relaxed">
                  Choose from professionally designed templates that match your brand identity.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <span className="text-3xl">💼</span>
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">Smart Calculations</h3>
                <p className="text-gray-600 leading-relaxed">
                  Automatic tax calculations, discounts, and total summaries.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                  <span className="text-3xl">🚀</span>
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">Instant Download</h3>
                <p className="text-gray-600 leading-relaxed">
                  Generate and download your invoices instantly in perfect format.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section with better visualization */}
        <div className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
              Simple Steps to Create Invoices
            </h2>
            <div className="grid md:grid-cols-4 gap-8 relative">
              {/* Add connecting lines between steps */}
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-blue-100 -z-10"></div>
              
              {[
                { number: "1", title: "Choose Template", desc: "Select your preferred design" },
                { number: "2", title: "Add Details", desc: "Fill in your business info" },
                { number: "3", title: "Customize", desc: "Adjust colors and terms" },
                { number: "4", title: "Download", desc: "Save or print instantly" },
              ].map((step, index) => (
                <div key={index} className="text-center relative">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section with better design */}
        <div className="py-24 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
              Join thousands of businesses who trust our invoice generator for their billing needs.
            </p>
            <Link
              to="/invoice/new"
              className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 px-12 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center"
            >
              <span>Create Your First Invoice</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Landing; 