import React from 'react';
import Modal from '../../common/Modal/Modal';

// Placeholder for CategoryFormModal
const CategoryFormModal: React.FC<any> = ({ show, onHide }) => {
  return (
    <Modal show={show} onHide={onHide} title="Category Form" size="md">
      <p className="text-gray-600">Category form - Component being converted to Tailwind CSS</p>
    </Modal>
  );
};

export default CategoryFormModal;
