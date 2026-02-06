import api from '../axios';
import { API_ENDPOINTS } from '../endpoints';

export interface PriceTier {
  id: number;
  name: string;
  default_percentage: number;
  is_active: boolean;
}

export interface ProductTierPrice {
  id: number;
  product: number;
  tier: number;
  tier_name: string;
  type: 'percentage' | 'fixed';
  value: number;
}

export const priceTierService = {
  // Price Tiers
  getAllTiers: async () => {
    const response = await api.get<PriceTier[]>(API_ENDPOINTS.PRODUCTS.PRICE_TIERS);
    return response.data;
  },

  getTier: async (id: number) => {
    const response = await api.get<PriceTier>(API_ENDPOINTS.PRODUCTS.PRICE_TIER_DETAIL(id));
    return response.data;
  },

  createTier: async (data: Partial<PriceTier>) => {
    const response = await api.post<PriceTier>(API_ENDPOINTS.PRODUCTS.PRICE_TIERS, data);
    return response.data;
  },

  updateTier: async (id: number, data: Partial<PriceTier>) => {
    const response = await api.put<PriceTier>(API_ENDPOINTS.PRODUCTS.PRICE_TIER_DETAIL(id), data);
    return response.data;
  },

  deleteTier: async (id: number) => {
    await api.delete(API_ENDPOINTS.PRODUCTS.PRICE_TIER_DETAIL(id));
  },

  // Product Tier Prices (Rules)
  getProductRules: async (productId?: number) => {
    const params = productId ? { product_id: productId } : {};
    const response = await api.get<ProductTierPrice[]>(API_ENDPOINTS.PRODUCTS.TIER_PRICES, { params });
    return response.data;
  },

  createProductRule: async (data: Partial<ProductTierPrice>) => {
    const response = await api.post<ProductTierPrice>(API_ENDPOINTS.PRODUCTS.TIER_PRICES, data);
    return response.data;
  },

  deleteProductRule: async (id: number) => {
    await api.delete(API_ENDPOINTS.PRODUCTS.TIER_PRICE_DETAIL(id));
  },
};
