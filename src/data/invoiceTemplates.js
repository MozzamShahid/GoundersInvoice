export const invoiceTemplates = {
  professional: {
    name: 'Professional',
    color: 'blue',
    layout: 'classic',
    bankDetails: {
      bankName: 'Professional Bank',
      accountName: 'Your Business Name',
      accountNumber: '1234-5678-9012-3456',
      swiftCode: 'PROFBANK123',
    },
    terms: [
      'Payment is due within 30 days',
      'Please include invoice number on your payment',
      'Late payments are subject to a 5% fee',
    ],
    styles: {
      headerBg: 'bg-blue-50',
      borderColor: 'border-blue-200',
      accentColor: 'text-blue-600',
    }
  },
  creative: {
    name: 'Creative',
    color: 'orange',
    layout: 'modern',
    bankDetails: {
      bankName: 'Creative Bank',
      accountName: 'Creative Studio',
      accountNumber: '9876-5432-1098-7654',
      swiftCode: 'CREATEBNK456',
    },
    terms: [
      'Payment is due within 14 days',
      'All work remains property of Creative Studio until paid in full',
      'Revisions not included after project completion',
    ],
    styles: {
      headerBg: 'bg-orange-50',
      borderColor: 'border-orange-200',
      accentColor: 'text-orange-600',
    }
  },
  minimal: {
    name: 'Minimal',
    color: 'green',
    layout: 'simple',
    bankDetails: {
      bankName: 'Simple Bank',
      accountName: 'Minimal Co.',
      accountNumber: '5555-6666-7777-8888',
      swiftCode: 'SIMPLBNK789',
    },
    terms: [
      'Payment due upon receipt',
      'Net 15 payment terms',
      'Thank you for your business',
    ],
    styles: {
      headerBg: 'bg-green-50',
      borderColor: 'border-green-200',
      accentColor: 'text-green-600',
    }
  },
}; 