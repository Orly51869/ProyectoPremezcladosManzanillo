import { Request, Response } from 'express';
import { logActivity } from '../utils/auditLogger';
import prisma from '../lib/prisma';

// Obtener todas las configuraciones
export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.setting.findMany();
    // Convertir a un objeto clave-valor para facilitar el uso en el frontend
    const settingsMap = settings.reduce((acc: any, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    res.json(settingsMap);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener configuraciones.' });
  }
};

// Obtener una configuración específica
export const getSettingByKey = async (req: Request, res: Response) => {
  const { key } = req.params;
  try {
    const setting = await prisma.setting.findUnique({ where: { key } });
    if (!setting) return res.status(404).json({ error: 'Configuración no encontrada.' });
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la configuración.' });
  }
};

// Crear o actualizar una configuración
export const updateSetting = async (req: Request, res: Response) => {
  const { key, value, type } = req.body;
  const authUserId = req.auth?.payload.sub as string;
  const userName = (req.auth?.payload as any)?.name || 'Administrador';
  const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] as string[] || [];

  // Solo Administrador y Comercial pueden cambiar configuraciones visuales
  if (!roles.includes('Administrador') && !roles.includes('Comercial')) {
    return res.status(403).json({ error: 'No tienes permiso para realizar esta acción.' });
  }

  if (!key || value === undefined) {
    return res.status(400).json({ error: 'Llave y valor son requeridos.' });
  }

  try {
    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value, type: type || 'text' },
      create: { key, value, type: type || 'text' },
    });

    await logActivity({
      userId: authUserId,
      userName,
      action: 'UPDATE',
      entity: 'SETTING',
      entityId: key,
      details: `Configuración actualizada: ${key}`
    });

    res.json(setting);
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Error al actualizar la configuración.' });
  }
};

// Subir un asset (imagen, logo, etc) y devolver la URL
export const uploadSettingAsset = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No se subió ningún archivo.' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/assets/${file.filename}`;

    res.json({ url: fileUrl });
  } catch (error) {
    console.error('Error uploading asset:', error);
    res.status(500).json({ error: 'Error al subir el archivo.' });
  }
};
