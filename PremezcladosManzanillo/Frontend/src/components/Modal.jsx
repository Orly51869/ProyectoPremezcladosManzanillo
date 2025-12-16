import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ onClose, title, children, zIndex = 'z-50', maxWidth = 'max-w-lg' }) => {
  return (
    <div className={`fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center ${zIndex}`}>
      <div className={`relative ${maxWidth} mx-auto bg-white dark:bg-dark-primary p-6 rounded-2xl shadow-lg border border-brand-light dark:border-dark-surface`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-brand-primary dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto pt-4 pb-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
