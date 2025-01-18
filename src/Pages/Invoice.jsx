import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { invoiceTemplates } from '../data/invoiceTemplates';
import StorageService from '../services/StorageService';
import { motion } from 'framer-motion';
import { loadProductsFromCSV } from '../utils/csvLoader';

const Invoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const existingInvoice = id ? StorageService.getInvoices().find(inv => inv.id === id) : null;

  const { register, handleSubmit, control, watch, setValue, formState: { isDirty, isSubmitting } } = useForm({
    defaultValues: existingInvoice || {
      id: StorageService.getNextInvoiceNumber(),
      invoiceItems: [{ description: '', quantity: 1, amount: 0, isCustomText: false }],
      customItems: [],
      gstRate: 10,
      discountRate: 0,
      status: 'draft',
      template: 'professional',
      clientName: '',
      clientAddress: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      bankDetails: invoiceTemplates.professional.bankDetails,
      terms: invoiceTemplates.professional.terms,
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "invoiceItems"
  });

  // Separate field array for custom entries
  const { fields: customFields, append: appendCustom, remove: removeCustom } = useFieldArray({
    control,
    name: "customItems"  // separate field for custom entries
  });

  // Watch values for calculations
  const invoiceItems = watch('invoiceItems') || [];
  const gstRate = Number(watch('gstRate')) || 0;
  const discountRate = Number(watch('discountRate')) || 0;

  const calculateTotals = () => {
    const invoiceItems = watch('invoiceItems') || [];
    const customItems = watch('customItems') || [];
    
    const subtotal = [...invoiceItems, ...customItems].reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const amount = Number(item.amount) || 0;
      return sum + (quantity * amount);
    }, 0);
    
    const gst = (subtotal * gstRate) / 100;
    const discount = (subtotal * discountRate) / 100;
    const total = subtotal + gst - discount;

    return { subtotal, gst, discount, total };
  };

  const { subtotal, gst, discount, total } = calculateTotals();

  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      const loadedProducts = await loadProductsFromCSV();
      setProducts(loadedProducts);
    };
    loadProducts();
  }, []);

  // Add this function to handle product selection with better error handling
  const handleProductSelect = (index, productData) => {
    if (!productData) {
      // If Text Only selected, just clear the fields for manual entry
      setValue(`invoiceItems.${index}.description`, '');
      setValue(`invoiceItems.${index}.quantity`, '');
      setValue(`invoiceItems.${index}.amount`, '');
      return;
    }
    
    // If product selected, fill in the product details
    setValue(`invoiceItems.${index}.description`, productData.title);
    setValue(`invoiceItems.${index}.quantity`, productData.qty);
    setValue(`invoiceItems.${index}.amount`, productData.variantPrice);
  };

  const onSubmit = async (data) => {
    try {
      const invoiceData = {
        ...data,
        id: id || StorageService.getNextInvoiceNumber(),
        subtotal,
        gst,
        discount,
        total,
        createdAt: existingInvoice?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (StorageService.saveInvoice(invoiceData)) {
        navigate('/dashboard', { state: { message: 'Invoice saved successfully!' } });
      } else {
        throw new Error('Failed to save invoice');
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Error saving invoice. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="invoice min-h-screen bg-gray-50">
      {/* Editor View (Hidden during print) */}
      <div className="print:hidden">
        {/* Top Action Bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <button
                type="button"
                onClick={() => {
                  if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                    return;
                  }
                  navigate('/dashboard');
                }}
                className="text-gray-600 hover:text-gray-900 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                  )}
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
              </div>
          </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form className="bg-white shadow-sm rounded-lg p-6 space-y-8">
            {/* Template and Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Template</label>
                <select
                  {...register('template')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                >
                  {Object.entries(invoiceTemplates).map(([key, template]) => (
                    <option key={key} value={key}>{template.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  {...register('status')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            {/* Client Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Client Name</label>
                <input
                  {...register('clientName')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Client Address</label>
                <textarea
                  {...register('clientAddress')}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Invoice Date</label>
                <input
                  type="date"
                  {...register('invoiceDate')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  {...register('dueDate')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
            </div>

            {/* Invoice Items */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Invoice Items</h3>
                <button
                  type="button"
                  onClick={() => append({ description: '', quantity: 1, amount: 0 })}
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Item
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium">Product/Service</th>
                      <th className="text-left py-2 font-medium">Description</th>
                      <th className="text-right py-2 font-medium w-24">Quantity</th>
                      <th className="text-right py-2 font-medium w-32">Price</th>
                      <th className="text-right py-2 font-medium w-32">Amount</th>
                      <th className="w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {fields.map((field, index) => {
                      const quantity = Number(watch(`invoiceItems.${index}.quantity`) || 0);
                      const amount = Number(watch(`invoiceItems.${index}.amount`) || 0);
                      const itemTotal = quantity * amount;

                      return (
                        <tr key={field.id}>
                          <td className="py-2">
                            <select
                              onChange={(e) => {
                                const product = products.find(p => p.srNo === Number(e.target.value));
                                handleProductSelect(index, product);
                              }}
                              className="w-full border-gray-300 rounded-md shadow-sm"
                            >
                              <optgroup label="Products">
                                {products.map((product) => (
                                  <option key={product.srNo} value={product.srNo}>
                                    {product.title}
                                  </option>
                                ))}
                              </optgroup>
                            </select>
                          </td>
                          <td className="py-2">
                            <input
                              {...register(`invoiceItems.${index}.description`)}
                              className="w-full border-0 focus:ring-0 p-0"
                              placeholder="Enter description"
                            />
                          </td>
                          <td className="py-2">
                            <input
                              type="number"
                              {...register(`invoiceItems.${index}.quantity`, {
                                setValueAs: v => v === "" ? 0 : Number(v),
                                onChange: (e) => {
                                  const value = e.target.value;
                                  if (value === "") {
                                    setValue(`invoiceItems.${index}.quantity`, 0);
                                  } else {
                                    setValue(`invoiceItems.${index}.quantity`, Number(value));
                                  }
                                }
                              })}
                              className="w-full text-right border-0 focus:ring-0 p-0"
                              min="0"
                              step="1"
                              placeholder="0"
                            />
                          </td>
                          <td className="py-2">
                            <div className="flex items-center justify-end">
                              <span className="text-gray-500 mr-1">$</span>
                              <input
                                type="number"
                                {...register(`invoiceItems.${index}.amount`, {
                                  setValueAs: v => v === "" ? 0 : Number(v),
                                  onChange: (e) => {
                                    const value = e.target.value;
                                    if (value === "") {
                                      setValue(`invoiceItems.${index}.amount`, 0);
                                    } else {
                                      setValue(`invoiceItems.${index}.amount`, Number(value));
                                    }
                                  }
                                })}
                                className="w-24 text-right border-0 focus:ring-0 p-0"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                              />
                            </div>
                          </td>
                          <td className="py-2 text-right text-gray-700">
                            ${itemTotal.toFixed(2)}
                          </td>
                          <td className="py-2 text-right">
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Custom Items Section */}
            <div className="mt-8">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Additional Items</h3>
                <button
                  type="button"
                  onClick={() => appendCustom({ description: '', quantity: 1, amount: 0 })}
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Item
                </button>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium">Description</th>
                      <th className="text-right py-2 font-medium w-24">Quantity</th>
                      <th className="text-right py-2 font-medium w-32">Price</th>
                      <th className="text-right py-2 font-medium w-32">Amount</th>
                      <th className="w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {customFields.map((field, index) => {
                      const quantity = Number(watch(`customItems.${index}.quantity`) || 0);
                      const amount = Number(watch(`customItems.${index}.amount`) || 0);
                      const itemTotal = quantity * amount;

                      return (
                        <tr key={field.id}>
                          <td className="py-2">
                            <input
                              {...register(`customItems.${index}.description`)}
                              className="w-full border-0 focus:ring-0 p-0"
                              placeholder="Enter description"
                            />
                          </td>
                          <td className="py-2">
                            <input
                              type="number"
                              {...register(`customItems.${index}.quantity`)}
                              className="w-full text-right border-0 focus:ring-0 p-0"
                              min="0"
                              step="1"
                              placeholder="0"
                            />
                          </td>
                          <td className="py-2">
                            <div className="flex items-center justify-end">
                              <span className="text-gray-500 mr-1">$</span>
                              <input
                                type="number"
                                {...register(`customItems.${index}.amount`, {
                                  setValueAs: v => v === "" ? 0 : Number(v),
                                  onChange: (e) => {
                                    const value = e.target.value;
                                    if (value === "") {
                                      setValue(`customItems.${index}.amount`, 0);
                                    } else {
                                      setValue(`customItems.${index}.amount`, Number(value));
                                    }
                                  }
                                })}
                                className="w-24 text-right border-0 focus:ring-0 p-0"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                              />
                            </div>
                          </td>
                          <td className="py-2 text-right text-gray-700">
                            ${itemTotal.toFixed(2)}
                          </td>
                          <td className="py-2 text-right">
                            <button
                              type="button"
                              onClick={() => removeCustom(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bank Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Bank Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
                  <label className="text-sm text-gray-500">Bank Name:</label>
                  <input
                    {...register('bankDetails.bankName')}
                    className="w-full border-b border-gray-200"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Account Name:</label>
                  <input
                    {...register('bankDetails.accountName')}
                    className="w-full border-b border-gray-200"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Account Number:</label>
                  <input
                    {...register('bankDetails.accountNumber')}
                    className="w-full border-b border-gray-200"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">SWIFT Code:</label>
                  <input
                    {...register('bankDetails.swiftCode')}
                    className="w-full border-b border-gray-200"
                  />
                </div>
              </div>
            </div>

            {/* Terms */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Terms & Conditions</h3>
              <div className="space-y-2">
                {[0, 1, 2].map((index) => (
                  <div key={index}>
                    <input
                      {...register(`terms.${index}`)}
                      className="w-full border-b border-gray-200"
                    />
                  </div>
                ))}
          </div>
        </div>

            {/* Totals */}
            <div className="flex justify-end mt-6">
              <div className="w-full max-w-xs space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">GST Rate:</span>
                    <div className="flex items-center">
                      <input
                        type="number"
                        {...register('gstRate', {
                          valueAsNumber: true,
                          min: 0,
                          max: 100
                        })}
                        className="w-20 text-right border rounded-md"
                        min="0"
                        max="100"
                      />
                      <span className="ml-1 text-gray-600">%</span>
                    </div>
                  </div>
                  <div className="flex justify-between mt-1 text-gray-600">
                    <span>GST Amount:</span>
                    <span>${gst.toFixed(2)}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Discount Rate:</span>
                    <div className="flex items-center">
                      <input
                        type="number"
                        {...register('discountRate', {
                          valueAsNumber: true,
                          min: 0,
                          max: 100
                        })}
                        className="w-20 text-right border rounded-md"
                        min="0"
                        max="100"
                      />
                      <span className="ml-1 text-gray-600">%</span>
                    </div>
                  </div>
                  <div className="flex justify-between mt-1 text-gray-600">
                    <span>Discount Amount:</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Print Layout (Hidden in normal view, shown during print) */}
      <div className="hidden print:block print:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">INVOICE</h1>
              <p className="text-gray-600">{watch('id')}</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-semibold">Gounders Samoa</h2>
              <p className="text-gray-600">goundersamoa@gmail.com</p>
              <p className="text-gray-600">+685 720 2696</p>
            </div>
          </div>

          {/* Client & Invoice Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Bill To:</h3>
              <p className="font-medium">{watch('clientName')}</p>
              <p className="text-gray-600 whitespace-pre-line">{watch('clientAddress')}</p>
            </div>
            <div className="text-right">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice Date:</span>
                  <span>{watch('invoiceDate')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span>{watch('dueDate')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="py-2 text-left">Description</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {/* Product Items */}
              {fields.map((field, index) => {
                const quantity = watch(`invoiceItems.${index}.quantity`) || 0;
                const amount = watch(`invoiceItems.${index}.amount`) || 0;
                const itemTotal = quantity * amount;

                return (
                  <tr key={field.id} className="border-b border-gray-200">
                    <td className="py-2">{watch(`invoiceItems.${index}.description`)}</td>
                    <td className="py-2 text-right">{quantity}</td>
                    <td className="py-2 text-right">${amount.toFixed(2)}</td>
                    <td className="py-2 text-right">${itemTotal.toFixed(2)}</td>
                  </tr>
                );
              })}

              {/* Custom Items */}
              {customFields.map((field, index) => {
                const quantity = watch(`customItems.${index}.quantity`) || 0;
                const amount = watch(`customItems.${index}.amount`) || 0;
                const itemTotal = quantity * amount;

                return (
                  <tr key={field.id} className="border-b border-gray-200">
                    <td className="py-2">{watch(`customItems.${index}.description`)}</td>
                    <td className="py-2 text-right">{quantity}</td>
                    <td className="py-2 text-right">${amount.toFixed(2)}</td>
                    <td className="py-2 text-right">${itemTotal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {gst > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">GST ({gstRate}%):</span>
                    <span>${gst.toFixed(2)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount ({discountRate}%):</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-300 font-bold">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
        </div>

          {/* Footer */}
          <div className="grid grid-cols-2 gap-8 text-sm border-t border-gray-300 pt-4">
            <div>
              <h4 className="font-medium mb-2">Payment Details:</h4>
              <p>Bank: {watch('bankDetails.bankName')}</p>
              <p>Account: {watch('bankDetails.accountNumber')}</p>
              <p>SWIFT: {watch('bankDetails.swiftCode')}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Terms & Conditions:</h4>
              <ul className="list-disc list-inside text-xs text-gray-600">
                {watch('terms')?.slice(0, 3).map((term, index) => (
                  <li key={index} className="truncate">{term}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Invoice;
