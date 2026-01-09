import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Company } from '@types/company.types';
import { StateMaster } from '@types/state.types';
import { stateService } from '@api/services/state.service';

interface CompanyFormData {
  company_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: number | null; // FK to StateMaster
  pincode: string;
  country: string;
  gst_number?: string;
  logo?: File | null;
}

interface CompanyFormModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: FormData) => void;
  company?: Company | null;
  loading?: boolean;
}

const CompanyFormModal: React.FC<CompanyFormModalProps> = ({
  show,
  onHide,
  onSubmit,
  company,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CompanyFormData>({
    company_name: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: null,
    pincode: '',
    country: 'India',
    gst_number: '',
    logo: null,
  });

  // Admin user fields (only for new companies)
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [states, setStates] = useState<StateMaster[]>([]);

  // Load states on mount
  useEffect(() => {
    const loadStates = async () => {
      try {
        const statesData = await stateService.getAll();
        setStates(statesData);
      } catch (error) {
        console.error('Failed to load states:', error);
      }
    };
    loadStates();
  }, []);

  useEffect(() => {
    if (company) {
      setFormData({
        company_name: company.company_name,
        email: company.email,
        phone: company.phone,
        address_line1: company.address_line1,
        address_line2: company.address_line2 || '',
        city: company.city,
        state: company.state, // Already a number (FK)
        pincode: company.pincode,
        country: company.country,
        gst_number: company.gst_number || '',
        logo: null,
      });
      if (company.logo) {
        setLogoPreview(company.logo);
      }
    } else {
      setFormData({
        company_name: '',
        email: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: null,
        pincode: '',
        country: 'India',
        gst_number: '',
        logo: null,
      });
      setLogoPreview(null);
    }
  }, [company, show]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (key === 'logo' && value instanceof File) {
          submitData.append(key, value);
        } else if (key !== 'logo') {
          submitData.append(key, value.toString());
        }
      }
    });

    onSubmit(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className={`bi bi-${company ? 'pencil' : 'plus-circle'} me-2`}></i>
          {company ? 'Edit Company' : 'Add New Company'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="row">
            {/* Company Logo */}
            <div className="col-12 mb-3">
              <Form.Group>
                <Form.Label>Company Logo</Form.Label>
                <div className="d-flex align-items-center gap-3">
                  {logoPreview && (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  )}
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </Form.Group>
            </div>

            {/* Company Name */}
            <div className="col-md-6 mb-3">
              <Form.Group>
                <Form.Label>Company Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                  placeholder="Enter company name"
                />
              </Form.Group>
            </div>

            {/* Email */}
            <div className="col-md-6 mb-3">
              <Form.Group>
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="company@example.com"
                />
              </Form.Group>
            </div>

            {/* Phone */}
            <div className="col-md-6 mb-3">
              <Form.Group>
                <Form.Label>Phone *</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="Enter phone number"
                />
              </Form.Group>
            </div>

            {/* GST Number */}
            <div className="col-md-6 mb-3">
              <Form.Group>
                <Form.Label>GST Number</Form.Label>
                <Form.Control
                  type="text"
                  name="gst_number"
                  value={formData.gst_number}
                  onChange={handleChange}
                  placeholder="Enter GST number"
                />
              </Form.Group>
            </div>

            {/* Address Line 1 */}
            <div className="col-12 mb-3">
              <Form.Group>
                <Form.Label>Address Line 1 *</Form.Label>
                <Form.Control
                  type="text"
                  name="address_line1"
                  value={formData.address_line1}
                  onChange={handleChange}
                  required
                  placeholder="Street address"
                />
              </Form.Group>
            </div>

            {/* Address Line 2 */}
            <div className="col-12 mb-3">
              <Form.Group>
                <Form.Label>Address Line 2</Form.Label>
                <Form.Control
                  type="text"
                  name="address_line2"
                  value={formData.address_line2}
                  onChange={handleChange}
                  placeholder="Apartment, suite, etc."
                />
              </Form.Group>
            </div>

            {/* City */}
            <div className="col-md-4 mb-3">
              <Form.Group>
                <Form.Label>City *</Form.Label>
                <Form.Control
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  placeholder="City"
                />
              </Form.Group>
            </div>

            {/* State */}
            <div className="col-md-4 mb-3">
              <Form.Group>
                <Form.Label>State *</Form.Label>
                <Form.Select
                  name="state"
                  value={formData.state || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value ? Number(e.target.value) : null }))}
                  required
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state.id} value={state.id}>
                      {state.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>

            {/* Pincode */}
            <div className="col-md-4 mb-3">
              <Form.Group>
                <Form.Label>Pincode *</Form.Label>
                <Form.Control
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  placeholder="Pincode"
                />
              </Form.Group>
            </div>

            {/* Country */}
            <div className="col-md-6 mb-3">
              <Form.Group>
                <Form.Label>Country *</Form.Label>
                <Form.Control
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  placeholder="Country"
                />
              </Form.Group>
            </div>
          </div>

          {/* Admin User Section - Only for new companies */}
          {!company && (
            <>
              <hr className="my-4" />
              <h5 className="mb-3">
                <i className="bi bi-person-badge me-2"></i>
                Admin User Account
              </h5>
              <p className="text-muted small mb-3">
                Create an admin user account for this company. This user will have full access to manage the company.
              </p>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <Form.Group>
                    <Form.Label>Admin Username *</Form.Label>
                    <Form.Control
                      type="text"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      required
                      placeholder="Enter admin username"
                    />
                  </Form.Group>
                </div>

                <div className="col-md-6 mb-3">
                  <Form.Group>
                    <Form.Label>Admin Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@company.com"
                    />
                  </Form.Group>
                </div>

                <div className="col-md-6 mb-3">
                  <Form.Group>
                    <Form.Label>Admin Password *</Form.Label>
                    <Form.Control
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      placeholder="Enter admin password"
                      minLength={6}
                    />
                    <Form.Text className="text-muted">
                      Minimum 6 characters
                    </Form.Text>
                  </Form.Group>
                </div>
              </div>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                {company ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <i className={`bi bi-${company ? 'check' : 'plus'}-circle me-2`}></i>
                {company ? 'Update Company' : 'Create Company'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CompanyFormModal;
