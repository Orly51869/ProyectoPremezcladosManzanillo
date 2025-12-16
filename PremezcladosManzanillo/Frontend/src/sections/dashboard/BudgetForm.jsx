import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Trash2 } from "lucide-react";
import api from "../../utils/api";
import { format } from "date-fns";
import ClientFormModal from "./ClientFormModal";
import ProductCatalog from "./ProductCatalog"; // Importar el catálogo de productos

const BudgetForm = ({
  initialValues = {},
  onSave,
  onCancel,
  userRoles = [],
}) => {
  // State for data fetched from API
  const [clients, setClients] = useState([]);
  const [showClientFormModal, setShowClientFormModal] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Form state
  const [formState, setFormState] = useState({
    clientId: initialValues.clientId || "",
    title: initialValues.title || "",
    address: initialValues.address || "",
    deliveryDate: initialValues.deliveryDate ? format(new Date(initialValues.deliveryDate), "yyyy-MM-dd") : "",
    workType: initialValues.workType || "vivienda",
    resistance: initialValues.resistance || "150",
    concreteType: initialValues.concreteType || "convencional",
    element: initialValues.element || "",
    observations: initialValues.observations || "",
    volume: initialValues.volume || "",
    pumpRequired: initialValues.pumpRequired === true ? "true" : "false",
  });
  
  const [productItems, setProductItems] = useState(
    initialValues.products?.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      name: item.product.name,
    })) || []
  );
  const [errors, setErrors] = useState({});

  // Role / status based helpers
  const status = initialValues.status || "";
  const isApproved = status === "APPROVED";
  const isPrivilegedEditor = userRoles.includes("Contable") || userRoles.includes("Administrador");
  const canViewPrices = isApproved || isPrivilegedEditor || userRoles.includes("Comercial");

  const fetchData = async () => {
    try {
      const clientsRes = await api.get("/api/clients");
      setClients(clientsRes.data);
    } catch (error) {
      console.error("Failed to fetch clients", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = (product) => {
    setProductItems(prevItems => {
      const existingItem = prevItems.find(item => item.productId === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prevItems,
          {
            productId: product.id,
            name: product.name,
            quantity: 1,
            unitPrice: product.price,
          },
        ];
      }
    });
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity > 0) {
      setProductItems(prevItems =>
        prevItems.map(item =>
          item.productId === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const handleRemoveItem = (productId) => {
    setProductItems(prevItems => prevItems.filter(item => item.productId !== productId));
  };

  const calculateTotal = () => {
    return productItems.reduce(
      (total, item) => total + item.quantity * item.unitPrice,
      0
    );
  };

  const validate = () => {
    const err = {};
    if (!formState.clientId) err.clientId = "Selecciona un cliente.";
    if (!formState.title.trim()) err.title = "El título del presupuesto es requerido.";
    if (!formState.observations.trim()) err.observations = "Las observaciones son obligatorias.";
    if (productItems.length === 0) err.items = "Añade al menos un producto o servicio.";
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
      ...formState,
      volume: formState.volume ? parseFloat(formState.volume) : undefined,
      pumpRequired: formState.pumpRequired === 'true',
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
  
  // Client modal handlers
  const handleOpenClientFormModal = () => { setShowClientFormModal(true); setServerError(null); };
  const handleCloseClientFormModal = () => { setShowClientFormModal(false); setServerError(null); };
  const handleSaveClientFromModal = async (formData) => {
    setServerError(null);
    try {
      const response = await api.post("/api/clients", formData);
      handleCloseClientFormModal();
      await fetchData();
      setFormState(prev => ({...prev, clientId: response.data.id}));
    } catch (err) {
      setServerError(err.response?.data?.error || "Error al crear el cliente.");
    }
  };

  return (
    <div className="flex gap-6">
      {/* Columna Izquierda: Formulario y Carrito */}
      <div className="w-1/2 space-y-4">
        <form className="space-y-4">
          {/* Campos del formulario */}
          {/* Sección 1: Datos del Proyecto */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cliente</label>
              <div className="flex items-center gap-2 mt-1">
                <select
                  name="clientId"
                  value={formState.clientId}
                  onChange={handleFormChange}
                  className="block w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface px-3 py-2 focus:ring-2 focus:ring-green-200 dark:text-gray-200"
                >
                  <option value="">Seleccionar Cliente</option>
                  {clients.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
                <button
                  type="button"
                  onClick={handleOpenClientFormModal}
                  className="p-2 bg-green-700 hover:bg-green-600 text-white rounded-lg transition-colors"
                  title="Crear Nuevo Cliente"
                >
                  <PlusCircle size={20}/>
                </button>
              </div>
              {errors.clientId && <p className="text-sm text-red-600 mt-1">{errors.clientId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título del Proyecto</label>
              <input
                type="text"
                name="title"
                value={formState.title}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface px-3 py-2 focus:ring-2 focus:ring-green-200 dark:text-gray-200"
                placeholder="Ej. Losa Casa Familia Pérez"
              />
              {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Sección 2: Ubicación y Fecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dirección de Obra</label>
              <input
                type="text"
                name="address"
                value={formState.address}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface px-3 py-2 focus:ring-2 focus:ring-green-200 dark:text-gray-200"
                placeholder="Calle, Sector, Ciudad"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Estimada</label>
              <input
                type="date"
                name="deliveryDate"
                value={formState.deliveryDate}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface px-3 py-2 focus:ring-2 focus:ring-green-200 dark:text-gray-200"
              />
            </div>
          </div>

          {/* Sección 3: Detalles Técnicos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Obra</label>
              <select
                name="workType"
                value={formState.workType}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface px-3 py-2 focus:ring-2 focus:ring-green-200 dark:text-gray-200"
              >
                  <option value="vivienda">Vivienda</option>
                  <option value="edificio">Edificio</option>
                  <option value="comercial">Comercial</option>
                  <option value="pavimento">Pavimento</option>
                  <option value="otro">Otro</option>
              </select>
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Elemento</label>
               <input
                type="text"
                name="element"
                value={formState.element}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface px-3 py-2 focus:ring-2 focus:ring-green-200 dark:text-gray-200"
                placeholder="Ej. Losa PB, Columnas"
               />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Resistencia (kg/cm²)</label>
              <select
                name="resistance"
                value={formState.resistance}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface px-3 py-2 focus:ring-2 focus:ring-green-200 dark:text-gray-200"
              >
                  <option value="150">150</option>
                  <option value="180">180</option>
                  <option value="200">200</option>
                  <option value="210">210</option>
                  <option value="250">250</option>
                  <option value="280">280</option>
                  <option value="300">300</option>
                  <option value="350">350</option>
                  <option value="otro">Otro</option>
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo Concreto</label>
              <select
                name="concreteType"
                value={formState.concreteType}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface px-3 py-2 focus:ring-2 focus:ring-green-200 dark:text-gray-200"
              >
                  <option value="convencional">Convencional</option>
                  <option value="bombeable">Bombeable</option>
                  <option value="mr">MR (Pavimento)</option>
                  <option value="fino">Fino</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Volumen Estimado (m³)</label>
               <input
                type="number"
                step="0.01"
                min="0"
                name="volume"
                value={formState.volume}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface px-3 py-2 focus:ring-2 focus:ring-green-200 dark:text-gray-200"
                placeholder="0.00"
               />
             </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Servicio de Bomba</label>
              <select
                name="pumpRequired"
                value={formState.pumpRequired}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface px-3 py-2 focus:ring-2 focus:ring-green-200 dark:text-gray-200"
              >
                  <option value="false">No requiere</option>
                  <option value="true">Sí requiere</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Observaciones (Requerido para aprobación)</label>
            <textarea
              name="observations"
              value={formState.observations}
              onChange={handleFormChange}
              rows="3"
              className={`mt-1 block w-full rounded-lg border ${errors.observations ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} bg-white dark:bg-dark-surface px-3 py-2 focus:ring-2 focus:ring-green-200 dark:text-gray-200`}
              placeholder="Detalles importantes para la logística o validación técnica..."
            />
            {errors.observations && <p className="text-sm text-red-600 mt-1">{errors.observations}</p>}
          </div>
        </form>

        <hr className="my-4 border-gray-300 dark:border-gray-600"/>

        {/* Carrito de Productos */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">Productos en Presupuesto</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {productItems.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Añade productos del catálogo</p>
            ) : (
              productItems.map(item => (
                <div key={item.productId} className="flex items-center justify-between bg-gray-50 dark:bg-dark-surface p-2 rounded-lg">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    {isPrivilegedEditor && <p className="text-sm text-gray-500">${item.unitPrice.toFixed(2)} c/u</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" min="1" value={item.quantity} onChange={(e) => handleUpdateQuantity(item.productId, parseInt(e.target.value, 10) || 1)} className="w-16 rounded-lg border-gray-300 dark:bg-dark-surface dark:border-gray-600 text-center"/>
                    <button onClick={() => handleRemoveItem(item.productId)}><Trash2 className="h-5 w-5 text-red-500 hover:text-red-700"/></button>
                  </div>
                </div>
              ))
            )}
          </div>
           {errors.items && <p className="text-sm text-red-500 mt-1">{errors.items}</p>}
        </div>
        
        {/* Total y Acciones */}
        <div className="pt-4 space-y-4">
          {canViewPrices && productItems.length > 0 && (
            <div className="text-right text-2xl font-bold text-gray-800 dark:text-white">
              Total: ${calculateTotal().toFixed(2)}
            </div>
          )}
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600">Cancelar</button>
            <button type="button" onClick={handleSubmit} className="px-6 py-2 rounded-lg text-white bg-brand-primary hover:bg-brand-mid">Guardar</button>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Catálogo */}
      <div className="w-1/2">
        <ProductCatalog onAddProduct={handleAddProduct} />
      </div>

      {showClientFormModal && (
        <ClientFormModal
          onSave={handleSaveClientFromModal}
          onCancel={handleCloseClientFormModal}
          isEditing={false}
          serverError={serverError}
        />
      )}
    </div>
  );
};

export default BudgetForm;