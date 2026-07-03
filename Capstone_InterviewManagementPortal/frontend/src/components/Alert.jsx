import { useEffect } from 'react';

export default function Alert({ message, type = 'error', onClose }) {
  useEffect(() => {
    if (!message || !onClose) return undefined;

    const timer = window.setTimeout(onClose, 5000);
    return () => window.clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`alert alert-${type}`} role="alert">
      <strong>{type === 'error' ? 'Error' : 'Success'}</strong>
      <span>{message}</span>
    </div>
  );
}
