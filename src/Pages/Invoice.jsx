import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { invoiceTemplates } from '../data/invoiceTemplates';
import StorageService from '../services/StorageService';

const Invoice = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { control, register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      invoiceItems: [{ description: '', quantity: 1, amount: 0 }],
      gstRate: 10,
      discountRate: 0,
      color: 'blue',
      status: 'draft',
      template: 'professional',
      clientName: '',
      clientAddress: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      bankDetails: invoiceTemplates.professional.bankDetails,
      terms: invoiceTemplates.professional.terms,
    },
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) {
      const invoice = StorageService.getInvoices().find(inv => inv.id === id);
      if (invoice) {
        Object.keys(invoice).forEach(key => {
          setValue(key, invoice[key]);
        });
      }
    }
  }, [id, setValue]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "invoiceItems",
    defaultValues: {
      invoiceItems: [{ description: '', quantity: 1, amount: 0 }]
    }
  });

  const themeColors = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    orange: 'bg-orange-600 hover:bg-orange-700',
  };

  const handleTemplateChange = (templateName) => {
    const template = invoiceTemplates[templateName];
    if (template) {
      setValue('template', templateName);
      setValue('color', template.color);
      setValue('bankDetails', template.bankDetails);
      setValue('terms', template.terms);
    }
  };

  const selectedTemplate = watch('template');
  const selectedColor = watch('color');
  
  const getTemplateStyles = () => {
    const template = invoiceTemplates[selectedTemplate];
    switch (template.layout) {
      case 'modern':
        return 'rounded-lg shadow-lg';
      case 'simple':
        return 'border border-gray-200';
      default:
        return 'shadow-sm';
    }
  };

  const onSubmit = (data) => {
    // Validate invoice items
    const itemErrors = [];
    data.invoiceItems.forEach((item, index) => {
      if (!item.description) {
        itemErrors.push(`Item ${index + 1}: Description is required`);
      }
      if (!item.quantity || item.quantity < 1) {
        itemErrors.push(`Item ${index + 1}: Quantity must be at least 1`);
      }
      if (!item.amount || item.amount < 0) {
        itemErrors.push(`Item ${index + 1}: Amount must be 0 or greater`);
      }
    });

    if (itemErrors.length > 0) {
      setErrors(itemErrors);
      alert(itemErrors.join('\n'));
      return;
    }

    // Log the form data for debugging
    console.log('Form Data:', data);

    // Process invoice items
    const processedItems = data.invoiceItems.map(item => ({
      description: item.description,
      quantity: Number(item.quantity) || 0,
      amount: Number(item.amount) || 0,
    }));

    console.log('Processed Items:', processedItems); // Debug log

    const invoiceData = {
      id: id || StorageService.getNextInvoiceNumber(),
      clientName: data.clientName || '',
      clientAddress: data.clientAddress || '',
      invoiceDate: data.invoiceDate || new Date().toISOString().split('T')[0],
      dueDate: data.dueDate || '',
      invoiceItems: processedItems,
      gstRate: Number(data.gstRate) || 0,
      discountRate: Number(data.discountRate) || 0,
      status: data.status || 'draft',
      template: data.template || 'professional',
      color: data.color || 'blue',
      bankDetails: {
        bankName: data.bankDetails?.bankName || '',
        accountName: data.bankDetails?.accountName || '',
        accountNumber: data.bankDetails?.accountNumber || '',
        swiftCode: data.bankDetails?.swiftCode || '',
      },
      terms: data.terms || [],
      total: calculateTotals().total,
      subtotal: calculateTotals().subtotal,
      gst: calculateTotals().gst,
      discount: calculateTotals().discount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('Final Invoice Data:', invoiceData); // Debug log

    if (StorageService.saveInvoice(invoiceData)) {
      navigate('/dashboard');
    } else {
      alert('Error saving invoice');
    }
  };

  const gstRate = watch('gstRate');
  const discountRate = watch('discountRate');
  const invoiceItems = watch('invoiceItems');

  const calculateTotals = () => {
    const subtotal = invoiceItems.reduce(
      (acc, item) => acc + (item.quantity * item.amount || 0),
      0
    );
    const gst = subtotal * (gstRate / 100);
    const discount = subtotal * (discountRate / 100);
    const total = subtotal + gst - discount;
    return { subtotal, gst, discount, total };
  };

  const { subtotal, gst, discount, total } = calculateTotals();

  return (
    <section className="invoice min-h-screen bg-white">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save
              </button>
              <button
                type="button"
                onClick={() => window.print()}
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Template and Color Selection */}
          <div className="print:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
              <select
                {...register('template')}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm"
              >
                {Object.entries(invoiceTemplates).map(([key, template]) => (
                  <option key={key} value={key}>{template.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                {...register('status')}
                className="w-full border-gray-300 rounded-md shadow-sm"
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
              <label className="text-sm font-medium text-gray-600 block mb-1">Bill To:</label>
              <input
                {...register('clientName')}
                type="text"
                placeholder="Client Name"
                className="text-2xl font-semibold w-full border-b-2 border-gray-200 focus:border-blue-500 pb-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">Client Address:</label>
              <textarea
                {...register('clientAddress')}
                className="w-full border-b-2 border-gray-200 focus:border-blue-500 resize-none"
                rows="2"
                placeholder="Client's complete address"
              ></textarea>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 print:gap-2">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Invoice Date:</label>
                <input
                  {...register('invoiceDate')}
                  type="date"
                  className="w-full border-b-2 border-gray-200 focus:border-blue-500 print:appearance-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Due Date:</label>
                <input
                  {...register('dueDate')}
                  type="date"
                  className="w-full border-b-2 border-gray-200 focus:border-blue-500 print:appearance-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 print:gap-2">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">GST Rate (%):</label>
                <input
                  type="number"
                  {...register('gstRate')}
                  className="w-full border-b-2 border-gray-200 focus:border-blue-500"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Discount (%):</label>
                <input
                  type="number"
                  {...register('discountRate')}
                  className="w-full border-b-2 border-gray-200 focus:border-blue-500"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          <div className="mb-12">
            <div className="bg-gray-100 rounded-t-lg p-4 grid grid-cols-12 gap-4 font-medium text-gray-700">
              <div className="col-span-6">Description</div>
              <div className="col-span-2 text-right">Quantity</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right print:hidden">Actions</div>
            </div>

            <div className="divide-y divide-gray-200">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 items-center">
                  <div className="sm:col-span-6">
                    <label className="block text-sm text-gray-600 sm:hidden">Description</label>
                    <input
                      {...register(`invoiceItems.${index}.description`)}
                      className="w-full border-b border-gray-200 focus:border-blue-500 py-1"
                      placeholder="Item description"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-4 sm:col-span-2">
                    <div>
                      <label className="block text-sm text-gray-600 sm:hidden">Quantity</label>
                      <input
                        {...register(`invoiceItems.${index}.quantity`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        className="w-full text-right border-b border-gray-200 focus:border-blue-500 py-1"
                        min="1"
                        defaultValue={1}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 sm:hidden">Amount</label>
                      <input
                        {...register(`invoiceItems.${index}.amount`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        className="w-full text-right border-b border-gray-200 focus:border-blue-500 py-1"
                        min="0"
                        step="0.01"
                        defaultValue={0}
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2 flex justify-end print:hidden">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                append({
                  description: '',
                  quantity: 1,
                  amount: 0,
                });
              }}
              className="mt-4 text-blue-600 hover:text-blue-800 print:hidden"
            >
              + Add Item
            </button>
          </div>

          <div className="flex justify-end print:mt-8">
            <div className="w-80 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              {gstRate > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>GST ({gstRate}%):</span>
                  <span className="font-medium">${gst.toFixed(2)}</span>
                </div>
              )}
              {discountRate > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Discount ({discountRate}%):</span>
                  <span className="font-medium">-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className={`flex justify-between font-bold text-lg border-t border-gray-200 pt-3 text-${selectedColor}-800`}>
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-16 text-gray-600 border-t border-gray-200 pt-8">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-medium mb-2">Payment Details:</h4>
                <div className="space-y-2">
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
              <div className="text-right">
                <h4 className="font-medium mb-2">Terms & Conditions:</h4>
                <div className="space-y-2">
                  {[0, 1, 2].map((index) => (
                    <div key={index}>
                      <input
                        {...register(`terms.${index}`)}
                        className="w-full text-right border-b border-gray-200"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Invoice;
