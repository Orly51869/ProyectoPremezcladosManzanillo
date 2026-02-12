import React, { useState } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth0 } from '@auth0/auth0-react';
import { RefreshCw, Edit2, Check, X } from 'lucide-react';
import Modal from './Modal'; // Assuming generic Modal exists

const CurrencyToggle = () => {
    const { currency, exchangeRate, toggleCurrency, updateRateManual, isManual, loading, resetToOfficial, refreshRates } = useCurrency();
    const { user } = useAuth0();
    const rawRoles = user?.['https://premezcladomanzanillo.com/roles'] || [];
    const userRoles = [...rawRoles];
    if (user?.email === 'orlandojvelasquezt14@gmail.com' && !userRoles.includes('Administrador')) {
        userRoles.push('Administrador');
    }
    const canEditRate = userRoles.includes('Administrador') || userRoles.includes('Contable');

    const [isEditing, setIsEditing] = useState(false);
    const [tempRate, setTempRate] = useState('');

    const handleEditClick = () => {
        setTempRate(exchangeRate?.toString() || '');
        setIsEditing(true);
    };

    const handleSaveRate = () => {
        if (tempRate && !isNaN(parseFloat(tempRate))) {
            updateRateManual(tempRate);
            setIsEditing(false);
        }
    };

    const handleReset = () => {
        resetToOfficial();
        setIsEditing(false);
    }

    return (
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600">
            {/* Currency Switcher */}
            <div className="flex items-center gap-1 cursor-pointer" onClick={toggleCurrency} title="Cambiar moneda global">
                <span className={`text-sm font-bold ${currency === 'USD' ? 'text-green-600' : 'text-gray-400'}`}>$</span>
                <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${currency === 'VES' ? 'bg-blue-600' : 'bg-gray-400'}`}>
                    <div className={`bg-white w-3 h-3 rounded-full shadow-sm transition-transform ${currency === 'VES' ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
                <span className={`text-sm font-bold ${currency === 'VES' ? 'text-blue-600' : 'text-gray-400'}`}>Bs</span>
            </div>

            {/* Exchange Rate Display */}
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>

            <div className="flex items-center gap-1 text-xs">
                <span className="text-gray-500 dark:text-gray-400 hidden md:inline">Tasa:</span>
                <span className={`font-medium ${isManual ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300'}`}>
                    {exchangeRate ? exchangeRate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : '---'}
                </span>
                <span className="text-xs text-gray-500">Bs/$</span>
            </div>

            {/* Actions for Admin/Contable */}
            {canEditRate && (
                <button
                    onClick={handleEditClick}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-500 transition-colors"
                    title="Editar Tasa Manualmente"
                >
                    <Edit2 size={12} />
                </button>
            )}

            {/* Refresh Button (always available to try refetching official) */}
            <button
                onClick={refreshRates}
                disabled={loading}
                className={`p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-500 transition-colors ${loading ? 'animate-spin' : ''}`}
                title="Actualizar Tasa del BCV"
            >
                <RefreshCw size={12} />
            </button>

            {/* Edit Rate Modal */}
            {isEditing && (
                <div className="absolute top-16 right-4 z-50 bg-white dark:bg-dark-surface p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-64">
                    <h4 className="text-sm font-bold mb-2 text-gray-800 dark:text-white">Editar Tasa de Cambio</h4>
                    <p className="text-xs text-gray-500 mb-2">
                        Establece una tasa manual. Esto anulará la actualización automática del BCV.
                    </p>
                    <input
                        type="number"
                        value={tempRate}
                        onChange={(e) => setTempRate(e.target.value)}
                        className="w-full p-2 border rounded mb-3 text-sm dark:bg-gray-700 dark:text-white"
                        placeholder="Ej. 36.50"
                    />
                    <div className="flex justify-between gap-2">
                        <button
                            onClick={handleReset}
                            className="text-xs text-blue-600 hover:underline px-2 py-1"
                            title="Volver a tasa oficial BCV"
                        >
                            Restaurar Oficial
                        </button>
                        <div className="flex gap-2">
                            <button onClick={() => setIsEditing(false)} className="p-1 bg-gray-200 rounded text-gray-600 hover:bg-gray-300">
                                <X size={16} />
                            </button>
                            <button onClick={handleSaveRate} className="p-1 bg-green-600 rounded text-white hover:bg-green-700">
                                <Check size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CurrencyToggle;
