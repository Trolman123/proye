import React from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative bg-dark-900 border border-dark-700 rounded-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden animate-in`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700">
          <h3 className="text-lg font-display font-semibold text-dark-50">{title}</h3>
          <button onClick={onClose} className="text-dark-400 hover:text-dark-50 transition-colors">
            <FiX size={20} />
          </button>
        </div>
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
