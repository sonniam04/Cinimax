import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import ratingsRouter from '../src/routes/ratings';
import { prisma } from '../src/lib/prisma.js';
import { signToken } from '../src/lib/jwt.js';
import bcrypt from 'bcryptjs';

describe('Ratings Routes', () => {
  let userId: string;
  let token: string;
  const testMovieId = '550'; // Fight Club
  const testEmail = 'rating-test@example.com';
  const testPassword = 'RatingPass123';

  beforeEach(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        name: 'Rating Test User',
        email: testEmail,
        password: await bcrypt.hash(testPassword, 12)
      }
    });

    userId = user.id;
    token = signToken({ id: user.id, email: user.email, name: user.name });

    // Clean up ratings
    await prisma.rating.deleteMany({ where: { userId } });
  });

  afterEach(async () => {
    // Clean up
    await prisma.rating.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
  });

  describe('POST /ratings', () => {
    it('should create a new rating', async () => {
      const app = new Hono()
        .use('*', async (c, next) => {
          // Simple auth middleware for testing
          if (token) {
            const payload = { id: userId, email: testEmail, name: 'Test' };
            c.set('user', payload);
          }
          await next();
        })
        .route('/', ratingsRouter);

      const req = new Request('http://localhost/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `token=${token}`
        },
        body: JSON.stringify({
          tmdbMovieId: testMovieId,
          score: 8
        })
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(200);
      
      const data = await res.json() as any;
      expect(data.rating).toBe(8);

      // Verify in database
      const rating = await prisma.rating.findUnique({
        where: { userId_tmdbMovieId: { userId, tmdbMovieId: testMovieId } }
      });

      expect(rating).toBeDefined();
      expect(rating!.score).toBe(8);
    });

    it('should return 400 for invalid score (< 1)', async () => {
      const app = new Hono()
        .use('*', async (c, next) => {
          c.set('user', { id: userId, email: testEmail, name: 'Test' });
          await next();
        })
        .route('/', ratingsRouter);

      const req = new Request('http://localhost/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `token=${token}`
        },
        body: JSON.stringify({
          tmdbMovieId: testMovieId,
          score: 0
        })
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid score (> 10)', async () => {
      const app = new Hono()
        .use('*', async (c, next) => {
          c.set('user', { id: userId, email: testEmail, name: 'Test' });
          await next();
        })
        .route('/', ratingsRouter);

      const req = new Request('http://localhost/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `token=${token}`
        },
        body: JSON.stringify({
          tmdbMovieId: testMovieId,
          score: 11
        })
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(400);
    });

    it('should update existing rating', async () => {
      // Create initial rating
      await prisma.rating.create({
        data: {
          userId,
          tmdbMovieId: testMovieId,
          score: 6
        }
      });

      const app = new Hono()
        .use('*', async (c, next) => {
          c.set('user', { id: userId, email: testEmail, name: 'Test' });
          await next();
        })
        .route('/', ratingsRouter);

      const req = new Request('http://localhost/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `token=${token}`
        },
        body: JSON.stringify({
          tmdbMovieId: testMovieId,
          score: 9
        })
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(200);
      
      const data = await res.json() as any;
      expect(data.rating).toBe(9);
    });
  });

  describe('GET /ratings', () => {
    it('should get rating for a movie', async () => {
      // Create rating
      await prisma.rating.create({
        data: {
          userId,
          tmdbMovieId: testMovieId,
          score: 7
        }
      });

      const app = new Hono()
        .use('*', async (c, next) => {
          c.set('user', { id: userId, email: testEmail, name: 'Test' });
          await next();
        })
        .route('/', ratingsRouter);

      const req = new Request(`http://localhost/?movieId=${testMovieId}`, {
        method: 'GET',
        headers: {
          'Cookie': `token=${token}`
        }
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(200);
      
      const data = await res.json() as any;
      expect(data.rating).toBe(7);
    });

    it('should return null if no rating exists', async () => {
      const app = new Hono()
        .use('*', async (c, next) => {
          c.set('user', { id: userId, email: testEmail, name: 'Test' });
          await next();
        })
        .route('/', ratingsRouter);

      const req = new Request(`http://localhost/?movieId=${testMovieId}`, {
        method: 'GET',
        headers: {
          'Cookie': `token=${token}`
        }
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(200);
      
      const data = await res.json() as any;
      expect(data.rating).toBeNull();
    });
  });

  describe('DELETE /ratings', () => {
    it('should delete a rating', async () => {
      // Create rating
      await prisma.rating.create({
        data: {
          userId,
          tmdbMovieId: testMovieId,
          score: 7
        }
      });

      const app = new Hono()
        .use('*', async (c, next) => {
          c.set('user', { id: userId, email: testEmail, name: 'Test' });
          await next();
        })
        .route('/', ratingsRouter);

      const req = new Request(`http://localhost/?movieId=${testMovieId}`, {
        method: 'DELETE',
        headers: {
          'Cookie': `token=${token}`
        }
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(200);

      // Verify deletion
      const rating = await prisma.rating.findUnique({
        where: { userId_tmdbMovieId: { userId, tmdbMovieId: testMovieId } }
      });

      expect(rating).toBeUndefined();
    });
  });

  describe('Rating score validation', () => {
    it('should accept all valid scores 1-10', async () => {
      const app = new Hono()
        .use('*', async (c, next) => {
          c.set('user', { id: userId, email: testEmail, name: 'Test' });
          await next();
        })
        .route('/', ratingsRouter);

      for (let score = 1; score <= 10; score++) {
        const req = new Request('http://localhost/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': `token=${token}`
          },
          body: JSON.stringify({
            tmdbMovieId: `movie-${score}`,
            score
          })
        });

        const res = await app.fetch(req);
        expect(res.status).toBe(200);
      }
    });
  });
});
