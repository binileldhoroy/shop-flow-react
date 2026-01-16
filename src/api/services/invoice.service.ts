import axiosInstance from '../axios';
import { API_ENDPOINTS } from '../endpoints';
import {
  TaxInvoice,
  TaxInvoiceCreate,
  InvoiceFilters,
} from '../../types/invoice.types';

// Paginated response type
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const invoiceService = {
  // Get all invoices with optional filters
  getInvoices: async (filters?: InvoiceFilters): Promise<PaginatedResponse<TaxInvoice>> => {
    const response = await axiosInstance.get<PaginatedResponse<TaxInvoice>>(
      API_ENDPOINTS.SALES.INVOICES,
      { params: filters }
    );
    return response.data;
  },

  // Get single invoice by ID
  getInvoiceById: async (id: number): Promise<TaxInvoice> => {
    const response = await axiosInstance.get<TaxInvoice>(
      API_ENDPOINTS.SALES.INVOICE_DETAIL(id)
    );
    return response.data;
  },

  // Create invoice from sale order
  createInvoice: async (data: TaxInvoiceCreate): Promise<TaxInvoice> => {
    const response = await axiosInstance.post<TaxInvoice>(
      API_ENDPOINTS.SALES.INVOICES,
      data
    );
    return response.data;
  },

  // Cancel invoice
  cancelInvoice: async (
    id: number,
    cancellation_reason?: string
  ): Promise<{ message: string }> => {
    const response = await axiosInstance.delete<{ message: string }>(
      API_ENDPOINTS.SALES.INVOICE_DETAIL(id),
      { data: { cancellation_reason } }
    );
    return response.data;
  },
};
