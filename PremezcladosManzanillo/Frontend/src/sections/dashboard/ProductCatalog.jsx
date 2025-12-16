import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { PlusCircle } from 'lucide-react';

const ProductCatalog = ({ onAddProduct }) => {
  const [categorizedProducts, setCategorizedProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/products');
        const products = response.data;

        // Group products by category
        const grouped = products.reduce((acc, product) => {
          const category = product.category?.name || 'Sin Categoría';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(product);
          return acc;
        }, {});

        setCategorizedProducts(grouped);
      } catch (err) {
        setError('No se pudieron cargar los productos.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div>Cargando productos...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {Object.keys(categorizedProducts).map(categoryName => (
        <div key={categoryName}>
          <h2 className="text-2xl font-bold text-brand-primary dark:text-white mb-4">{categoryName}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorizedProducts[categoryName].map(product => (
              <div key={product.id} className="bg-white dark:bg-dark-surface rounded-lg shadow p-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg">{product.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{product.description}</p>
                </div>
                <button
                  onClick={() => onAddProduct(product)}
                  className="mt-4 bg-brand-primary text-white px-3 py-2 rounded-lg hover:bg-brand-mid transition duration-150 flex items-center justify-center gap-2 text-sm"
                >
                  <PlusCircle size={16} />
                  Añadir
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductCatalog;
