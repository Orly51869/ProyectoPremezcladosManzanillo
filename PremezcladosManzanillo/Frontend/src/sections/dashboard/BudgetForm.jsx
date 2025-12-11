import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PlusCircle, Trash2 } from 'lucide-react';
import api from '../../utils/api';
import { format } from 'date-fns';
import ClientFormModal from "./ClientFormModal"; // Import the ClientFormModal

const BudgetForm = ({ initialValues = {}, onSave, onCancel, userRoles = [] }) => {
  // State for data fetched from API
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [showClientFormModal, setShowClientFormModal] = useState(false); // State for modal visibility
  const [serverError, setServerError] = useState(null); // State for server errors from client form

  // Form state
  const [clientId, setClientId] = useState(initialValues.clientId || '');
  const [title, setTitle] = useState(initialValues.title || '');
  const [address, setAddress] = useState(initialValues.address || '');
  const [deliveryDate, setDeliveryDate] = useState(initialValues.deliveryDate ? format(new Date(initialValues.deliveryDate), 'yyyy-MM-dd') : '');
  const [workType, setWorkType] = useState(initialValues.workType || 'vivienda');
  const [resistance, setResistance] = useState(initialValues.resistance || '150');
  const [concreteType, setConcreteType] = useState(initialValues.concreteType || 'convencional');
  const [element, setElement] = useState(initialValues.element || 'losa');
  const [observations, setObservations] = useState(initialValues.observations || '');
  const [volume, setVolume] = useState(initialValues.volume || '');

  const [productItems, setProductItems] = useState(initialValues.products?.map(item => ({
    productId: item.product.id,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    name: item.product.name,
  })) || []);
  const [errors, setErrors] = useState({});

  // Role / status based helpers
  const status = initialValues.status || '';
  const isApproved = status === 'APPROVED';
  const isPrivilegedEditor = userRoles.includes('Contable') || userRoles.includes('Administrador');
  const canViewPrices = isApproved || userRoles.includes('Contable') || userRoles.includes('Comercial') || userRoles.includes('Administrador');

  const fetchData = async () => {
    try {
      const [clientsRes, productsRes] = await Promise.all([
        api.get('/api/clients'),
        api.get('/api/products'),
      ]);
      setClients(clientsRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
      setErrors(prev => ({ ...prev, data: "Failed to load clients or products." }));
    }
  };

  // Fetch initial data (clients and products)
  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItem = () => {
    setProductItems([...productItems, { productId: '', quantity: 1, unitPrice: 0, name: '' }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = productItems.filter((_, i) => i !== index);
    setProductItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...productItems];
    newItems[index][field] = value;

    // If a product is selected, update its price and name
    if (field === 'productId') {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct) {
        newItems[index].unitPrice = selectedProduct.price;
        newItems[index].name = selectedProduct.name;
      }
    }
    setProductItems(newItems);
  };

  const calculateTotal = () => {
    return productItems.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  const validate = () => {
    const err = {};
    if (!clientId) err.clientId = 'Selecciona un cliente.';
    if (!title.trim()) err.title = 'El título del presupuesto es requerido.';

    // Validate deliveryDate
    if (deliveryDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const delivery = new Date(deliveryDate);
      delivery.setHours(0, 0, 0, 0);
      if (delivery <= today) {
        err.deliveryDate = 'La fecha de entrega debe ser al menos un día posterior a la fecha actual.';
      }
    }

    if (productItems.length === 0) err.items = 'Añade al menos un producto o servicio.';
    productItems.forEach((item, index) => {
      if (!item.productId) {
        err[`item_${index}`] = 'Selecciona un producto.';
      }
      if (!item.quantity || item.quantity <= 0) {
        err[`item_q_${index}`] = 'La cantidad debe ser mayor a 0.';
      }
    });
    return err;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const budgetData = {
      title,
      clientId,
      address,
      deliveryDate: deliveryDate || undefined,
      workType,
      resistance,
      concreteType,
      element,
      observations,
      volume: volume ? parseFloat(volume) : undefined,
      products: productItems.map(({ productId, quantity, unitPrice }) => {
        const base = { productId, quantity: Number(quantity) };
        if (isPrivilegedEditor) {
          base.unitPrice = Number(unitPrice || 0);
        }
        return base;
      }),
    };
    onSave(budgetData);
  };

  const handleOpenClientFormModal = () => {
    setShowClientFormModal(true);
    setServerError(null);
  };

  const handleCloseClientFormModal = () => {
    setShowClientFormModal(false);
    setServerError(null);
  };

  const handleSaveClientFromModal = async (formData) => {
    setServerError(null);
    try {
      const response = await api.post('/api/clients', formData);
      handleCloseClientFormModal();
      await fetchData(); // Refresh clients list
      setClientId(response.data.id); // Pre-select new client
    } catch (err) {
      console.error('Error saving client from modal:', err);
      if (err.response && err.response.status === 409) {
        setServerError(err.response.data.error);
      } else {
        setServerError('Error al crear el cliente. Por favor, inténtalo de nuevo.');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-primary rounded-2xl p-6 shadow-lg border border-brand-light dark:border-dark-surface max-w-4xl mx-auto"
    >
      <h2 className="text-xl font-semibold text-brand-primary dark:text-white mb-6">
        {initialValues.id ? "Editar Presupuesto" : "Nuevo Presupuesto"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cliente</label>
            {clients.length > 0 ? (
              <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 dark:bg-dark-surface dark:border-gray-600 focus:border-brand-primary focus:ring-brand-primary" disabled={isApproved && !isPrivilegedEditor}>
                <option value="">Seleccionar Cliente</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            ) : (
              <p className="mt-1 text-sm text-gray-500">No hay clientes. <button type="button" onClick={handleOpenClientFormModal} className="text-brand-primary hover:underline">Crea uno</button>.</p>
            )}
            {errors.clientId && <p className="text-sm text-red-500 mt-1">{errors.clientId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título del Presupuesto</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 dark:bg-dark-surface dark:border-gray-600 focus:border-brand-primary focus:ring-brand-primary" disabled={isApproved && !isPrivilegedEditor} />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dirección / Ubicación</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 dark:bg-dark-surface dark:border-gray-600 focus:border-brand-primary focus:ring-brand-primary" placeholder="Calle, sector, ciudad" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha estimada de entrega</label>
            <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 dark:bg-dark-surface dark:border-gray-600 focus:border-brand-primary focus:ring-brand-primary" disabled={isApproved && !isPrivilegedEditor} />
            {errors.deliveryDate && <p className="text-sm text-red-500 mt-1">{errors.deliveryDate}</p>}
          </div>
        </div>

        <hr className="my-2 border-gray-200 dark:border-gray-700" />

        {/* Project Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de obra</label>
            <select value={workType} onChange={(e) => setWorkType(e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 dark:bg-dark-surface dark:border-gray-600 focus:border-brand-primary focus:ring-brand-primary" disabled={isApproved && !isPrivilegedEditor}>
              <option value="vivienda">Vivienda</option>
              <option value="edificio">Edificio</option>
              <option value="pavimento">Pavimento</option>
              <option value="cimentacion">Cimentación</option>
              <option value="muro">Muro</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Resistencia requerida (f’c)</label>
            <select value={resistance} onChange={(e) => setResistance(e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 dark:bg-dark-surface dark:border-gray-600 focus:border-brand-primary focus:ring-brand-primary" disabled={isApproved && !isPrivilegedEditor}>
              <option value="150">150 kg/cm²</option>
              <option value="200">200 kg/cm²</option>
              <option value="250">250 kg/cm²</option>
              <option value="300">300 kg/cm²</option>
              <option value="350">350 kg/cm²</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de concreto</label>
            <select value={concreteType} onChange={(e) => setConcreteType(e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 dark:bg-dark-surface dark:border-gray-600 focus:border-brand-primary focus:ring-brand-primary" disabled={isApproved && !isPrivilegedEditor}>
              <option value="convencional">Convencional</option>
              <option value="bombeable">Bombeable</option>
              <option value="con_fibra">Con fibra</option>
              <option value="rapido_fraguado">Rápido fraguado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Elemento a colar</label>
            <select value={element} onChange={(e) => setElement(e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 dark:bg-dark-surface dark:border-gray-600 focus:border-brand-primary focus:ring-brand-primary" disabled={isApproved && !isPrivilegedEditor}>
              <option value="losa">Losa</option>
              <option value="columna">Columna</option>
              <option value="zapata">Zapata</option>
              <option value="firme">Firme</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Volumen total estimado (m³)</label>
            <input type="number" step="0.01" min="0" value={volume} onChange={(e) => setVolume(e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 dark:bg-dark-surface dark:border-gray-600 focus:border-brand-primary focus:ring-brand-primary" placeholder="Ej. 12.5" disabled={isApproved && !isPrivilegedEditor} />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Observaciones técnicas</label>
          <textarea value={observations} onChange={(e) => setObservations(e.target.value)} rows="4" className="mt-1 block w-full rounded-lg border-gray-300 dark:bg-dark-surface dark:border-gray-600 focus:border-brand-primary focus:ring-brand-primary" placeholder="Notas técnicas, referencias, restricciones de acceso, etc." disabled={isApproved && !isPrivilegedEditor}></textarea>
        </div>

        <hr className="my-2 border-gray-200 dark:border-gray-700" />

        {/* Product Items */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Productos y Servicios</h3>
          {productItems.map((item, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-dark-surface rounded-lg">
              <div className="flex-grow">
                <select
                  value={item.productId}
                  onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                  className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                  disabled={isApproved && !isPrivilegedEditor}
                >
                  <option value="">Seleccionar Producto</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {errors[`item_${index}`] && <p className="text-sm text-red-500 mt-1">{errors[`item_${index}`]}</p>}
              </div>
              <div className="w-24">
                <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600" disabled={isApproved && !isPrivilegedEditor} />
                {errors[`item_q_${index}`] && <p className="text-sm text-red-500 mt-1">{errors[`item_q_${index}`]}</p>}
              </div>

              {/* Price / per-item total: visible only to privileged roles or when approved */}
              <div className="w-36 text-right dark:text-gray-300">
                {canViewPrices ? (
                  isPrivilegedEditor ? (
                    <div className="flex items-center justify-end gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-28 rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-right"
                        disabled={isApproved && !isPrivilegedEditor}
                      />
                      <div className="text-sm">${(item.quantity * item.unitPrice).toFixed(2)}</div>
                    </div>
                  ) : (
                    <div>${(item.quantity * item.unitPrice).toFixed(2)}</div>
                  )
                ) : (
                  <div className="text-sm text-gray-500">Precio oculto hasta aprobación</div>
                )}
              </div>

              <button type="button" onClick={() => handleRemoveItem(index)} disabled={isApproved && !isPrivilegedEditor}>
                <Trash2 className={`h-5 w-5 ${isApproved && !isPrivilegedEditor ? 'text-gray-400' : 'text-red-500 hover:text-red-700'}`} />
              </button>
            </div>
          ))}
          <button type="button" onClick={handleAddItem} className={`flex items-center gap-2 font-medium ${isApproved && !isPrivilegedEditor ? 'text-gray-400' : 'text-brand-primary hover:text-brand-dark'}`} disabled={isApproved && !isPrivilegedEditor}>
            <PlusCircle size={20} />
            Añadir Item
          </button>
          {errors.items && <p className="text-sm text-red-500 mt-1">{errors.items}</p>}
        </div>

        {/* Total */}
        {canViewPrices && (
          <div className="text-right text-2xl font-bold text-gray-800 dark:text-white">
            Total: ${calculateTotal().toFixed(2)}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300">
            Cancelar
          </button>
          <button type="submit" className={`px-6 py-2 rounded-lg text-white ${isApproved && !isPrivilegedEditor ? 'bg-gray-400' : 'bg-brand-primary hover:bg-brand-mid'}`} disabled={isApproved && !isPrivilegedEditor}>
            Guardar
          </button>
        </div>
      </form>

      {showClientFormModal && (
        <ClientFormModal
          onSave={handleSaveClientFromModal}
          onCancel={handleCloseClientFormModal}
          isEditing={false}
          serverError={serverError}
        />
      )}
    </motion.div>
  );
};

export default BudgetForm;