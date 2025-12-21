/***********************************************/
/**               index.ts                    **/
/***********************************************/
// Archivo de inicio del servidor

import app from './app';
import { startExpirationScheduler } from './lib/scheduler';

const port = 3001;

// Iniciar scheduler de vencimientos
startExpirationScheduler();

// Manejadores globales de errores
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception thrown:', error);
  process.exit(1);
});

console.log('Backend: Attempting to start server...');
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log('Backend: Server started successfully and listening for requests.');
}).on('error', (err: any) => {
  console.error('Backend: Server failed to start or encountered an error:', err);
  process.exit(1);
});