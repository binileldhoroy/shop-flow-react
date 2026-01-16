import React, { useState, useEffect } from 'react';
import Modal from '@components/common/Modal/Modal';

interface Category {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

interface CategoryFormModalProps {
  category: Category | null;
  onSubmit: (data: any) => void;
  onClose: () => void;
  loading?: boolean;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  category,
  onSubmit,
  onClose,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        is_active: category.is_active ?? true,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        is_active: true,
      });
    }
  }, [category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal
      show={true}
      onHide={onClose}
      title={category ? 'Edit Category' : 'Add Category'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Category Name *</label>
          <input
            type="text"
            name="name"
            className="input-field"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Electronics, Groceries"
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            name="description"
            className="input-field"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description of the category"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
            Active
          </label>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary flex-1"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary flex-1"
            disabled={loading}
          >
            {loading ? 'Saving...' : category ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryFormModal;
