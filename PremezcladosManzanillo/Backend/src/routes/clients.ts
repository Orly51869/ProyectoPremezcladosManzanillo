import { Router } from 'express';
import { getClientsByOwner, createClient, updateClient, deleteClient } from '../controllers/clientController';

const router = Router();

// The base path /api/clients is handled in index.ts
router.get('/', getClientsByOwner);
router.post('/', createClient);
router.put('/:id', updateClient); // Add PUT route for updating a client
router.delete('/:id', deleteClient); // Add DELETE route for deleting a client

export default router;
