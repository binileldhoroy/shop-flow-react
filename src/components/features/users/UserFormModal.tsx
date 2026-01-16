import React from 'react';
import Modal from '../../common/Modal/Modal';

// Placeholder for UserFormModal
const UserFormModal: React.FC<any> = ({ show, onHide }) => {
  return (
    <Modal show={show} onHide={onHide} title="User Form" size="md">
      <p className="text-gray-600">User form - Component being converted to Tailwind CSS</p>
    </Modal>
  );
};

export default UserFormModal;
