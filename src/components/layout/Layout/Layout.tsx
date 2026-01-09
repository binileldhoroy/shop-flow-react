import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@hooks/useRedux';
import { useAuth } from '@hooks/useAuth';
import { fetchCurrentCompany } from '@store/slices/companySlice';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import ToastNotification from '@components/common/ToastNotification/ToastNotification';
import './Layout.css';

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
    <div className="layout">
      <Header />
      <Sidebar />
      <main className={`layout-main ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
        <div className="layout-content">{children}</div>
      </main>
      <ToastNotification />
    </div>
  );
};

export default Layout;
