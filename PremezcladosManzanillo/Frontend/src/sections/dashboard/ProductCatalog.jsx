import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/api';
import { PlusCircle, Search } from 'lucide-react';

const ProductCatalog = ({ onAddProduct }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/products');
        setProducts(response.data);
      } catch (err) {
        setError('No se pudieron cargar los productos.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categorizedProducts = useMemo(() => {
    return products
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .reduce((acc, product) => {
        const category = product.category?.name || 'Sin Categoría';
        if (!acc[category]) acc[category] = [];
        acc[category].push(product);
        return acc;
      }, {});
  }, [products, searchTerm]);

  if (loading) return <div className="p-4 text-center dark:text-gray-400">Cargando productos...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-dark-primary border-none rounded-lg focus:ring-2 focus:ring-brand-primary dark:text-white"
          />
        </div>
      </div>

      {/* Catalog List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
        {Object.keys(categorizedProducts).length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">No se encontraron productos</div>
        ) : (
          Object.keys(categorizedProducts).map(categoryName => (
            <div key={categoryName}>
              <h2 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 border-b dark:border-gray-800 pb-1">
                {categoryName}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categorizedProducts[categoryName].map(product => (
                  <div 
                    key={product.id} 
                    className="p-3 bg-gray-50 dark:bg-dark-primary/40 rounded-xl border border-transparent hover:border-brand-primary/30 transition-all group"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-gray-800 dark:text-gray-100 truncate group-hover:text-brand-primary transition-colors">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                            {product.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => onAddProduct(product)}
                        className="p-1.5 bg-brand-primary/10 text-brand-primary rounded-lg hover:bg-brand-primary hover:text-white transition-all transform active:scale-95 flex-shrink-0"
                        title="Añadir al presupuesto"
                      >
                        <PlusCircle size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;
