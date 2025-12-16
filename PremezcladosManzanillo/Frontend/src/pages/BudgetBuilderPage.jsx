import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../utils/api';
import ProductCatalog from '../sections/dashboard/ProductCatalog';
import CurrentBudgetSidebar from '../sections/dashboard/CurrentBudgetSidebar';

const BudgetBuilderPage = () => {
  const { id: budgetId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth0();
  const userRoles = user?.["https://premezcladomanzanillo.com/roles"] || [];

  const [budget, setBudget] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial budget data
  const fetchBudget = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/budgets/${budgetId}`);
      const fetchedBudget = response.data;
      setBudget(fetchedBudget);
      // Initialize items from budget if they exist (for editing)
      if (fetchedBudget.products) {
        setItems(fetchedBudget.products.map(p => ({
          productId: p.product.id,
          name: p.product.name,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
        })));
      }
    } catch (err) {
      setError('No se pudo cargar el presupuesto.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [budgetId]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  const handleAddProduct = (product) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.productId === product.id);
      if (existingItem) {
        // If item exists, increase quantity
        return prevItems.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Otherwise, add new item
        return [
          ...prevItems,
          {
            productId: product.id,
            name: product.name,
            quantity: 1,
            unitPrice: product.price, // Use default price from product
          },
        ];
      }
    });
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity > 0) {
      setItems(prevItems =>
        prevItems.map(item =>
          item.productId === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const handleRemoveItem = (productId) => {
    setItems(prevItems => prevItems.filter(item => item.productId !== productId));
  };

  const handleSaveBudget = async () => {
    const budgetData = {
      ...budget, // Send other budget details back
      status: 'PENDING', // Update status on save
      products: items.map(({ productId, quantity, unitPrice }) => ({
        productId,
        quantity,
        unitPrice,
      })),
    };

    try {
      await api.put(`/api/budgets/${budgetId}`, budgetData);
      navigate('/budgets'); // Navigate back to the list on success
    } catch (err) {
      setError('No se pudo guardar el presupuesto.');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Cargando constructor...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="flex h-[calc(100vh-theme(space.24))]"> {/* Adjust height based on your layout's navbar height */}
      {/* Left Column: Product Catalog */}
      <div className="w-2/3 p-6 overflow-y-auto">
        <ProductCatalog onAddProduct={handleAddProduct} />
      </div>

      {/* Right Column: Budget Sidebar */}
      <div className="w-1/3 bg-gray-50 dark:bg-dark-primary p-4 border-l border-gray-200 dark:border-gray-700">
        <CurrentBudgetSidebar
          budget={budget}
          items={items}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onSaveBudget={handleSaveBudget}
          userRoles={userRoles}
        />
      </div>
    </div>
  );
};

export default BudgetBuilderPage;
