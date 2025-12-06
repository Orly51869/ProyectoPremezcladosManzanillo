import React from "react";
import { Edit, Trash2 } from "lucide-react";

const ProductTable = ({ products, onEditProduct, onDeleteProduct, canManageProduct }) => {
  return (
    <div className="overflow-x-auto bg-white dark:bg-dark-primary rounded-2xl shadow-lg border border-brand-light dark:border-dark-surface">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-brand-light dark:divide-dark-surface">
          <thead className="dark:bg-dark-surface">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categoría</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Precio</th>
              {canManageProduct && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-primary divide-y divide-brand-light dark:divide-dark-surface">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-primary dark:text-gray-100">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text dark:text-gray-300">{product.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text dark:text-gray-300">{product.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text dark:text-gray-300">${product.price.toFixed(2)}</td>
                {canManageProduct && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEditProduct(product)}
                        className="text-brand-mid hover:text-brand-primary dark:text-green-400 dark:hover:text-green-300"
                        title="Editar"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
