import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@hooks/useRedux';
import { removeNotification } from '@store/slices/uiSlice';
import './ToastNotification.css';

const ToastNotification: React.FC = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(state => state.ui.notifications);

  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration) {
        const timer = setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, notification.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, dispatch]);

  if (notifications.length === 0) return null;

  return (
    <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`toast show align-items-center text-white bg-${notification.type === 'error' ? 'danger' : notification.type} border-0`}
          role="alert"
        >
          <div className="d-flex">
            <div className="toast-body">
              <i className={`bi bi-${
                notification.type === 'success' ? 'check-circle' :
                notification.type === 'error' ? 'x-circle' :
                notification.type === 'warning' ? 'exclamation-triangle' :
                'info-circle'
              } me-2`}></i>
              {notification.message}
            </div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              onClick={() => dispatch(removeNotification(notification.id))}
            ></button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastNotification;
