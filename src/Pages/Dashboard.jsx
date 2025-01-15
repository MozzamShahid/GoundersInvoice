import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StorageService } from '../utils/storage';

const Dashboard = () => {
  const [invoices, setInvoices] = useState(() => StorageService.getInvoices());

  const [filter, setFilter] = useState('all'); // all, paid, pending, draft
  const [sortBy, setSortBy] = useState('date'); // date, amount, client

  const getStatusColor = (status) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      draft: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.draft;
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (filter === 'all') return true;
    return invoice.status === filter;
  });

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date) - new Date(a.date);
      case 'amount':
        return b.total - a.total;
      case 'client':
        return a.clientName.localeCompare(b.clientName);
      default:
        return 0;
    }
  });

  const handleDelete = (e, invoiceId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      if (StorageService.deleteInvoice(invoiceId)) {
        setInvoices(StorageService.getInvoices());
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-500">Manage your invoices</p>
          </div>
          <Link
            to="/invoice/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            New Invoice
          </Link>
        </div>

        {/* Filters and Sorting */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
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
            <div className="text-gray-500">
              {filteredInvoices.length} invoices found
            </div>
          </div>
        </div>

        {/* Invoice List */}
        <div className="space-y-4">
          {sortedInvoices.map((invoice) => (
            <div key={invoice.id} className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-center">
                  <div className="sm:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {invoice.id}
                    </h3>
                    <p className="text-gray-500">{invoice.clientName || 'No Client Name'}</p>
                  </div>
                  <div className="flex justify-between sm:block">
                    <p className="text-gray-900">${invoice.total.toFixed(2)}</p>
                    <p className="text-gray-500">Due {new Date(invoice.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(invoice.status)}`}>
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

          {sortedInvoices.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <h3 className="text-xl font-medium text-gray-900 mb-2">No invoices found</h3>
              <p className="text-gray-500">Create your first invoice to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 