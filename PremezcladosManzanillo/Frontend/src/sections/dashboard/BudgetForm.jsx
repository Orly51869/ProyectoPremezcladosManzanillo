import React, { useState, useEffect, useMemo } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import api from "../../utils/api";
import { format } from "date-fns";
// Función para calcular fecha de vencimiento (7 días hábiles, Lun-Sáb, comenzando mañana)
const calculateBusinessExpirationDate = (startDate, days) => {
  let currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);
  currentDate.setDate(currentDate.getDate() + 1); // Comenzar a contar desde mañana

  let businessDaysCount = 0;
  while (businessDaysCount < days) {
    const day = currentDate.getDay();
    if (day !== 0) { // Saltar Domingo (0) solamente
      businessDaysCount++;
    }
    if (businessDaysCount === days) break;
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return currentDate;
};
import BudgetPDF from './BudgetPDF';
import ClientFormModal from './ClientFormModal';

import { useSettings } from "../../context/SettingsContext"; // Importar Contexto

const BudgetForm = ({
  initialValues = {},
  onSave,
  onCancel,
  userRoles = [],
}) => {
  const { settings } = useSettings(); // Obtener Configuración
  const ivaRate = parseFloat(settings?.company_iva || "16");

  // Estado para datos obtenidos de la API
  const [clients, setClients] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [showClientFormModal, setShowClientFormModal] = useState(false);
  const [serverError, setServerError] = useState(null);

  const [applyIva, setApplyIva] = useState(false); // Estado del toggle

  // Estado del formulario
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
    validUntil: initialValues.validUntil
      ? new Date(initialValues.validUntil).toISOString().split('T')[0]
      : format(calculateBusinessExpirationDate(new Date(), 7), "yyyy-MM-dd"),
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

  // Helpers basados en rol / estado
  const status = initialValues.status || "";
  const isApproved = status === "APPROVED";
  const isPrivilegedEditor = userRoles.includes("Contable") || userRoles.includes("Administrador") || userRoles.includes("Comercial");
  const canViewPrices = isApproved || isPrivilegedEditor || userRoles.includes("Comercial");

  const fetchData = async () => {
    try {
      const [clientsRes, productsRes] = await Promise.all([
        api.get("/api/clients"),
        api.get("/api/products"),
      ]);
      setClients(clientsRes.data);
      setAllProducts(productsRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Tipos de concreto dinámicos basados en las categorías de productos tipo CONCRETE
  const concreteTypes = useMemo(() => {
    const concreteProducts = allProducts.filter(p => p.type === 'CONCRETE');
    const categoriesMap = new Map();
    concreteProducts.forEach(p => {
      const catName = p.category?.name || p.category || 'Sin Categoría';
      if (!categoriesMap.has(catName)) {
        categoriesMap.set(catName, catName);
      }
    });
    // Convertir a array de opciones
    const types = Array.from(categoriesMap.keys()).map(name => ({
      value: name.toLowerCase().replace(/\s+/g, '_'),
      label: name,
      isPavement: name.toLowerCase().includes('pavimento'),
    }));
    return types.length > 0 ? types : [
      { value: 'convencional', label: 'Convencional', isPavement: false },
    ];
  }, [allProducts]);

  // Efecto para asegurar que el 'concreteType' seleccionado sea válido según los productos disponibles
  useEffect(() => {
    if (concreteTypes.length > 0) {
      const currentTypeValid = concreteTypes.some(t => t.value === formState.concreteType);
      if (!currentTypeValid) {
        // Si el valor actual no es válido (ej: "convencional" pero cargaron "estructural"), seleccionar el primero disponible
        setFormState(prev => ({ ...prev, concreteType: concreteTypes[0].value }));
      }
    }
  }, [concreteTypes, formState.concreteType]);

  // Detectar si el tipo seleccionado es un tipo de pavimento
  const selectedTypeIsPavement = useMemo(() => {
    const found = concreteTypes.find(t => t.value === formState.concreteType);
    return found?.isPavement || false;
  }, [concreteTypes, formState.concreteType]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    // Limpiar errores al escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    if (name === "deliveryDate" && value) {
      // Validar que no sea domingo
      const date = new Date(`${value}T00:00:00`);
      if (date.getDay() === 0) { // 0 es Domingo
        setErrors(prev => ({ ...prev, deliveryDate: "⛔ No trabajamos los domingos. Por favor seleccione de Lunes a Sábado." }));
      }
    }

    let updates = { [name]: value };

    // Si selecciona tipo "Bombeable", se activa automáticamente el servicio de bomba
    if (name === "concreteType") {
      // Detectar si el nuevo tipo es "bombeable" (por nombre de categoría)
      if (value.toLowerCase().includes('bombeable') || value.toLowerCase().includes('bomba')) {
        updates.pumpRequired = "true";
      }

      // Detectar si el nuevo tipo es pavimento
      const newType = concreteTypes.find(t => t.value === value);
      const oldType = concreteTypes.find(t => t.value === formState.concreteType);
      if (newType?.isPavement) {
        updates.resistance = "MR 40";
      }
      // Si deja de ser Pavimento, volver a una resistencia estándar
      else if (oldType?.isPavement && !newType?.isPavement) {
        updates.resistance = "150";
      }
    }

    setFormState(prev => ({ ...prev, ...updates }));
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
            type: product.type // Guardar tipo para cálculo de impuestos
          },
        ];
      }
    });
  };

  // --- AUTOMATIZACIÓN DE ÍTEMS ---
  // Función helper para encontrar el producto del catálogo que coincida con la selección
  const findMatchingProduct = (catValue, resistanceVal) => {
    if (!catValue || !resistanceVal || allProducts.length === 0) return null;

    // Normalizar valores de búsqueda
    const normalizedCat = catValue.toLowerCase().replace(/\s+/g, '');
    const normalizedRes = resistanceVal.toLowerCase().replace(/\s+/g, '');

    // Función auxiliar para verificar si el nombre del producto coincide con la resistencia
    const matchesResistance = (prod, resVal) => {
      const name = prod.name.toLowerCase().replace(/\s+/g, '');
      const res = resVal.toLowerCase().replace(/\s+/g, '');

      // Coincidencia directa (ej: "250" en "concreto250")
      if (name.includes(res)) return true;

      // Lógica especial para Pavimentos (MR)
      // Si buscamos "mr40", probar buscar solo "40" si el nombre tiene "pavi" o "vial"
      if (res.includes('mr')) {
        const numberPart = res.replace('mr', ''); // "40"
        if (name.includes(numberPart) && (name.includes('pavi') || name.includes('vial'))) {
          return true;
        }
      }
      return false;
    };

    // 1. Filtrar primero por categoría (Intentar ser específico)
    const categoryCandidates = allProducts.filter(p => {
      const pCat = (p.category?.name || p.category || '').toLowerCase().replace(/\s+/g, '');
      return p.type === 'CONCRETE' && (pCat.includes(normalizedCat) || normalizedCat.includes(pCat));
    });

    let match = categoryCandidates.find(p => matchesResistance(p, resistanceVal));

    // 2. FALLBACK: Si no hay match en la categoría, buscar en TODOS los concretos
    // Esto es crucial si la categoría está mal etiquetada o no coincide exactamente
    if (!match) {
      const allConcretes = allProducts.filter(p => p.type === 'CONCRETE');
      match = allConcretes.find(p => matchesResistance(p, resistanceVal));
    }

    return match;
  };

  // Efecto para sincronizar automáticamente el producto de concreto principal
  useEffect(() => {
    // Si no hay datos suficientes, no hacemos nada automágico
    if (!formState.concreteType || !formState.resistance || !formState.volume) return;

    const vol = parseFloat(formState.volume);
    if (isNaN(vol) || vol <= 0) return;

    const matchingProduct = findMatchingProduct(formState.concreteType, formState.resistance);

    if (matchingProduct) {
      setProductItems(prev => {
        // Buscar si ya tenemos ESTE producto
        const exists = prev.find(item => item.productId === matchingProduct.id);

        // Buscar si tenemos OTRO producto de concreto (para reemplazarlo, ya que cambió la selección)
        // Asumimos que es "otro" si tiene type CONCRETE o si su nombre incluye "Concreto"
        const otherConcreteIndex = prev.findIndex(item =>
          (item.name.toLowerCase().includes('concreto') || item.type === 'CONCRETE' || item.name.toLowerCase().includes('pavimento')) &&
          item.productId !== matchingProduct.id
        );

        let newItems = [...prev];

        if (exists) {
          // Solo actualizamos cantidad si es diferente
          if (exists.quantity !== vol) {
            newItems = newItems.map(item =>
              item.productId === matchingProduct.id ? { ...item, quantity: vol } : item
            );
          }
          // Si había otro concreto diferente (ej: antes era 200, ahora 250), lo quitamos
          if (otherConcreteIndex !== -1) {
            newItems.splice(otherConcreteIndex, 1);
          }
        } else {
          // No existe este producto exacto.
          // Si existe OTRO concreto, lo REEMPLAZAMOS
          if (otherConcreteIndex !== -1) {
            newItems[otherConcreteIndex] = {
              productId: matchingProduct.id,
              name: matchingProduct.name,
              quantity: vol,
              unitPrice: matchingProduct.price,
              type: matchingProduct.type
            };
          } else {
            // Si no hay ninguno, lo agregamos
            newItems.push({
              productId: matchingProduct.id,
              name: matchingProduct.name,
              quantity: vol,
              unitPrice: matchingProduct.price,
              type: matchingProduct.type
            });
          }
        }
        return newItems;
      });
    }
  }, [formState.concreteType, formState.resistance, formState.volume, allProducts]);

  // Efecto para sincronizar Servicio de Bomba
  useEffect(() => {
    const vol = parseFloat(formState.volume);
    const isValidVol = !isNaN(vol) && vol > 0;

    // Buscar producto de bomba en el catálogo
    const pumpProduct = allProducts.find(p =>
      p.name.toLowerCase().includes('bombeo') || p.name.toLowerCase().includes('bomba')
    );

    if (!pumpProduct) return;

    if (formState.pumpRequired === 'true' && isValidVol) {
      setProductItems(prev => {
        const exists = prev.find(p => p.productId === pumpProduct.id);
        if (exists) {
          // Actualizar cantidad si difiere
          if (exists.quantity !== vol) {
            return prev.map(p => p.productId === pumpProduct.id ? { ...p, quantity: vol } : p);
          }
          return prev;
        } else {
          // Agregar bomba
          return [...prev, {
            productId: pumpProduct.id,
            name: pumpProduct.name,
            quantity: vol,
            unitPrice: pumpProduct.price,
            type: pumpProduct.type
          }];
        }
      });
    } else if (formState.pumpRequired === 'false') {
      // Remover bomba si existe Y fue agregada (podría ser manual, pero asumimos sync)
      setProductItems(prev => prev.filter(p => p.productId !== pumpProduct.id));
    }
  }, [formState.pumpRequired, formState.volume, allProducts]);

  const handleUpdateQuantity = (productId, value) => {
    if (value === '') {
      setProductItems(prevItems =>
        prevItems.map(item =>
          item.productId === productId
            ? { ...item, quantity: '' }
            : item
        )
      );
      return;
    }

    const newQuantity = parseInt(value, 10);
    if (!isNaN(newQuantity) && newQuantity >= 0) {
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

  const calculateSubtotal = () => {
    return productItems.reduce((acc, item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      return acc + (quantity * price);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return applyIva ? subtotal * (1 + ivaRate / 100) : subtotal;
  };

  // Ordenar ítems para visualización: Concreto primero, luego Bomba, luego otros
  const sortedProductItems = useMemo(() => {
    return [...productItems].sort((a, b) => {
      const isConcreteA = a.type === 'CONCRETE' || a.name.toLowerCase().includes('concreto') || a.name.toLowerCase().includes('pavimento') || a.name.toLowerCase().includes('pavi');
      const isConcreteB = b.type === 'CONCRETE' || b.name.toLowerCase().includes('concreto') || b.name.toLowerCase().includes('pavimento') || b.name.toLowerCase().includes('pavi');

      const isPumpA = a.name.toLowerCase().includes('bombeo') || a.name.toLowerCase().includes('bomba');
      const isPumpB = b.name.toLowerCase().includes('bombeo') || b.name.toLowerCase().includes('bomba');

      // 1. Concreto va PRIMERO
      if (isConcreteA && !isConcreteB) return -1;
      if (!isConcreteA && isConcreteB) return 1;

      // 2. Bomba va SEGUNDO (después de concreto, antes de otros)
      if (isPumpA && !isPumpB) return -1;
      if (!isPumpA && isPumpB) return 1;

      return 0;
    });
  }, [productItems]);

  const validate = () => {
    const err = {};
    if (!formState.clientId) err.clientId = "Selecciona un cliente.";
    if (!formState.title.trim()) err.title = "El título del presupuesto es requerido.";
    // Observaciones ahora opcionales para guardar (se pueden requerir solo al aprobar si se desea)
    // if (!formState.observations.trim()) err.observations = "Las observaciones son obligatorias.";

    if (productItems.length === 0) err.items = "Añade al menos un producto o servicio.";

    // Validación de fecha en el submit también
    if (formState.deliveryDate) {
      const date = new Date(`${formState.deliveryDate}T00:00:00`);
      if (date.getDay() === 0) {
        err.deliveryDate = "⛔ No trabajamos los domingos.";
      }
    }

    // Validación de Bombeo (Min 10 m³)
    // Detectar si se seleccionó la opción O si hay un ítem de bombeo en la lista
    const pumpItem = productItems.find(item =>
      item.name.toLowerCase().includes('bombeo') ||
      item.name.toLowerCase().includes('bomba')
    );
    const hasPumpItem = !!pumpItem;

    if (formState.pumpRequired === 'true' || hasPumpItem) {
      const vol = parseFloat(formState.volume);
      if (!vol || vol < 10) {
        err.pumpRequired = "⚠️ El servicio de bombeo (seleccionado o en lista) requiere un volumen mínimo de 10 m³.";
      }

      // Validar que la cantidad del ítem de bombeo coincida con el volumen total (si existe el ítem)
      if (pumpItem && Math.abs(Number(pumpItem.quantity) - vol) > 0.1) {
        err.items = `⚠️ La cantidad de 'Bombeo' (${pumpItem.quantity}) debe coincidir con el Volumen Estimado (${vol} m³).`;
      }
    }

    // Validación de Consistencia de Volumen
    // La suma de las cantidades de items de "Concreto" debe ser igual al Volumen Estimado
    const totalConcreteQty = productItems
      .filter(item => item.name.toLowerCase().includes('concreto'))
      .reduce((sum, item) => sum + Number(item.quantity), 0);

    // Solo validamos si hay items de concreto y se ingresó un volumen
    if (totalConcreteQty > 0 && formState.volume) {
      const vol = parseFloat(formState.volume);
      if (Math.abs(totalConcreteQty - vol) > 0.1) { // Margen de error pequeño por decimales
        err.volume = `⚠️ La cantidad total de ítems de Concreto (${totalConcreteQty} m³) no coincide con el Volumen Estimado (${vol} m³). Ajuste los ítems o el volumen.`;
        // También marcamos error en items para que sea evidente
        if (!err.items) err.items = "Discrepancia entre Volumen Estimado y cantidad de productos.";
      }
    }

    return err;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      // Desplazar hacia arriba para asegurar que el usuario vea los errores
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Feedback inmediato CON detalles
      const errorMessages = Object.values(formErrors).join('\n- ');
      alert(`No se puede guardar. Por favor revisa:\n- ${errorMessages}`);
      return;
    }

    // Añadir información de IVA a observaciones para persistencia, ya que actualizar el esquema es riesgoso
    let finalObservations = formState.observations;
    if (applyIva) {
      finalObservations += `\n[IVA_APLICADO:${ivaRate}%]`;
    }

    const budgetData = {
      ...formState,
      observations: finalObservations,
      volume: formState.volume ? parseFloat(formState.volume) : undefined,
      validUntil: formState.validUntil || undefined,
      pumpRequired: formState.pumpRequired === 'true',
      // Enviar campos calculados por si el backend los usa o dependemos del cálculo del frontend
      total: calculateTotal(),
      applyIva: applyIva,
      products: productItems.map(({ productId, quantity, unitPrice }) => {
        // Asegurar que la cantidad sea al menos 1 al guardar
        const qty = Number(quantity);
        const base = { productId, quantity: qty > 0 ? qty : 1 };
        if (isPrivilegedEditor) {
          base.unitPrice = Number(unitPrice || 0);
        }
        return base;
      }),
    };

    try {
      onSave(budgetData);
    } catch (err) {
      console.error("Error calling onSave:", err);
      alert("Ocurrió un error al intentar guardar.");
    }
  };

  // Manejadores del modal de cliente
  const handleOpenClientFormModal = () => { setShowClientFormModal(true); setServerError(null); };
  const handleCloseClientFormModal = () => { setShowClientFormModal(false); setServerError(null); };
  const handleSaveClientFromModal = async (formData) => {
    setServerError(null);
    try {
      const response = await api.post("/api/clients", formData);
      handleCloseClientFormModal();
      await fetchData();
      setFormState(prev => ({ ...prev, clientId: response.data.id }));
    } catch (err) {
      setServerError(err.response?.data?.error || "Error al crear el cliente.");
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Formulario completo */}
      <div className="w-full space-y-4">
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
                  <PlusCircle size={20} />
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
                className={`mt-1 block w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-green-200 dark:text-gray-200 ${errors.deliveryDate ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface'}`}
              />
              {errors.deliveryDate && <p className="text-xs text-red-600 font-bold mt-1">{errors.deliveryDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-red-700 dark:text-red-400 font-bold">Válido Hasta (Vencimiento)</label>
              <input
                type="date"
                name="validUntil"
                value={formState.validUntil || format(calculateBusinessExpirationDate(new Date(), 7), "yyyy-MM-dd")}
                onChange={handleFormChange}
                disabled={!isPrivilegedEditor}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 focus:ring-2 dark:text-gray-200 ${!isPrivilegedEditor
                  ? 'bg-gray-100 dark:bg-dark-surface/50 border-gray-200 text-gray-500 cursor-not-allowed'
                  : 'border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-900/10 focus:ring-red-200'
                  }`}
              />
              {!isPrivilegedEditor && (
                <p className="text-[10px] text-gray-400 mt-1 italic">Solo Administradores pueden cambiar esta fecha.</p>
              )}
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
                <option value="vialidad">Vialidad</option>
                <option value="industrial">Industrial</option>
                <option value="obras_menores">Obras Menores</option>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoría</label>
              <select
                name="concreteType"
                value={formState.concreteType}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface px-3 py-2 focus:ring-2 focus:ring-green-200 dark:text-gray-200"
              >
                {concreteTypes.map(ct => (
                  <option key={ct.value} value={ct.value}>
                    {ct.label}{ct.isPavement ? ' (Pavimento)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Resistencia (kg/cm²)</label>
              <select
                name="resistance"
                value={formState.resistance}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface px-3 py-2 focus:ring-2 focus:ring-green-200 dark:text-gray-200"
              >
                {selectedTypeIsPavement ? (
                  <>
                    <option value="MR 40">MR 40</option>
                    <option value="MR 45">MR 45</option>
                    <option value="MR 50">MR 50</option>
                    <option value="50 ft">50 ft</option>
                  </>
                ) : (
                  <>
                    <option value="100">100</option>
                    <option value="120">120</option>
                    <option value="150">150</option>
                    <option value="180">180</option>
                    <option value="200">200</option>
                    <option value="210">210</option>
                    <option value="250">250</option>
                    <option value="280">280</option>
                    <option value="300">300</option>
                    <option value="350">350</option>
                  </>
                )}
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
                disabled={formState.concreteType.toLowerCase().includes('bombeable') || formState.concreteType.toLowerCase().includes('bomba')}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-green-200 dark:text-gray-200 ${formState.concreteType.toLowerCase().includes('bombeable') || formState.concreteType.toLowerCase().includes('bomba')
                  ? 'bg-gray-100 dark:bg-dark-surface/50 border-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-white dark:bg-dark-surface border-gray-200 dark:border-gray-600'
                  }`}
              >
                <option value="false">No requiere</option>
                <option value="true">Sí requiere</option>
              </select>
              {(formState.concreteType.toLowerCase().includes('bombeable') || formState.concreteType.toLowerCase().includes('bomba')) && (
                <p className="text-[10px] text-gray-400 mt-1 italic">Requerido automáticamente por tipo de concreto.</p>
              )}

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

        <hr className="my-4 border-gray-300 dark:border-gray-600" />

        {/* Carrito de Productos - Tabla de Alta Densidad */}
        <div className="bg-gray-50 dark:bg-dark-primary/30 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-surface flex justify-between items-center">
            <h3 className="text-xs font-black text-brand-primary uppercase tracking-widest">Resumen del Presupuesto</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase font-black text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-dark-surface/50">
                  <th className="px-4 py-2">Producto</th>
                  <th className="px-2 py-2 text-center w-20">Cant.</th>
                  {canViewPrices && <th className="px-2 py-2 text-right">Precio</th>}
                  <th className="px-4 py-2 text-right w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {sortedProductItems.length === 0 ? (
                  <tr>
                    <td colSpan={canViewPrices ? 4 : 3} className="px-4 py-8 text-center text-[11px] text-gray-400 italic">
                      No hay productos seleccionados.
                    </td>
                  </tr>
                ) : (
                  sortedProductItems.map(item => {
                    const isAutomated = item.type === 'CONCRETE' || item.name.toLowerCase().includes('bombeo') || item.name.toLowerCase().includes('bomba');
                    return (
                      <tr key={item.productId} className="hover:bg-white dark:hover:bg-dark-surface/30 transition-colors group">
                        <td className="px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-200">
                          {item.name}
                        </td>
                        <td className="px-2 py-2">
                          {isAutomated ? (
                            <div className="w-full h-8 flex items-center justify-center text-xs font-black text-gray-500 dark:text-gray-400">
                              {item.quantity}
                            </div>
                          ) : (
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateQuantity(item.productId, e.target.value)}
                              className="w-full h-8 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface text-center text-xs font-black text-brand-primary focus:ring-1 focus:ring-brand-primary"
                            />
                          )}
                        </td>
                        {canViewPrices && (
                          <td className="px-2 py-2 text-right text-xs font-bold text-gray-500 dark:text-gray-400">
                            ${item.unitPrice.toFixed(2)}
                          </td>
                        )}
                        <td className="px-4 py-2 text-right">
                          <button
                            onClick={() => handleRemoveItem(item.productId)}
                            className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all"
                            disabled={isAutomated}
                            title={isAutomated ? "Item automático (modificar volumen arriba)" : "Eliminar item"}
                          >
                            <Trash2 size={14} className={isAutomated ? "opacity-30" : ""} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {errors.items && <p className="text-[10px] text-red-500 font-bold px-4 py-2 bg-red-50 dark:bg-red-900/10 border-t border-red-100 dark:border-red-900/30">{errors.items}</p>}
        </div>

        {/* Total y Acciones */}
        <div className="pt-4 space-y-4">
          <div className="flex justify-between items-start">
            {/* IVA Toggle - Siempre visible SI IVA > 0 */}
            {ivaRate > 0 && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase text-gray-500 racking-wider">Impuesto (IVA)</label>
                <div className="flex bg-gray-100 dark:bg-dark-surface p-1 rounded-lg w-fit">
                  <button
                    type="button"
                    onClick={() => setApplyIva(false)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${!applyIva ? 'bg-white shadow text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    Exento (0%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setApplyIva(true)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${applyIva ? 'bg-white shadow text-brand-primary' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    Aplicar ({ivaRate}%)
                  </button>
                </div>
              </div>
            )}

            {canViewPrices && productItems.length > 0 && (
              <div className="flex flex-col items-end gap-1">
                <div className="text-sm text-gray-500">Subtotal: ${calculateSubtotal().toFixed(2)}</div>

                {applyIva && (
                  <div className="text-sm text-red-500 font-bold">
                    + IVA ({ivaRate}%): ${(calculateSubtotal() * (ivaRate / 100)).toFixed(2)}
                  </div>
                )}

                <div className="text-3xl font-black text-brand-primary dark:text-white border-t border-brand-light pt-1 mt-1">
                  Total: ${calculateTotal().toFixed(2)}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 mt-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600">Cancelar</button>
            <button type="button" onClick={handleSubmit} className="px-6 py-2 rounded-lg text-white bg-brand-primary hover:bg-brand-mid">Guardar</button>
          </div>
        </div>
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