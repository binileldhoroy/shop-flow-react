import React from 'react';
import Modal from '../../common/Modal/Modal';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading?: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  show,
  onHide,
  onConfirm,
  title,
  message,
  loading = false,
}) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      title={title}
      size="md"
      footer={
        <>
          <button
            className="btn btn-secondary"
            onClick={onHide}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Deleting...</span>
              </div>
            ) : (
              'Delete'
            )}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className="bg-danger-100 p-3 rounded-full">
          <AlertTriangle className="w-6 h-6 text-danger-600" />
        </div>
        <div className="flex-1">
          <p className="text-gray-700">{message}</p>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
