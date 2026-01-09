import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppSelector } from '@hooks/useRedux';
import { useAuth } from '@hooks/useAuth';
import { UserRole } from '@types/auth.types';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const { user, hasRole } = useAuth();

  const navigationItems = [
    {
      path: '/dashboard',
      icon: 'speedometer2',
      label: 'Dashboard',
      roles: [UserRole.SUPER_USER, UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER, UserRole.INVENTORY_STAFF],
    },
    {
      path: '/companies',
      icon: 'building',
      label: 'Companies',
      roles: [UserRole.SUPER_USER],
    },
    {
      path: '/pos',
      icon: 'calculator',
      label: 'POS',
      roles: [UserRole.SUPER_USER, UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER],
    },
    {
      path: '/products',
      icon: 'box-seam',
      label: 'Products',
      roles: [UserRole.SUPER_USER, UserRole.ADMIN, UserRole.MANAGER, UserRole.INVENTORY_STAFF],
    },
    {
      path: '/categories',
      icon: 'tags',
      label: 'Categories',
      roles: [UserRole.SUPER_USER, UserRole.ADMIN, UserRole.MANAGER, UserRole.INVENTORY_STAFF],
    },
    {
      path: '/sales',
      icon: 'cart-check',
      label: 'Sales',
      roles: [UserRole.SUPER_USER, UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER],
    },
    {
      path: '/customers',
      icon: 'people',
      label: 'Customers',
      roles: [UserRole.SUPER_USER, UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER],
    },
    {
      path: '/invoices',
      icon: 'file-earmark-text',
      label: 'Invoices',
      roles: [UserRole.SUPER_USER, UserRole.ADMIN, UserRole.MANAGER],
    },
    {
      path: '/inventory',
      icon: 'boxes',
      label: 'Inventory',
      roles: [UserRole.SUPER_USER, UserRole.ADMIN, UserRole.MANAGER, UserRole.INVENTORY_STAFF],
    },
    {
      path: '/purchases',
      icon: 'bag-plus',
      label: 'Purchases',
      roles: [UserRole.SUPER_USER, UserRole.ADMIN, UserRole.MANAGER, UserRole.INVENTORY_STAFF],
    },
    {
      path: '/suppliers',
      icon: 'truck',
      label: 'Suppliers',
      roles: [UserRole.SUPER_USER, UserRole.ADMIN, UserRole.MANAGER, UserRole.INVENTORY_STAFF],
    },
    {
      path: '/payments',
      icon: 'credit-card',
      label: 'Payments',
      roles: [UserRole.SUPER_USER, UserRole.ADMIN, UserRole.MANAGER],
    },
    {
      path: '/reports',
      icon: 'graph-up',
      label: 'Reports',
      roles: [UserRole.SUPER_USER, UserRole.ADMIN, UserRole.MANAGER],
    },
    {
      path: '/users',
      icon: 'person-badge',
      label: 'Users',
      roles: [UserRole.SUPER_USER, UserRole.ADMIN, UserRole.MANAGER],
    },
    {
      path: '/settings',
      icon: 'gear',
      label: 'Settings',
      roles: [UserRole.SUPER_USER, UserRole.ADMIN],
    },
  ];

  const filteredItems = navigationItems.filter((item) =>
    hasRole(item.roles)
  );

  return (
    <>
      <aside className={`sidebar ${!sidebarOpen ? 'closed' : ''}`}>
        <nav className="sidebar-nav">
          {filteredItems.map((item) => (
            <div key={item.path} className="nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <i className={`bi bi-${item.icon}`}></i>
                <span>{item.label}</span>
              </NavLink>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
