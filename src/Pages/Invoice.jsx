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
    name: 'invoiceItems',
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
    <section className={`invoice min-h-screen bg-white text-left ${getTemplateStyles()}`}>
      <div className="w-full max-w-5xl mx-auto p-8 print:p-0">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-8 text-gray-600 hover:text-gray-800 print:hidden"
        >
          ← Back to Dashboard
        </button>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-5xl mx-auto p-8 print:p-0">
          <div className="print:hidden mb-4 flex justify-end gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mr-2">Template:</label>
              <select 
                value={selectedTemplate}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="border-gray-200 rounded"
              >
                {Object.entries(invoiceTemplates).map(([key, template]) => (
                  <option key={key} value={key}>{template.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mr-2">Status:</label>
              <select {...register('status')} className="border-gray-200 rounded">
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mr-2">Theme:</label>
              <select {...register('color')} className="border-gray-200 rounded">
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="orange">Orange</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center mb-8 print:mb-12">
            <div>
              <h2 className={`text-4xl font-bold text-${selectedColor}-800`}>INVOICE</h2>
              <p className="text-gray-500 mt-1">#INV-{new Date().getFullYear()}-{String(1001).padStart(4, '0')}</p>
            </div>
            <div className="print:hidden flex gap-4">
              <button type="submit" className={`${themeColors[selectedColor]} text-white px-6 py-2 rounded-lg transition-colors`}>
                Save
              </button>
              <button 
                type="button" 
                onClick={() => window.print()} 
                className={`${themeColors[selectedColor]} text-white px-6 py-2 rounded-lg transition-colors`}
              >
                Print
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-12 print:gap-4">
            <div className="space-y-6">
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
                <div key={field.id} className="grid grid-cols-12 gap-4 p-4 items-center">
                  <div className="col-span-6">
                    <input
                      {...register(`invoiceItems.${index}.description`, {
                        required: true,
                      })}
                      className="w-full border-b border-gray-200 focus:border-blue-500 py-1"
                      placeholder="Item description"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      {...register(`invoiceItems.${index}.quantity`, {
                        required: true,
                        valueAsNumber: true,
                        min: 1,
                      })}
                      defaultValue={1}
                      type="number"
                      min="1"
                      className="w-full text-right border-b border-gray-200 focus:border-blue-500 py-1"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      {...register(`invoiceItems.${index}.amount`, {
                        required: true,
                        valueAsNumber: true,
                        min: 0,
                      })}
                      defaultValue={0}
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full text-right border-b border-gray-200 focus:border-blue-500 py-1"
                    />
                  </div>
                  <div className="col-span-2 print:hidden flex justify-end">
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
