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

export const saleService = {
  // Get all sales
  getAll: async (): Promise<any[]> => {
    const response = await axiosInstance.get(API_ENDPOINTS.SALES.LIST);
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
