import express from 'express';
import { toNodeHandler } from 'better-auth/node';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

import { auth } from './auth.config';

const app = express();
const port = 3001;

// The auth config is passed to 'toNodeHandler' to create the middleware.
// This handler manages all routes under /api/auth/* (e.g., login, callback, logout).
app.use('/api/auth', toNodeHandler(auth));

// Other middleware like express.json() should be mounted AFTER the auth handler.
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});