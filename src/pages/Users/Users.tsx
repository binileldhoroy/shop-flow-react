import React, { useState, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import { useAppDispatch } from '@hooks/useRedux';
import { fetchAllCompanies } from '@store/slices/companySlice';
import { userService, UserCreateData, UserUpdateData } from '@api/services/user.service';
import { User } from '@types/auth.types';
import UserFormModal from '@components/features/users/UserFormModal';
import DeleteConfirmModal from '@components/common/DeleteConfirmModal/DeleteConfirmModal';
import { addNotification } from '@store/slices/uiSlice';

const Users: React.FC = () => {
  const { isSuperUser } = useAuth();
  const dispatch = useAppDispatch();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadUsers();
    if (isSuperUser) {
      dispatch(fetchAllCompanies());
    }
  }, [dispatch, isSuperUser]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (error: any) {
      dispatch(addNotification({
        message: error.response?.data?.message || 'Failed to load users',
        type: 'error',
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowFormModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowFormModal(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleFormSubmit = async (data: UserCreateData | UserUpdateData) => {
    try {
      setFormLoading(true);

      if (selectedUser) {
        // Update
        await userService.update(selectedUser.id, data as UserUpdateData);
        dispatch(addNotification({
          message: 'User updated successfully',
          type: 'success',
        }));
      } else {
        // Create
        await userService.create(data as UserCreateData);
        dispatch(addNotification({
          message: 'User created successfully',
          type: 'success',
        }));
      }

      setShowFormModal(false);
      loadUsers();
    } catch (error: any) {
      dispatch(addNotification({
        message: error.response?.data?.message || 'Operation failed',
        type: 'error',
      }));
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      setFormLoading(true);
      await userService.delete(selectedUser.id);
      dispatch(addNotification({
        message: 'User deleted successfully',
        type: 'success',
      }));
      setShowDeleteModal(false);
      loadUsers();
    } catch (error: any) {
      dispatch(addNotification({
        message: error.response?.data?.message || 'Failed to delete user',
        type: 'error',
      }));
    } finally {
      setFormLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.last_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !roleFilter || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0">
                <i className="bi bi-person-badge me-2"></i>
                Users
              </h1>
              <p className="text-muted">Manage system users and roles</p>
            </div>
            <button className="btn btn-primary" onClick={handleAddUser}>
              <i className="bi bi-plus-circle me-2"></i>
              Add User
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="super_user">Super User</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="cashier">Cashier</option>
            <option value="inventory_staff">Inventory Staff</option>
          </select>
        </div>
        <div className="col-md-3 text-end">
          <span className="text-muted">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-inbox fs-1 text-muted"></i>
                  <p className="text-muted mt-2">No users found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Company</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user.id}>
                          <td>
                            <strong>{user.username}</strong>
                          </td>
                          <td>{user.first_name} {user.last_name}</td>
                          <td>{user.email || '-'}</td>
                          <td>
                            <span className={`badge bg-${
                              user.role === 'super_user' ? 'danger' :
                              user.role === 'admin' ? 'primary' :
                              user.role === 'manager' ? 'info' :
                              'secondary'
                            }`}>
                              {user.role.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td>{user.company || '-'}</td>
                          <td>
                            <span className={`badge bg-${user.is_active ? 'success' : 'secondary'}`}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleEditUser(user)}
                              title="Edit"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteUser(user)}
                              title="Delete"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UserFormModal
        show={showFormModal}
        onHide={() => setShowFormModal(false)}
        onSubmit={handleFormSubmit}
        user={selectedUser}
        loading={formLoading}
      />

      <DeleteConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete user "${selectedUser?.username}"? This action cannot be undone.`}
        loading={formLoading}
      />
    </div>
  );
};

export default Users;
