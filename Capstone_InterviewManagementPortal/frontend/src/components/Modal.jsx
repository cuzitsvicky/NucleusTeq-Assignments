import React from 'react';
import { X } from 'lucide-react';

/**
 * Reusable modal popup window.
 * 
 * Props:
 * - isOpen (boolean): controls visibility
 * - onClose (function): triggered when closing the modal
 * - title (string): title text displayed in the header
 * - children (React node): content of the modal body
 */
export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close-btn" onClick={onClose}>
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
