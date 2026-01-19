import api from '../axios';

export const documentService = {
  getProfitLoss: async (params: { start_date: string; end_date: string }) => {
    const response = await api.get('/api/documents/profit-loss/', { params });
    return response.data;
  },

  getBalanceSheet: async (params: { date: string }) => {
    const response = await api.get('/api/documents/balance-sheet/', { params });
    return response.data;
  },

  getGSTRReport: async (params: { start_date: string; end_date: string; type: string }) => {
    const response = await api.get('/api/documents/gstr/', { params });
    return response.data;
  },

  getAccountStatement: async (params: { start_date: string; end_date: string; type: string; id: string }) => {
    const response = await api.get('/api/documents/account-statement/', { params });
    return response.data;
  },

  getTallyExport: async (params: { start_date: string; end_date: string }) => {
    const response = await api.get('/api/documents/tally-export/', {
      params,
      responseType: 'blob' // Important for file download
    });
    return response.data;
  },
};
