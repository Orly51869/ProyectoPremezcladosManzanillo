import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ onClose, title, children }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative max-w-lg mx-auto bg-white dark:bg-dark-primary p-6 rounded-2xl shadow-lg border border-brand-light dark:border-dark-surface">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-brand-primary dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
