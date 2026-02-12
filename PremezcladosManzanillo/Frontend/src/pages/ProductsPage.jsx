import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import api from "../utils/api";
import { Package, PlusCircle, List, LayoutGrid, Search } from "lucide-react";
import ProductFormModal from "../sections/dashboard/ProductFormModal";
import ProductList from "../sections/dashboard/ProductList";

const ProductsPage = () => {
  const { user } = useAuth0();
  const userRoles = user?.["https://premezcladomanzanillo.com/roles"] || [];

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [viewMode, setViewMode] = useState('list');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/products");
      setProducts(response.data);
    } catch (err) {
      setError("Error al cargar los productos.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const canManageProduct = useMemo(() => {
    return userRoles.includes("Administrador") || userRoles.includes("Contable");
  }, [userRoles]);

  const categoryOptions = useMemo(() => {
    const categoryNames = products
      .map(p => p.category?.name || (typeof p.category === 'string' ? p.category : null))
      .filter(Boolean);

    const uniqueCategories = [...new Set(categoryNames)];
    return [{ value: 'all', label: 'Todas las Categorías' }, ...uniqueCategories.map(c => ({ value: c, label: c }))];
  }, [products]);

  const typeOptions = useMemo(() => {
    const types = [...new Set(products.map(p => p.type))];
    const typeMap = {
      'CONCRETE': 'Concreto',
      'SERVICE': 'Servicio',
      'OTHER': 'Otro',
      'BLOCK': 'Bloque'
    };
    return [{ value: 'all', label: 'Todos los Tipos' }, ...types.map(t => ({ value: t, label: typeMap[t] || t }))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
      const productCategoryName = product.category?.name || (typeof product.category === 'string' ? product.category : '');
      const matchesCategory = categoryFilter === 'all' || productCategoryName === categoryFilter;
      const matchesType = typeFilter === 'all' || product.type === typeFilter;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [products, search, categoryFilter, typeFilter]);

  const handleAddNewProduct = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        await api.put(`/api/products/${editingProduct.id}`, productData);
      } else {
        await api.post("/api/products", productData);
      }
      handleCloseModal();
      fetchProducts();
    } catch (err) {
      console.error("Error saving product:", err);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        await api.delete(`/api/products/${productId}`);
        fetchProducts();
      } catch (err) {
        console.error("Error deleting product:", err);
        alert("Error al eliminar el producto. Inténtalo de nuevo.");
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  if (loading) return <div className="p-6 text-center">Cargando productos...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="w-full p-6 dark:bg-dark-primary">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Package className="w-8 h-8 text-black dark:text-green-400" />
          <h1 className="text-3xl font-bold text-brand-primary dark:text-white">
            Productos y Servicios
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <button onClick={() => setViewMode('canvas')} className={`p-2 rounded-lg ${viewMode === 'canvas' ? 'bg-brand-primary text-white' : 'bg-gray-200 dark:bg-dark-surface text-gray-600 dark:text-gray-300'}`}>
              <LayoutGrid size={20} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-brand-primary text-white' : 'bg-gray-200 dark:bg-dark-surface text-gray-600 dark:text-gray-300'}`}>
              <List size={20} />
            </button>
          </div>
          {canManageProduct && (
            <button
              onClick={handleAddNewProduct}
              className="bg-brand-primary text-white px-4 py-2 rounded-xl hover:bg-brand-mid transition duration-150 flex items-center gap-2"
            >
              <PlusCircle size={20} />
              Añadir Producto
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-dark-primary rounded-2xl p-6 shadow-lg border border-brand-light dark:border-dark-surface mb-6">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 flex items-center gap-3 w-full md:w-auto">
            <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 p-3 border border-brand-light dark:border-dark-surface rounded-xl dark:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-brand-mid dark:text-gray-200"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto justify-end">
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="p-3 border border-brand-light dark:border-dark-surface rounded-xl dark:bg-dark-surface text-sm dark:text-gray-200">
              {categoryOptions.map((opt, index) => <option key={`${opt.value}-${index}`} value={opt.value}>{opt.label}</option>)}
            </select>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="p-3 border border-brand-light dark:border-dark-surface rounded-xl dark:bg-dark-surface text-sm dark:text-gray-200">
              {typeOptions.map((opt, index) => <option key={`${opt.value}-${index}`} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <ProductList
        products={filteredProducts}
        viewMode={viewMode}
        onEditProduct={handleEditProduct}
        onDeleteProduct={handleDeleteProduct}
        canManageProduct={canManageProduct}
      />

      {showModal && (
        <ProductFormModal
          isOpen={showModal}
          onClose={handleCloseModal}
          onSave={handleSaveProduct}
          product={editingProduct}
        />
      )}
    </div>
  );
};

export default ProductsPage;