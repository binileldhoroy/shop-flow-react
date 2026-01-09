import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { User, UserRole } from '@types/auth.types';
import { UserCreateData, UserUpdateData } from '@api/services/user.service';
import { useAuth } from '@hooks/useAuth';
import { useCompany } from '@hooks/useCompany';

interface UserFormModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: UserCreateData | UserUpdateData) => void;
  user?: User | null;
  loading?: boolean;
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  show,
  onHide,
  onSubmit,
  user,
  loading = false,
}) => {
  const { isSuperUser } = useAuth();
  const { companies } = useCompany();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: UserRole.CASHIER,
    company: null as number | null,
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email || '',
        password: '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        role: user.role,
        company: user.company,
        phone: '',
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: UserRole.CASHIER,
        company: null,
        phone: '',
      });
    }
  }, [user, show]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (user) {
      // Update - don't send password if empty
      const updateData: UserUpdateData = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        company: formData.company,
        phone: formData.phone,
      };
      onSubmit(updateData);
    } else {
      // Create
      onSubmit(formData as UserCreateData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'company' ? (value ? parseInt(value) : null) : value,
    }));
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className={`bi bi-${user ? 'pencil' : 'plus-circle'} me-2`}></i>
          {user ? 'Edit User' : 'Add New User'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="row">
            <div className="col-md-6 mb-3">
              <Form.Group>
                <Form.Label>Username *</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={!!user}
                  placeholder="Enter username"
                />
              </Form.Group>
            </div>

            <div className="col-md-6 mb-3">
              <Form.Group>
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter email"
                />
              </Form.Group>
            </div>

            {!user && (
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Password *</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter password"
                  />
                </Form.Group>
              </div>
            )}

            <div className="col-md-6 mb-3">
              <Form.Group>
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Enter first name"
                />
              </Form.Group>
            </div>

            <div className="col-md-6 mb-3">
              <Form.Group>
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Enter last name"
                />
              </Form.Group>
            </div>

            <div className="col-md-6 mb-3">
              <Form.Group>
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </Form.Group>
            </div>

            <div className="col-md-6 mb-3">
              <Form.Group>
                <Form.Label>Role *</Form.Label>
                <Form.Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value={UserRole.CASHIER}>Cashier</option>
                  <option value={UserRole.INVENTORY_STAFF}>Inventory Staff</option>
                  <option value={UserRole.MANAGER}>Manager</option>
                  <option value={UserRole.ADMIN}>Admin</option>
                  {isSuperUser && <option value={UserRole.SUPER_USER}>Super User</option>}
                </Form.Select>
              </Form.Group>
            </div>

            {isSuperUser && (
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Company</Form.Label>
                  <Form.Select
                    name="company"
                    value={formData.company || ''}
                    onChange={handleChange}
                  >
                    <option value="">No Company (Super User only)</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.company_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                {user ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <i className={`bi bi-${user ? 'check' : 'plus'}-circle me-2`}></i>
                {user ? 'Update User' : 'Create User'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UserFormModal;
