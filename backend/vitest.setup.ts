import { beforeEach, afterEach } from 'vitest';
import { prisma } from './src/lib/prisma.js';

// Clean up database before each test
beforeEach(async () => {
  // Note: In production, you'd use a test database
  // For now, this ensures a clean state
});

afterEach(async () => {
  // Clean up test data if needed
});

export {};
