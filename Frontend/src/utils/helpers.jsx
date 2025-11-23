import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Formatea un número como moneda (USD).
 * @param {number} amount - Monto a formatear.
 * @returns {string} - Monto formateado.
 */
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

/**
 * Calcula el total de un presupuesto (items + iva)
 * @param {Array<{price:number, quantity:number}>} items - Lista de ítems.
 * @returns {{subtotal:number, iva:number, total:number}}
 */
export const calculateTotal = (items = []) => {
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const iva = subtotal * 0.16; // Asumir 16%
  return {
    subtotal,
    iva,
    total: subtotal + iva,
  };
};

/**
 * Formatea una fecha a 'dd/MM/yyyy' usando locale español.
 * @param {Date | string} date - Objeto Date o valor parseable.
 * @returns {string} - Fecha formateada.
 */
export const formatDate = (date) => {
  // Check if date is valid before formatting
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return format(parsedDate, "dd/MM/yyyy", { locale: es });
  } catch (error) {
    // Forgivingly return a simple format for non-standard date strings
    try {
        return new Date(date).toLocaleDateString('es-ES');
    } catch (e) {
        return "Fecha inválida";
    }
  }
};

/**
 * Genera un identificador corto usando timestamp y aleatorio.
 * @returns {string}
 */
export const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;



/**
 * Formats a value for a CSV cell, handling commas, quotes, and newlines.
 * @param {any} cellData - The data for the cell.
 * @returns {string} - The formatted CSV cell string.
 */
export const formatCsvCell = (cellData) => {
  const value = cellData === null || cellData === undefined ? '' : String(cellData);
  // If the value contains a comma, a newline, or a double quote, enclose it in double quotes.
  if (/[",\n]/.test(value)) {
    // Escape any double quotes inside the value by doubling them.
    const escapedValue = value.replace(/"/g, '""');
    return `"${escapedValue}"`;
  }
  return value;
};

/**
 * Filtra la lista de clientes por nombre o RIF (búsqueda case-insensitive en nombre).
 * @param {Array<{name:string, rif:string}>} clients
 * @param {string} search - Texto de búsqueda
 * @returns {Array} - Clientes que coinciden
 */
export const filterClients = (clients, search) => {
  if (!clients) return [];
  return clients.filter(
    (client) =>
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.rif.includes(search)
  );
};