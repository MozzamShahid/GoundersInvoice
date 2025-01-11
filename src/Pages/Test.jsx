import React from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

const Test = () => {
    const{ control, register, handleSubmit, watch } = useForm(
        {defaultValues: {invoiceItems: [{description: '', quantity: 1, price: 0 }],}}
    );

    const {fields, append, remove} = useFieldArray({
        control,
        name: 'invoiceItems',
    })
    
    const onSubmit = (data) =>{
        console.log(data);
    }

  return (
    <div>
      <h1>Invoice Form</h1>
    
    <form onSubmit={handleSubmit(onSubmit)}>
        {fields.map((field, index)=> (
            <section key={field.id} className=" bg-slate-200 p-2 mt-10">
            <input {...register(`invoiceItems.${index}.description`)} placeholder="Enter Your Invoice" size={100} type="text" />
            <input {...register(`invoiceItems.${index}.quantity`)} placeholder="Quantity" min={0} type="number" />
            <input {...register(`invoiceItems.${index}.price`)} placeholder="price" min={0} type="number" />
            <button type='button' onClick={()=> remove(index)}>Remove</button>
          </section>
        ))}
      
     
      <button type='button' onClick={() => append({description: '', quantity: 1, price: 0 })}  >Add</button>
      <div>
      <button type='submit'>Save</button>
      <button type='button' onClick={()=>window.print()}>Print</button>
      </div>
      </form>
    </div>
   
  )
}

export default Test
