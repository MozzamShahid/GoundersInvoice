import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StorageService } from '../utils/storage';
import { format, subDays, parseISO } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tab } from '@headlessui/react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [invoices, setInvoices] = useState(() => StorageService.getInvoices());
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [dateRange, setDateRange] = useState('week');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and sort invoices
  const filteredInvoices = invoices.filter(invoice => {
    const matchesFilter = filter === 'all' || invoice.status === filter;
    const matchesSearch = searchTerm === '' || 
      invoice.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'amount':
        return b.total - a.total;
      case 'client':
        return (a.clientName || '').localeCompare(b.clientName || '');
      default:
        return 0;
    }
  });

  // Handle delete
  const handleDelete = (e, invoiceId) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      if (StorageService.deleteInvoice(invoiceId)) {
        setInvoices(StorageService.getInvoices());
      }
    }
  };

  // Calculate statistics
  const stats = {
    totalInvoices: invoices.length,
    totalAmount: invoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
    paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
    pendingAmount: invoices
      .filter(inv => inv.status === 'pending')
      .reduce((sum, inv) => sum + (inv.total || 0), 0),
  };

  // Generate chart data
  const getChartData = () => {
    const days = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 365;
    const data = Array.from({ length: days }).map((_, i) => {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const dayInvoices = invoices.filter(inv => {
        const invDate = inv.createdAt ? format(new Date(inv.createdAt), 'yyyy-MM-dd') : null;
        return invDate === dateStr;
      });

      return {
        date: format(date, 'MMM dd'),
        amount: dayInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0),
        count: dayInvoices.length,
      };
    }).reverse();

    return data;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">Track and manage your invoices</p>
          </div>
          <Link
            to="/invoice/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            New Invoice
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Total Invoices',
              value: stats.totalInvoices,
              change: '+12%',
              changeType: 'positive',
            },
            {
              title: 'Total Amount',
              value: `$${stats.totalAmount.toFixed(2)}`,
              change: '+8%',
              changeType: 'positive',
            },
            {
              title: 'Paid Invoices',
              value: stats.paidInvoices,
              change: '+23%',
              changeType: 'positive',
            },
            {
              title: 'Pending Amount',
              value: `$${stats.pendingAmount.toFixed(2)}`,
              change: '-5%',
              changeType: 'negative',
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
              <div className="mt-2 flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <span className={`ml-2 text-sm ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Revenue Overview</h2>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="rounded-md border-gray-300"
              >
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="year">Last year</option>
              </select>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getChartData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => `$${value.toFixed(2)}`}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorAmount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-4 w-full sm:w-auto">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-md border-gray-300"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="draft">Draft</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-md border-gray-300"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="client">Sort by Client</option>
              </select>
            </div>
            <div className="w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Invoice List with Tabs */}
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6">
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                ${selected
                  ? 'bg-white shadow text-blue-700'
                  : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                }`
              }
            >
              Recent
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                ${selected
                  ? 'bg-white shadow text-blue-700'
                  : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                }`
              }
            >
              Pending
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                ${selected
                  ? 'bg-white shadow text-blue-700'
                  : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                }`
              }
            >
              Paid
            </Tab>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <div className="space-y-4">
                {sortedInvoices.map((invoice) => (
                  <div key={invoice.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <div className="p-4 sm:p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-center">
                        <div className="sm:col-span-2">
                          <h3 className="text-lg font-semibold text-gray-900">{invoice.id}</h3>
                          <p className="text-gray-500">{invoice.clientName || 'No Client Name'}</p>
                        </div>
                        <div className="flex justify-between sm:block">
                          <p className="text-gray-900">${invoice.total?.toFixed(2)}</p>
                          <p className="text-gray-500">
                            Due {new Date(invoice.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                            invoice.status === 'paid' 
                              ? 'bg-green-100 text-green-800'
                              : invoice.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {invoice.status}
                          </span>
                        </div>
                        <div className="sm:col-span-2 flex justify-end">
                          <Link
                            to={`/invoice/${invoice.id}`}
                            className="text-blue-600 hover:text-blue-800 mr-4"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={(e) => handleDelete(e, invoice.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="space-y-4">
                {sortedInvoices
                  .filter(inv => inv.status === 'pending')
                  .map((invoice) => (
                    <div key={invoice.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                      <div className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-center">
                          <div className="sm:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900">{invoice.id}</h3>
                            <p className="text-gray-500">{invoice.clientName || 'No Client Name'}</p>
                          </div>
                          <div className="flex justify-between sm:block">
                            <p className="text-gray-900">${invoice.total?.toFixed(2)}</p>
                            <p className="text-gray-500">
                              Due {new Date(invoice.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                              invoice.status === 'paid' 
                                ? 'bg-green-100 text-green-800'
                                : invoice.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {invoice.status}
                            </span>
                          </div>
                          <div className="sm:col-span-2 flex justify-end">
                            <Link
                              to={`/invoice/${invoice.id}`}
                              className="text-blue-600 hover:text-blue-800 mr-4"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={(e) => handleDelete(e, invoice.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="space-y-4">
                {sortedInvoices
                  .filter(inv => inv.status === 'paid')
                  .map((invoice) => (
                    <div key={invoice.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                      <div className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-center">
                          <div className="sm:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900">{invoice.id}</h3>
                            <p className="text-gray-500">{invoice.clientName || 'No Client Name'}</p>
                          </div>
                          <div className="flex justify-between sm:block">
                            <p className="text-gray-900">${invoice.total?.toFixed(2)}</p>
                            <p className="text-gray-500">
                              Due {new Date(invoice.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                              invoice.status === 'paid' 
                                ? 'bg-green-100 text-green-800'
                                : invoice.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {invoice.status}
                            </span>
                          </div>
                          <div className="sm:col-span-2 flex justify-end">
                            <Link
                              to={`/invoice/${invoice.id}`}
                              className="text-blue-600 hover:text-blue-800 mr-4"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={(e) => handleDelete(e, invoice.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default Dashboard; 