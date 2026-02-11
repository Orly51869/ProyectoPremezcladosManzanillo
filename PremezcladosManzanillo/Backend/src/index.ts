/***********************************************/
/**               index.ts                    **/
/***********************************************/
// Archivo de inicio del servidor

import app from './app';
import { startExpirationScheduler } from './lib/scheduler';
import prisma from './lib/prisma';

const port = 3002;

// Iniciar scheduler de vencimientos
startExpirationScheduler();

// Manejadores globales de errores
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // No salir inmediatamente, permitir manejo elegante si es posible
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception thrown:', error);
  process.exit(1);
});

console.log('Backend: Attempting to start server...');
const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log('Backend: Server started successfully and listening for requests.');
});

server.on('error', (err: any) => {
  console.error('Backend: Server failed to start or encountered an error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please close the process using this port.`);
  }
  process.exit(1);
});

// Manejo de cierre elegante (Graceful Shutdown)
const gracefulShutdown = async () => {
  console.log('Recibida señal de cierre. Cerrando servidor...');

  server.close(async () => {
    console.log('Servidor HTTP cerrado.');

    try {
      await prisma.$disconnect();
      console.log('Conexión a base de datos cerrada.');
    } catch (err) {
      console.error('Error al desconectar Prisma:', err);
    }

    process.exit(0);
  });

  // Forzar cierre si tarda mucho
  setTimeout(() => {
    console.error('No se pudo cerrar a tiempo, forzando salida.');
    process.exit(1);
  }, 5000);
};

// Escuchar señales de terminación (Ctrl+C, kill, etc.)
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);