import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2 } from 'lucide-react';

const ProductCanvas = ({ products = [], onEditProduct, onDeleteProduct, canManageProduct }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow flex flex-col justify-between"
        >
          <div>
            <h3 className="text-lg font-bold text-brand-primary dark:text-gray-100 mb-2">{product.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Categoría: {product.category?.name || product.category || 'N/A'}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Tipo: {product.type}</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white mt-3">${product.price.toFixed(2)}</p>
          </div>
          {canManageProduct && (
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => onEditProduct(product)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg text-center hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" /> Editar
              </button>
              <button
                onClick={() => onDeleteProduct(product.id)}
                className="bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 py-2 px-4 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default ProductCanvas;
