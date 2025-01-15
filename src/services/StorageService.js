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
      console.log('Raw invoice data:', invoiceData);

      const processedItems = invoiceData.invoiceItems.map(item => ({
        description: String(item.description || ''),
        quantity: Number(item.quantity) || 0,
        amount: Number(item.amount) || 0,
      }));

      console.log('Processed items:', processedItems);

      const invoices = StorageService.getInvoices();
      const index = invoices.findIndex(inv => inv.id === invoiceData.id);
      const timestamp = new Date().toISOString();

      const processedData = {
        id: invoiceData.id,
        clientName: invoiceData.clientName || '',
        clientAddress: invoiceData.clientAddress || '',
        invoiceDate: invoiceData.invoiceDate || timestamp.split('T')[0],
        dueDate: invoiceData.dueDate || '',
        invoiceItems: processedItems,
        gstRate: Number(invoiceData.gstRate) || 0,
        discountRate: Number(invoiceData.discountRate) || 0,
        status: invoiceData.status || 'draft',
        template: invoiceData.template || 'professional',
        color: invoiceData.color || 'blue',
        bankDetails: invoiceData.bankDetails || invoiceTemplates.professional.bankDetails,
        terms: invoiceData.terms || invoiceTemplates.professional.terms,
        total: invoiceData.total || 0,
        updatedAt: timestamp,
        createdAt: index === -1 ? timestamp : invoices[index].createdAt,
      };

      if (index !== -1) {
        invoices[index] = processedData;
      } else {
        invoices.push(processedData);
      }

      localStorage.setItem('invoices', JSON.stringify(invoices));
      console.log('Saved invoice:', processedData);
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
    const year = new Date().getFullYear();
    const number = 1001 + invoices.length;
    return `INV-${year}-${String(number).padStart(4, '0')}`;
  },
};

export default StorageService; 