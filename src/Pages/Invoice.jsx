import React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

const Invoice = () => {
  const { control, register, handleSubmit, watch } = useForm({
    defaultValues: { invoiceItems: [{ description: '', quantity: 1, amount: 0 }] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'invoiceItems',
  });

  const onSubmit = (data) => {
    console.log('Invoice Data:', data);
  };

  // Watch for live changes in the form fields
  const invoiceItems = watch('invoiceItems');

  // Calculation logic
  const calculateTotals = () => {
    const subtotal = invoiceItems.reduce(
      (acc, item) => acc + (item.quantity * item.amount || 0),
      0
    );
    const gst = subtotal * 0.1; // 10% GST
    const discount = subtotal * 0.1; // 10% discount
    const total = subtotal + gst - discount;
    return { subtotal, gst, discount, total };
  };

  const { subtotal, gst, discount, total } = calculateTotals();

  return (
    <section className="invoice flex flex-col gap-10 p-2 items-center justify-between h-auto w-full mt-5">
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2 className="text-3xl">Invoice Details</h2>

        <div className="flex flex-row justify-between gap-48 w-full">
          {/* Left Side */}
          <div className="flex flex-col items-start gap-6">
            <h2 className="text-2xl">
              Hi, <b><input type="text" placeholder="Your Client Name" /></b>
            </h2>
            <h2 className="text-2xl">{total.toFixed(2)} USD</h2>
            <p className="text-xl">Invoice Number - <input defaultValue={1001} /></p>
          </div>

          {/* Right Side */}
          <div className="flex flex-col items-end gap-3">
            <p className="text-l">Due Date: <input type="date" /></p>
            <p className="text-l">From: <input type="text" placeholder="Your Name" /></p>
            <p className="text-l text-right">Address: <input type="text" placeholder="Your Address" /></p>
          </div>
        </div>

        {/* Invoice Section */}
        <div className="flex flex-col w-full">
          <section className="flex bg-slate-200 justify-between rounded-sm p-2 w-full">
            <div><p className="text-l">Description</p></div>
            <div className="flex gap-5">
              <p className="text-l">Quantity</p>
              <p className="text-l">Amount</p>
            </div>
          </section>

          {/* Invoice Data */}
          <div>
            {fields.map((field, index) => (
              <section key={field.id} className="flex justify-between rounded-sm p-2 w-full">
                <div>
                  <input
                    {...register(`invoiceItems.${index}.description`)}
                    size={100}
                    type="text"
                    placeholder="Description"
                  />
                </div>
                <div className="flex gap-5">
                  <input
                    {...register(`invoiceItems.${index}.quantity`, { valueAsNumber: true })}
                    className="w-[100px]"
                    type="number"
                    placeholder="Quantity"
                  />
                  <input
                    {...register(`invoiceItems.${index}.amount`, { valueAsNumber: true })}
                    className="w-[100px]"
                    type="number"
                    placeholder="Amount"
                  />
                  <button
                    type="button"
                    className="text-red-500"
                    onClick={() => remove(index)}
                  >
                    Remove
                  </button>
                </div>
              </section>
            ))}
            <button
              type="button"
              onClick={() => append({ description: '', quantity: 1, amount: 0 })}
              className="text-blue-500"
            >
              Add More
            </button>
          </div>
        </div>

        {/* Calculation Part */}
        <section className="flex flex-col gap-2 justify-end items-end w-full">
          <p className="text-l">Subtotal: {subtotal.toFixed(2)} USD</p>
          {/* <p className="text-l">GST: {gst.toFixed(2)} USD (10%)</p>
          <p className="text-l">Discount: {discount.toFixed(2)} USD (10%)</p> */}
          <h2 className="text-2xl">Total: {total.toFixed(2)} USD</h2>
        </section>

        {/* Buttons */}
        <div className="flex gap-4">
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">Save</button>
          <button type="button" onClick={() => window.print()} className="bg-green-500 text-white p-2 rounded">
            Print
          </button>
        </div>

        {/* Regards */}
        <div className="flex justify-end items-end w-full">
          <p className="text-l">Thank you for working with us, Best Regards Mozzam</p>
        </div>
      </form>
    </section>
  );
};

export default Invoice;
