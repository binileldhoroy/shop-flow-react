import React, { useState, useEffect } from 'react';
import { categoryService } from '@api/services/product.service';
import { Category, CategoryFormData } from '@types/product.types';
import CategoryFormModal from '@components/features/categories/CategoryFormModal';
import DeleteConfirmModal from '@components/common/DeleteConfirmModal/DeleteConfirmModal';
import { useAppDispatch } from '@hooks/useRedux';
import { addNotification } from '@store/slices/uiSlice';

const Categories: React.FC = () => {
  const dispatch = useAppDispatch();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error: any) {
      dispatch(addNotification({
        message: error.response?.data?.message || 'Failed to load categories',
        type: 'error',
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setShowFormModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setShowFormModal(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const handleFormSubmit = async (data: CategoryFormData) => {
    try {
      setFormLoading(true);

      if (selectedCategory) {
        await categoryService.update(selectedCategory.id, data);
        dispatch(addNotification({
          message: 'Category updated successfully',
          type: 'success',
        }));
      } else {
        await categoryService.create(data);
        dispatch(addNotification({
          message: 'Category created successfully',
          type: 'success',
        }));
      }

      setShowFormModal(false);
      loadCategories();
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
    if (!selectedCategory) return;

    try {
      setFormLoading(true);
      await categoryService.delete(selectedCategory.id);
      dispatch(addNotification({
        message: 'Category deleted successfully',
        type: 'success',
      }));
      setShowDeleteModal(false);
      loadCategories();
    } catch (error: any) {
      dispatch(addNotification({
        message: error.response?.data?.message || 'Failed to delete category',
        type: 'error',
      }));
    } finally {
      setFormLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0">
                <i className="bi bi-tags me-2"></i>
                Categories
              </h1>
              <p className="text-muted">Organize your products into categories</p>
            </div>
            <button className="btn btn-primary" onClick={handleAddCategory}>
              <i className="bi bi-plus-circle me-2"></i>
              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-6 text-end">
          <span className="text-muted">
            {filteredCategories.length} categor{filteredCategories.length !== 1 ? 'ies' : 'y'}
          </span>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="row">
        {loading ? (
          <div className="col-12">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-inbox fs-1 text-muted"></i>
                <p className="text-muted mt-2">No categories found</p>
              </div>
            </div>
          </div>
        ) : (
          filteredCategories.map(category => (
            <div key={category.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="mb-1">{category.name}</h5>
                      {category.description && (
                        <p className="text-muted small mb-0">{category.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary flex-fill"
                      onClick={() => handleEditCategory(category)}
                    >
                      <i className="bi bi-pencil me-1"></i>
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteCategory(category)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <CategoryFormModal
        show={showFormModal}
        onHide={() => setShowFormModal(false)}
        onSubmit={handleFormSubmit}
        category={selectedCategory}
        loading={formLoading}
      />

      <DeleteConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${selectedCategory?.name}"? This action cannot be undone.`}
        loading={formLoading}
      />
    </div>
  );
};

export default Categories;
