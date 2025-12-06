import React from 'react';
import { Package } from 'lucide-react';
import ProductTable from './ProductTable.jsx';
import ProductCanvas from './ProductCanvas.jsx';

const ProductList = ({ products, viewMode, onEditProduct, onDeleteProduct, canManageProduct }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-10">
        <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No hay productos que coincidan con la búsqueda.</p>
      </div>
    );
  }

  return viewMode === 'canvas' ? (
    <ProductCanvas
      products={products}
      onEditProduct={onEditProduct}
      onDeleteProduct={onDeleteProduct}
      canManageProduct={canManageProduct}
    />
  ) : (
    <ProductTable
      products={products}
      onEditProduct={onEditProduct}
      onDeleteProduct={onDeleteProduct}
      canManageProduct={canManageProduct}
    />
  );
};

export default ProductList;
