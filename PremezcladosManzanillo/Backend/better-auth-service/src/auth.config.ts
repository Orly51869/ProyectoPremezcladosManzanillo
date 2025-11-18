import { betterAuth } from 'better-auth';
import { memoryAdapter } from 'better-auth/adapters/memory';
import { sso } from '@better-auth/sso';

// The memory adapter requires an object to use as the in-memory database.
const db = {};

export const auth = betterAuth({
  // Pass the in-memory database object to the adapter.
  database: memoryAdapter(db),

  emailAndPassword: {
    enabled: true,
  },

  plugins: [sso()],

  debug: process.env.NODE_ENV !== 'production',
});
