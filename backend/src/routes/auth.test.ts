import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import { HonoRequest } from 'hono/hono-base';
import authRouter from '../src/routes/auth';
import { prisma } from '../src/lib/prisma.js';
import bcrypt from 'bcryptjs';

describe('Authentication Routes', () => {
  const testEmail = 'test@example.com';
  const testPassword = 'SecurePass123';
  const testName = 'Test User';

  beforeEach(async () => {
    // Clean up test user before each test
    await prisma.user.deleteMany({ where: { email: testEmail } });
  });

  afterEach(async () => {
    // Clean up after tests
    await prisma.user.deleteMany({ where: { email: testEmail } });
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const app = new Hono().route('/auth', authRouter);
      const req = new Request('http://localhost/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: testName,
          email: testEmail,
          password: testPassword
        })
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(201);
      
      const data = await res.json() as any;
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(testEmail);
      expect(data.user.name).toBe(testName);
    });

    it('should return 409 if email already exists', async () => {
      // Create first user
      await prisma.user.create({
        data: {
          name: testName,
          email: testEmail,
          password: await bcrypt.hash(testPassword, 12)
        }
      });

      const app = new Hono().route('/auth', authRouter);
      const req = new Request('http://localhost/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Another User',
          email: testEmail,
          password: 'AnotherPass123'
        })
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(409);
      
      const data = await res.json() as any;
      expect(data.error).toBe('emailExists');
    });

    it('should return 400 if fields are missing', async () => {
      const app = new Hono().route('/auth', authRouter);
      const req = new Request('http://localhost/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: testName,
          email: testEmail
          // missing password
        })
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(400);
      
      const data = await res.json() as any;
      expect(data.error).toBe('Missing fields');
    });

    it('should hash password securely', async () => {
      const app = new Hono().route('/auth', authRouter);
      const req = new Request('http://localhost/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: testName,
          email: testEmail,
          password: testPassword
        })
      });

      await app.fetch(req);
      
      const user = await prisma.user.findUnique({
        where: { email: testEmail }
      });

      expect(user).toBeDefined();
      expect(user!.password).not.toBe(testPassword);
      
      const isValid = await bcrypt.compare(testPassword, user!.password);
      expect(isValid).toBe(true);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      const hashedPassword = await bcrypt.hash(testPassword, 12);
      await prisma.user.create({
        data: {
          name: testName,
          email: testEmail,
          password: hashedPassword
        }
      });
    });

    it('should login successfully with correct credentials', async () => {
      const app = new Hono().route('/auth', authRouter);
      const req = new Request('http://localhost/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: testPassword
        })
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(200);
      
      const data = await res.json() as any;
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(testEmail);
      
      // Check for JWT cookie
      const setCookie = res.headers.get('set-cookie');
      expect(setCookie).toContain('token=');
    });

    it('should return 401 with incorrect password', async () => {
      const app = new Hono().route('/auth', authRouter);
      const req = new Request('http://localhost/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: 'WrongPassword123'
        })
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(401);
      
      const data = await res.json() as any;
      expect(data.error).toBe('Invalid credentials');
    });

    it('should return 401 with non-existent email', async () => {
      const app = new Hono().route('/auth', authRouter);
      const req = new Request('http://localhost/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: testPassword
        })
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(401);
    });

    it('should return 400 if fields are missing', async () => {
      const app = new Hono().route('/auth', authRouter);
      const req = new Request('http://localhost/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail
          // missing password
        })
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully and clear token', async () => {
      const app = new Hono().route('/auth', authRouter);
      const req = new Request('http://localhost/auth/logout', {
        method: 'POST'
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(200);
      
      // Check for token deletion
      const setCookie = res.headers.get('set-cookie');
      expect(setCookie).toContain('token=');
    });
  });

  describe('GET /auth/me', () => {
    it('should return null when no token provided', async () => {
      const app = new Hono().route('/auth', authRouter);
      const req = new Request('http://localhost/auth/me', {
        method: 'GET'
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(200);
      
      const data = await res.json() as any;
      expect(data.user).toBeNull();
    });

    it('should return user info with valid token', async () => {
      // This test would require setting up a valid JWT token
      // Simplified version shown here
      const app = new Hono().route('/auth', authRouter);
      
      // First register/login to get token
      const loginReq = new Request('http://localhost/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: testName,
          email: testEmail,
          password: testPassword
        })
      });

      const loginRes = await app.fetch(loginReq);
      const setCookie = loginRes.headers.get('set-cookie');

      // Now call /me with token
      const meReq = new Request('http://localhost/auth/me', {
        method: 'GET',
        headers: {
          'cookie': setCookie || ''
        }
      });

      const meRes = await app.fetch(meReq);
      expect(meRes.status).toBe(200);
      
      const data = await meRes.json() as any;
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(testEmail);
    });
  });
});
