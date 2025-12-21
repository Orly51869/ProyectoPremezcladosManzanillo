import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/api';
import { Plus, Search, Layers, Box, Wrench, Menu } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const ProductCatalog = ({ onAddProduct }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  const tabs = [
    { id: 'ALL', label: 'Todos', icon: Menu },
    { id: 'CONCRETE', label: 'Concreto', icon: Layers },
    { id: 'BLOCK', label: 'Bloques', icon: Box },
    { id: 'SERVICE', label: 'Servicios', icon: Wrench },
    { id: 'OTHER', label: 'Otros', icon: Plus },
  ];

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

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === 'ALL' || p.type === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [products, searchTerm, activeTab]);

  const categorizedProducts = useMemo(() => {
    return filteredProducts.reduce((acc, product) => {
      const category = product.category?.name || 'Sin Categoría';
      if (!acc[category]) acc[category] = [];
      acc[category].push(product);
      return acc;
    }, {});
  }, [filteredProducts]);

  if (loading) return <div className="p-4 text-center dark:text-gray-400 text-xs">Cargando productos...</div>;
  if (error) return <div className="p-4 text-center text-red-500 text-xs">{error}</div>;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Header with Search and Tabs */}
      <div className="p-3 bg-gray-50/50 dark:bg-dark-primary/20 border-b border-gray-100 dark:border-gray-800 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-dark-primary/60 border border-gray-100 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-brand-primary outline-none dark:text-white"
          />
        </div>

        {/* Tabs Desktop */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  isActive 
                    ? 'bg-brand-primary text-white shadow-md' 
                    : 'bg-white dark:bg-dark-primary/40 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-primary/60'
                }`}
              >
                <Icon size={12} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Catalog List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {Object.keys(categorizedProducts).length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-[10px] uppercase font-bold tracking-widest">Sin resultados</div>
        ) : (
          Object.keys(categorizedProducts).map(categoryName => (
            <div key={categoryName} className="mb-4">
              <div className="flex items-center gap-2 mb-2 px-2">
                <span className="h-px bg-gray-100 dark:bg-gray-800 flex-1"></span>
                <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                  {categoryName}
                </span>
                <span className="h-px bg-gray-100 dark:bg-gray-800 flex-1"></span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categorizedProducts[categoryName].map(product => (
                  <div 
                    key={product.id} 
                    className="flex items-center justify-between gap-3 px-3 py-2 bg-gray-50/50 dark:bg-dark-primary/30 rounded-lg border border-transparent hover:border-brand-primary/20 transition-all group"
                    title={product.description || 'Sin descripción'}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[11px] text-gray-700 dark:text-gray-200 truncate group-hover:text-brand-primary transition-colors">
                        {product.name}
                      </div>
                      <div className="text-[10px] font-medium text-brand-primary/80">
                        {formatCurrency(product.price)}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => onAddProduct(product)}
                      className="p-1.5 bg-white dark:bg-dark-surface text-brand-primary shadow-sm rounded-md border border-gray-100 dark:border-gray-800 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all transform active:scale-90"
                      title="Añadir"
                    >
                      <Plus size={12} />
                    </button>
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
