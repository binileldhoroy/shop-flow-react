import axiosInstance from '../axios';
import { StateMaster } from '../../types/state.types';

export const stateService = {
  // Get all active states
  getAll: async (): Promise<StateMaster[]> => {
    const response = await axiosInstance.get<StateMaster[]>('/api/settings/states/');
    return response.data;
  },
};
