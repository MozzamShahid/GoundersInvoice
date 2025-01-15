export const StorageService = {
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
      const timestamp = new Date().toISOString();

      const processedData = {
        ...invoiceData,
        updatedAt: timestamp,
        createdAt: index === -1 ? timestamp : invoices[index].createdAt,
        template: invoiceData.template || 'professional',
        bankDetails: invoiceData.bankDetails || invoiceTemplates.professional.bankDetails,
        terms: invoiceData.terms || invoiceTemplates.professional.terms,
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
    const year = new Date().getFullYear();
    const number = 1001 + invoices.length;
    return `INV-${year}-${String(number).padStart(4, '0')}`;
  },
}; 