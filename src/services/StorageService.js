import { invoiceTemplates } from '../data/invoiceTemplates';

const StorageService = {
  getInvoices: () => {
    try {
      const invoices = localStorage.getItem('invoices');
      return invoices ? JSON.parse(invoices) : [];
    } catch (error) {
      console.error('Error reading invoices:', error);
      return [];
    }
  },

  saveInvoice: (invoiceData) => {
    try {
      const invoices = StorageService.getInvoices();
      const index = invoices.findIndex(inv => inv.id === invoiceData.id);
      
      const processedData = {
        ...invoiceData,
        id: invoiceData.id || `INV-${Date.now()}`,
        invoiceItems: invoiceData.invoiceItems.map(item => ({
          description: String(item.description || ''),
          quantity: Number(item.quantity) || 0,
          amount: Number(item.amount) || 0,
        })),
        total: Number(invoiceData.total) || 0,
        subtotal: Number(invoiceData.subtotal) || 0,
        gst: Number(invoiceData.gst) || 0,
        discount: Number(invoiceData.discount) || 0,
        gstRate: Number(invoiceData.gstRate) || 0,
        discountRate: Number(invoiceData.discountRate) || 0,
        createdAt: invoiceData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (index !== -1) {
        invoices[index] = processedData;
      } else {
        invoices.push(processedData);
      }

      localStorage.setItem('invoices', JSON.stringify(invoices));
      return true;
    } catch (error) {
      console.error('Error saving invoice:', error);
      return false;
    }
  },

  deleteInvoice: (invoiceId) => {
    try {
      const invoices = StorageService.getInvoices();
      const updatedInvoices = invoices.filter(inv => inv.id !== invoiceId);
      localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
      return true;
    } catch (error) {
      console.error('Error deleting invoice:', error);
      return false;
    }
  },

  getNextInvoiceNumber: () => {
    const invoices = StorageService.getInvoices();
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const number = invoices.length + 1;
    return `INV-${year}${month}-${String(number).padStart(3, '0')}`;
  },
};

export default StorageService; 