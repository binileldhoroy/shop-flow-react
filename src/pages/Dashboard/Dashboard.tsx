import React from 'react';
import { useAuth } from '@hooks/useAuth';
import SuperUserDashboard from '../../components/features/dashboard/SuperUserDashboard';
import CompanyDashboard from '../../components/features/dashboard/CompanyDashboard';

const Dashboard: React.FC = () => {
  const { isSuperUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return isSuperUser ? <SuperUserDashboard /> : <CompanyDashboard />;
};

export default Dashboard;
