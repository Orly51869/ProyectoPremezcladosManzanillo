"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSettingAsset = exports.updateSetting = exports.getSettingByKey = exports.getSettings = void 0;
const auditLogger_1 = require("../utils/auditLogger");
const prisma_1 = __importDefault(require("../lib/prisma"));
// Obtener todas las configuraciones
const getSettings = async (req, res) => {
    try {
        const settings = await prisma_1.default.setting.findMany();
        // Convertir a un objeto clave-valor para facilitar el uso en el frontend
        const settingsMap = settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {});
        res.json(settingsMap);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener configuraciones.' });
    }
};
exports.getSettings = getSettings;
// Obtener una configuración específica
const getSettingByKey = async (req, res) => {
    const { key } = req.params;
    try {
        const setting = await prisma_1.default.setting.findUnique({ where: { key } });
        if (!setting)
            return res.status(404).json({ error: 'Configuración no encontrada.' });
        res.json(setting);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener la configuración.' });
    }
};
exports.getSettingByKey = getSettingByKey;
// Crear o actualizar una configuración
const updateSetting = async (req, res) => {
    const { key, value, type } = req.body;
    const authUserId = req.auth?.payload.sub;
    const userName = req.dbUser?.name || req.auth?.payload?.name || 'Administrador';
    const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] || [];
    // Solo Administrador y Comercial pueden cambiar configuraciones visuales
    if (!roles.includes('Administrador') && !roles.includes('Comercial')) {
        return res.status(403).json({ error: 'No tienes permiso para realizar esta acción.' });
    }
    if (!key || value === undefined) {
        return res.status(400).json({ error: 'Llave y valor son requeridos.' });
    }
    try {
        const setting = await prisma_1.default.setting.upsert({
            where: { key },
            update: { value, type: type || 'text' },
            create: { key, value, type: type || 'text' },
        });
        await (0, auditLogger_1.logActivity)({
            userId: authUserId,
            userName,
            action: 'UPDATE',
            entity: 'SETTING',
            entityId: key,
            details: `Configuración actualizada: ${key}`
        });
        res.json(setting);
    }
    catch (error) {
        console.error('Error updating setting:', error);
        res.status(500).json({ error: 'Error al actualizar la configuración.' });
    }
};
exports.updateSetting = updateSetting;
// Subir un asset (imagen, logo, etc) y devolver la URL
const uploadSettingAsset = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No se subió ningún archivo.' });
        }
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        // Return path relative to public folder (served by frontend)
        const fileUrl = `/uploads/assets/${file.filename}`;
        res.json({ url: fileUrl });
    }
    catch (error) {
        console.error('Error uploading asset:', error);
        res.status(500).json({ error: 'Error al subir el archivo.' });
    }
};
exports.uploadSettingAsset = uploadSettingAsset;
