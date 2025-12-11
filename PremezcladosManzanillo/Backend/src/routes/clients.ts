import { Router } from 'express';
import { getClientsByOwner, createClient, updateClient, deleteClient } from '../controllers/clientController';

const router = Router();

// La ruta base /api/clients se maneja en index.ts
router.get('/', getClientsByOwner);
router.post('/', createClient);
router.put('/:id', updateClient); // Añadir ruta PUT para actualizar un cliente
router.delete('/:id', deleteClient); // Añadir ruta DELETE para eliminar un cliente

export default router;
