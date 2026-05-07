import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import likesRouter from '../src/routes/likes';
import { prisma } from '../src/lib/prisma.js';
import { signToken } from '../src/lib/jwt.js';
import bcrypt from 'bcryptjs';

describe('Likes Routes', () => {
  let userId: string;
  let token: string;
  const testMovieId = '550';
  const testEmail = 'likes-test@example.com';
  const testPassword = 'LikesPass123';

  beforeEach(async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Likes Test User',
        email: testEmail,
        password: await bcrypt.hash(testPassword, 12)
      }
    });

    userId = user.id;
    token = signToken({ id: user.id, email: user.email, name: user.name });

    await prisma.like.deleteMany({ where: { userId } });
  });

  afterEach(async () => {
    await prisma.like.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
  });

  describe('POST /likes', () => {
    it('should add a like to a movie', async () => {
      const app = new Hono()
        .use('*', async (c, next) => {
          c.set('user', { id: userId, email: testEmail, name: 'Test' });
          await next();
        })
        .route('/', likesRouter);

      const req = new Request('http://localhost/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `token=${token}`
        },
        body: JSON.stringify({
          tmdbMovieId: testMovieId
        })
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(200);
      
      const data = await res.json() as any;
      expect(data.liked).toBe(true);

      // Verify in database
      const like = await prisma.like.findUnique({
        where: { userId_tmdbMovieId: { userId, tmdbMovieId: testMovieId } }
      });

      expect(like).toBeDefined();
    });

    it('should be idempotent (like same movie twice)', async () => {
      // Add first like
      await prisma.like.create({
        data: { userId, tmdbMovieId: testMovieId }
      });

      const app = new Hono()
        .use('*', async (c, next) => {
          c.set('user', { id: userId, email: testEmail, name: 'Test' });
          await next();
        })
        .route('/', likesRouter);

      const req = new Request('http://localhost/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `token=${token}`
        },
        body: JSON.stringify({
          tmdbMovieId: testMovieId
        })
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(200);

      // Verify only one like exists
      const likes = await prisma.like.findMany({
        where: { userId, tmdbMovieId: testMovieId }
      });

      expect(likes.length).toBe(1);
    });

    it('should return 400 if tmdbMovieId is missing', async () => {
      const app = new Hono()
        .use('*', async (c, next) => {
          c.set('user', { id: userId, email: testEmail, name: 'Test' });
          await next();
        })
        .route('/', likesRouter);

      const req = new Request('http://localhost/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `token=${token}`
        },
        body: JSON.stringify({})
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(400);
    });
  });

  describe('GET /likes', () => {
    it('should check if movie is liked', async () => {
      // Create a like
      await prisma.like.create({
        data: { userId, tmdbMovieId: testMovieId }
      });

      const app = new Hono()
        .use('*', async (c, next) => {
          c.set('user', { id: userId, email: testEmail, name: 'Test' });
          await next();
        })
        .route('/', likesRouter);

      const req = new Request(`http://localhost/?movieId=${testMovieId}`, {
        method: 'GET',
        headers: {
          'Cookie': `token=${token}`
        }
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(200);
      
      const data = await res.json() as any;
      expect(data.liked).toBe(true);
    });

    it('should return false if movie is not liked', async () => {
      const app = new Hono()
        .use('*', async (c, next) => {
          c.set('user', { id: userId, email: testEmail, name: 'Test' });
          await next();
        })
        .route('/', likesRouter);

      const req = new Request(`http://localhost/?movieId=${testMovieId}`, {
        method: 'GET',
        headers: {
          'Cookie': `token=${token}`
        }
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(200);
      
      const data = await res.json() as any;
      expect(data.liked).toBe(false);
    });
  });

  describe('DELETE /likes', () => {
    it('should remove a like', async () => {
      // Create a like
      await prisma.like.create({
        data: { userId, tmdbMovieId: testMovieId }
      });

      const app = new Hono()
        .use('*', async (c, next) => {
          c.set('user', { id: userId, email: testEmail, name: 'Test' });
          await next();
        })
        .route('/', likesRouter);

      const req = new Request(`http://localhost/?movieId=${testMovieId}`, {
        method: 'DELETE',
        headers: {
          'Cookie': `token=${token}`
        }
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(200);
      
      const data = await res.json() as any;
      expect(data.liked).toBe(false);

      // Verify deletion
      const like = await prisma.like.findUnique({
        where: { userId_tmdbMovieId: { userId, tmdbMovieId: testMovieId } }
      });

      expect(like).toBeUndefined();
    });

    it('should handle deleting non-existent like gracefully', async () => {
      const app = new Hono()
        .use('*', async (c, next) => {
          c.set('user', { id: userId, email: testEmail, name: 'Test' });
          await next();
        })
        .route('/', likesRouter);

      const req = new Request(`http://localhost/?movieId=${testMovieId}`, {
        method: 'DELETE',
        headers: {
          'Cookie': `token=${token}`
        }
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /likes/all', () => {
    it('should get all liked movies for user', async () => {
      // Create multiple likes
      const movieIds = ['550', '278', '238'];
      for (const id of movieIds) {
        await prisma.like.create({
          data: { userId, tmdbMovieId: id }
        });
      }

      const app = new Hono()
        .use('*', async (c, next) => {
          c.set('user', { id: userId, email: testEmail, name: 'Test' });
          await next();
        })
        .route('/', likesRouter);

      const req = new Request('http://localhost/all', {
        method: 'GET',
        headers: {
          'Cookie': `token=${token}`
        }
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(200);
      
      const data = await res.json() as any;
      expect(data.likes.length).toBe(3);
    });

    it('should return empty list if no likes exist', async () => {
      const app = new Hono()
        .use('*', async (c, next) => {
          c.set('user', { id: userId, email: testEmail, name: 'Test' });
          await next();
        })
        .route('/', likesRouter);

      const req = new Request('http://localhost/all', {
        method: 'GET',
        headers: {
          'Cookie': `token=${token}`
        }
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(200);
      
      const data = await res.json() as any;
      expect(data.likes.length).toBe(0);
    });
  });

  describe('Like uniqueness', () => {
    it('should maintain unique constraint on userId and tmdbMovieId', async () => {
      const movie1 = '550';
      const movie2 = '278';

      // Create likes
      await prisma.like.create({
        data: { userId, tmdbMovieId: movie1 }
      });

      await prisma.like.create({
        data: { userId, tmdbMovieId: movie2 }
      });

      // Verify both exist
      const likes = await prisma.like.findMany({
        where: { userId }
      });

      expect(likes.length).toBe(2);
      expect(likes.map(l => l.tmdbMovieId)).toContain(movie1);
      expect(likes.map(l => l.tmdbMovieId)).toContain(movie2);
    });
  });
});
