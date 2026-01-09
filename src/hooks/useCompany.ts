import { useAppSelector } from './useRedux';

export const useCompany = () => {
  const { currentCompany, companies, loading, error } = useAppSelector((state) => state.company);

  return {
    currentCompany,
    companies,
    loading,
    error,
    hasCompany: !!currentCompany,
  };
};
