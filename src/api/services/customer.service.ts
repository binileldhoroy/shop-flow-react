import axiosInstance from '../axios';
import { API_ENDPOINTS } from '../endpoints';
import { Customer, CustomerFormData, Supplier, SupplierFormData } from '@types/customer.types';

// Customer Service
export const customerService = {
  getAll: async (): Promise<Customer[]> => {
    const response = await axiosInstance.get<Customer[]>(API_ENDPOINTS.CUSTOMERS.LIST);
    return response.data;
  },

  getById: async (id: number): Promise<Customer> => {
    const response = await axiosInstance.get<Customer>(API_ENDPOINTS.CUSTOMERS.DETAIL(id));
    return response.data;
  },

  create: async (data: CustomerFormData): Promise<Customer> => {
    const response = await axiosInstance.post<Customer>(API_ENDPOINTS.CUSTOMERS.LIST, data);
    return response.data;
  },

  update: async (id: number, data: Partial<CustomerFormData>): Promise<Customer> => {
    const response = await axiosInstance.put<Customer>(
      API_ENDPOINTS.CUSTOMERS.DETAIL(id),
      data
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(API_ENDPOINTS.CUSTOMERS.DETAIL(id));
  },
};

// Supplier Service
export const supplierService = {
  getAll: async (): Promise<Supplier[]> => {
    const response = await axiosInstance.get<Supplier[]>(API_ENDPOINTS.SUPPLIERS.LIST);
    return response.data;
  },

  getById: async (id: number): Promise<Supplier> => {
    const response = await axiosInstance.get<Supplier>(API_ENDPOINTS.SUPPLIERS.DETAIL(id));
    return response.data;
  },

  create: async (data: SupplierFormData): Promise<Supplier> => {
    const response = await axiosInstance.post<Supplier>(API_ENDPOINTS.SUPPLIERS.LIST, data);
    return response.data;
  },

  update: async (id: number, data: Partial<SupplierFormData>): Promise<Supplier> => {
    const response = await axiosInstance.put<Supplier>(
      API_ENDPOINTS.SUPPLIERS.DETAIL(id),
      data
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(API_ENDPOINTS.SUPPLIERS.DETAIL(id));
  },
};
