"use strict";
/********************************/
/**     currencyController.ts  **/
/********************************/
// Archivo que permite definir controladores para la gestión de monedas
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCurrencyCache = exports.getExchangeRates = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const https_1 = __importDefault(require("https"));
// Variable en memoria para caché simple (evitar golpear BCV en cada request)
let cachedRates = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hora
// Función para obtener tasas de cambio
const getExchangeRates = async (req, res) => {
    try {
        const now = Date.now();
        if (cachedRates && (now - lastFetchTime < CACHE_DURATION)) {
            console.log('Serving exchange rates from cache');
            return res.json(cachedRates);
        }
        // BCV a veces tiene problemas de certificado SSL o bloquea bots.
        // Usamos un agente HTTPS que ignore errores de certificado (solo para scraping BCV).
        const httpsAgent = new https_1.default.Agent({ rejectUnauthorized: false });
        console.log('Fetching exchange rates from BCV...');
        const url = 'https://www.bcv.org.ve/';
        const { data } = await axios_1.default.get(url, {
            httpsAgent,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);
        const rates = {};
        // El BCV suele tener los indicadores en un div con id "dolar", "euro", etc. o una estructura iterativa.
        // Estructura común reciente: div con id='dolar', id='euro' dentro de #resumen_indicadores (o similar)
        // O bien, buscamos por el texto de la moneda.
        // Intentamos extraer USD y EUR
        // El formato suele ser: <strong> 36,1234 </strong>
        // Método de búsqueda específico para la estructura del BCV (div id="dolar", id="euro")
        const parseRate = (selector) => {
            // El selector suele ser algo como: #dolar .field-content .recuadrotsmc .centrado strong
            // O simplemente buscar el id y el texto dentro.
            // Estructura observada a veces: <div id="dolar"> ... <strong> 36,45 </strong> ... </div>
            const element = $(selector);
            if (element.length) {
                // Buscar el texto numérico
                const text = element.text().trim();
                // Limpiar el texto: 36,1234 -> 36.1234
                // Puede haber texto extra, usamos regex para sacar el número
                const match = text.match(/[\d,]+\.?\d*/);
                if (match) {
                    const numberStr = match[0].replace(',', '.');
                    return parseFloat(numberStr);
                }
            }
            return null;
        };
        // Estructura del BCV para tasas (revisada comúnmente)
        // Suelen estar en: #dolar, #euro, #yuan, #lira, #rublo
        const usdRate = parseRate('#dolar strong');
        const eurRate = parseRate('#euro strong');
        if (usdRate)
            rates['USD'] = usdRate;
        if (eurRate)
            rates['EUR'] = eurRate;
        // Si la estructura simple no funciona, intentamos buscar en la tabla de indicadores completa (view-tipo-de-cambio-oficial-del-bcv)
        if (!usdRate) {
            // Fallback: Busca en la lista de monedas
            $('.view-tipo-de-cambio-oficial-del-bcv .views-row').each((i, el) => {
                const currencyText = $(el).find('.moneda').text().trim(); // Ej: "USD"
                const rateText = $(el).find('.centrado strong').text().trim(); // Ej: "36,1234"
                if (currencyText && rateText) {
                    const normalizedRate = parseFloat(rateText.replace(',', '.'));
                    // Mapear símbolos/nombres a códigos ISO
                    if (currencyText.includes('USD') || currencyText.includes('Dolar'))
                        rates['USD'] = normalizedRate;
                    else if (currencyText.includes('EUR') || currencyText.includes('Euro'))
                        rates['EUR'] = normalizedRate;
                }
            });
        }
        if (Object.keys(rates).length === 0) {
            throw new Error('No se pudieron extraer las tasas del sitio del BCV');
        }
        // Actualizar cache
        cachedRates = rates;
        lastFetchTime = now;
        res.json(rates);
        // Devolver tasas de cambio
    }
    catch (error) {
        console.error('Error fetching exchange rates:', error.message);
        // Si falla y tenemos caché antigua, la devolvemos como fallback
        if (cachedRates) {
            console.log('Serving stale cache due to error');
            return res.json(cachedRates);
        }
        res.status(500).json({ error: 'Error al obtener tasas de cambio', details: error.message });
        // Devolver error
    }
};
exports.getExchangeRates = getExchangeRates;
// Exportar para poder limpiar la caché en los tests
const clearCurrencyCache = () => {
    cachedRates = null;
    lastFetchTime = 0;
};
exports.clearCurrencyCache = clearCurrencyCache;
