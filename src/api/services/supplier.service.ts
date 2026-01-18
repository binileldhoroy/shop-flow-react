import axios from '../axios';
import { API_ENDPOINTS } from '../endpoints';
import { Supplier, SupplierFormData } from '../../types/supplier.types';

const getAllSuppliers = async (): Promise<Supplier[]> => {
  const response = await axios.get<Supplier[]>(API_ENDPOINTS.SUPPLIERS.LIST);
  return response.data;
};

const getSupplierById = async (id: number): Promise<Supplier> => {
  const response = await axios.get<Supplier>(API_ENDPOINTS.SUPPLIERS.DETAIL(id));
  return response.data;
};

const createSupplier = async (data: SupplierFormData): Promise<Supplier> => {
  const response = await axios.post<Supplier>(API_ENDPOINTS.SUPPLIERS.LIST, data);
  return response.data;
};

const updateSupplier = async (id: number, data: Partial<SupplierFormData>): Promise<Supplier> => {
  const response = await axios.patch<Supplier>(API_ENDPOINTS.SUPPLIERS.DETAIL(id), data);
  return response.data;
};

const deleteSupplier = async (id: number): Promise<void> => {
  await axios.delete(API_ENDPOINTS.SUPPLIERS.DETAIL(id));
};

export const supplierService = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
