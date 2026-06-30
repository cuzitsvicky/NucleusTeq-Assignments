import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, size }) {
  if (!isOpen) return null;

  const contentClassName = `modal-content${size === 'large' ? ' modal-large' : ''}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={contentClassName} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
