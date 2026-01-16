import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@hooks/useRedux';
import { useAuth } from '@hooks/useAuth';
import { fetchCurrentCompany } from '@store/slices/companySlice';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import ToastNotification from '@components/common/ToastNotification/ToastNotification';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const { isSuperUser } = useAuth();

  useEffect(() => {
    // Fetch current company for non-super users
    if (!isSuperUser) {
      dispatch(fetchCurrentCompany());
    }
  }, [dispatch, isSuperUser]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      <main
        className={`transition-all duration-300 pt-4 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        <div className="px-4 py-6 max-w-7xl mx-auto">{children}</div>
      </main>
      <ToastNotification />
    </div>
  );
};

export default Layout;
