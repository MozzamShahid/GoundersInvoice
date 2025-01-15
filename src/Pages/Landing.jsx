import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Landing = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section with Animation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white"
        >
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
        </motion.div>

        {/* Statistics Section */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { number: '10K+', label: 'Invoices Generated' },
                { number: '5K+', label: 'Happy Users' },
                { number: '99%', label: 'Satisfaction Rate' },
                { number: '24/7', label: 'Customer Support' },
              ].map((stat, index) => (
                <div 
                  key={index}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
              What Our Users Say
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: 'John Doe',
                  role: 'Freelancer',
                  image: 'https://randomuser.me/api/portraits/men/1.jpg',
                  quote: 'The best invoice generator I\'ve ever used. Simple and professional.',
                },
                {
                  name: 'Jane Smith',
                  role: 'Small Business Owner',
                  image: 'https://randomuser.me/api/portraits/women/1.jpg',
                  quote: 'Saves me hours every month. The templates are beautiful.',
                },
                {
                  name: 'Mike Johnson',
                  role: 'Consultant',
                  image: 'https://randomuser.me/api/portraits/men/2.jpg',
                  quote: 'Perfect for my consulting business. Highly recommended!',
                },
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white p-6 rounded-xl shadow-lg"
                >
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-gray-600 text-sm">{testimonial.role}</div>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Comparison */}
        <div className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
              Choose Your Plan
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Free',
                  price: '$0',
                  features: ['5 invoices/month', 'Basic templates', 'Email support'],
                },
                {
                  name: 'Pro',
                  price: '$9.99',
                  features: ['Unlimited invoices', 'Premium templates', 'Priority support', 'Custom branding'],
                  popular: true,
                },
                {
                  name: 'Enterprise',
                  price: '$29.99',
                  features: ['Everything in Pro', 'API access', 'Team management', 'Custom development'],
                },
              ].map((plan, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -10 }}
                  className={`${
                    plan.popular ? 'border-2 border-blue-500 scale-105' : 'border border-gray-200'
                  } rounded-xl p-8 bg-white relative`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-xl rounded-tr-xl text-sm">
                      Popular
                    </div>
                  )}
                  <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                  <div className="text-4xl font-bold mb-6">{plan.price}<span className="text-lg text-gray-600">/month</span></div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full py-3 rounded-lg font-semibold ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}>
                    Get Started
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-6">
              {[
                {
                  q: 'How do I get started?',
                  a: 'Simply sign up for a free account and start creating your first invoice in minutes.',
                },
                {
                  q: 'Can I customize the templates?',
                  a: 'Yes, all our templates are fully customizable to match your brand identity.',
                },
                {
                  q: 'Is my data secure?',
                  a: 'We use industry-standard encryption to ensure your data is always safe and secure.',
                },
                {
                  q: 'Do you offer refunds?',
                  a: 'Yes, we offer a 30-day money-back guarantee for all paid plans.',
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={false}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-lg shadow-sm p-6"
                >
                  <h3 className="text-lg font-semibold mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="py-24 bg-blue-600">
          <div className="container mx-auto px-4 text-center text-white">
            <h2 className="text-4xl font-bold mb-8">Stay Updated</h2>
            <p className="text-xl mb-8 text-blue-100">
              Subscribe to our newsletter for the latest updates and features.
            </p>
            <form className="max-w-lg mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-lg text-gray-900"
              />
              <button
                type="submit"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Existing CTA Section */}
      </main>

      <Footer />
    </div>
  );
};

export default Landing; 