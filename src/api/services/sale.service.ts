import axiosInstance from '../axios';
import { API_ENDPOINTS } from '../endpoints';

export interface SaleFormData {
  order_number: string;
  customer: number | null;
  payment_method: string;
  payment_status: string;
  billing_state: number | null;
  place_of_supply: number | null;
  discount_percentage: number;
  items: Array<{
    product: number;
    quantity: number;
    unit_price: number;
    gst_rate: number;
    hsn_code: string;
  }>;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const saleService = {
  // Get all sales with pagination
  getAll: async (page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<any>> => {
    const response = await axiosInstance.get<PaginatedResponse<any>>(
      `${API_ENDPOINTS.SALES.LIST}?page=${page}&page_size=${pageSize}`
    );
    return response.data;
  },

  // Search sales by query with pagination
  search: async (query: string, page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<any>> => {
    const response = await axiosInstance.get<PaginatedResponse<any>>(
      `${API_ENDPOINTS.SALES.LIST}?search=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}`
    );
    return response.data;
  },

  // Get sale by ID
  getById: async (id: number): Promise<any> => {
    const response = await axiosInstance.get(API_ENDPOINTS.SALES.DETAIL(id));
    return response.data;
  },

  // Create sale
  create: async (data: SaleFormData): Promise<any> => {
    const response = await axiosInstance.post(API_ENDPOINTS.SALES.LIST, data);
    return response.data;
  },

  // Update sale
  update: async (id: number, data: Partial<SaleFormData>): Promise<any> => {
    const response = await axiosInstance.put(API_ENDPOINTS.SALES.DETAIL(id), data);
    return response.data;
  },

  // Delete sale
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(API_ENDPOINTS.SALES.DETAIL(id));
  },
};
