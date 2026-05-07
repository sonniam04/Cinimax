import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import commentsRouter from '../src/routes/comments';
import { prisma } from '../src/lib/prisma.js';
import { signToken } from '../src/lib/jwt.js';
import bcrypt from 'bcryptjs';

describe('Comments Routes', () => {
  let userId: string;
  let userId2: string;
  let token: string;
  let token2: string;
  const testMovieId = '550';
  const testEmail = 'comments-test@example.com';
  const testEmail2 = 'comments-test2@example.com';
  const testPassword = 'CommentsPass123';

  beforeEach(async () => {
    // Create first user
    const user = await prisma.user.create({
      data: {
        name: 'Comments Test User',
        email: testEmail,
        password: await bcrypt.hash(testPassword, 12)
      }
    });

    userId = user.id;
    token = signToken({ id: user.id, email: user.email, name: user.name });

    // Create second user
    const user2 = await prisma.user.create({
      data: {
        name: 'Comments Test User 2',
        email: testEmail2,
        password: await bcrypt.hash(testPassword, 12)
      }
    });

    userId2 = user2.id;
    token2 = signToken({ id: user2.id, email: user2.email, name: user2.name });

    // Clean up comments
    await prisma.comment.deleteMany({ where: { tmdbMovieId: testMovieId } });
  });

  afterEach(async () => {
    await prisma.comment.deleteMany({ where: { tmdbMovieId: testMovieId } });
    await prisma.user.deleteMany({ where: { id: { in: [userId, userId2] } } });
  });

  describe('POST /comments', () => {
    it('should create a new comment', async () => {
      const app = new Hono()
        .use('*', async (c, next) => {
          c.set('user', { id: userId, email: testEmail, name: 'Test' });
          await next();
        })
        .route('/', commentsRouter);

      const commentText = 'This is a great movie!';
      const req = new Request('http://localhost/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `token=${token}`
        },
        body: JSON.stringify({
          tmdbMovieId: testMovieId,
          body: commentText
        })
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(201);
      
      const data = await res.json() as any;
      expect(data.comment).toBeDefined();
      expect(data.comment.body).toBe(commentText);
      expect(data.comment.user.id).toBe(userId);

      // Verify in database
      const comment = await prisma.comment.findUnique({
        where: { id: data.comment.id }
      });

      expect(comment).toBeDefined();
      expect(comment!.body).toBe(commentText);
    });

    it('should return 400 for empty comment', async () => {
      const app = new Hono()
        .use('*', async (c, next) => {
          c.set('user', { id: userId, email: testEmail, name: 'Test' });
          await next();
        })
        .route('/', commentsRouter);

      const req = new Request('http://localhost/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `token=${token}`
        },
        body: JSON.stringify({
          tmdbMovieId: testMovieId,
          body: '   '
        })
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing fields', async () => {
      const app = new Hono()
        .use('*', async (c, next) => {
          c.set('user', { id: userId, email: testEmail, name: 'Test' });
          await next();
        })
        .route('/', commentsRouter);

      const req = new Request('http://localhost/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `token=${token}`
        },
        body: JSON.stringify({
          tmdbMovieId: testMovieId
          // missing body
        })
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(400);
    });

    it('should trim whitespace from comment', async () => {
      const app = new Hono()
        .use('*', async (c, next) => {
          c.set('user', { id: userId, email: testEmail, name: 'Test' });
          await next();
        })
        .route('/', commentsRouter);

      const commentText = '  Great movie!  ';
      const req = new Request('http://localhost/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `token=${token}`
        },
        body: JSON.stringify({
          tmdbMovieId: testMovieId,
          body: commentText
        })
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(201);
      
      const data = await res.json() as any;
      expect(data.comment.body).toBe('Great movie!');
    });
  });

  describe('GET /comments', () => {
    it('should get comments for a movie with pagination', async () => {
      // Create multiple comments
      for (let i = 0; i < 5; i++) {
        await prisma.comment.create({
          data: {
            userId,
            tmdbMovieId: testMovieId,
            body: `Comment ${i + 1}`
          }
        });
      }

      const app = new Hono().route('/', commentsRouter);

      const req = new Request(`http://localhost/?movieId=${testMovieId}&page=1`, {
        method: 'GET'
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(200);
      
      const data = await res.json() as any;
      expect(data.comments.length).toBeGreaterThan(0);
      expect(data.total).toBe(5);
      expect(data.page).toBe(1);
    });

    it('should return 400 if movieId is missing', async () => {
      const app = new Hono().route('/', commentsRouter);

      const req = new Request('http://localhost/?page=1', {
        method: 'GET'
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(400);
    });

    it('should return comments ordered by newest first', async () => {
      // Create comments with small delay
      const comment1 = await prisma.comment.create({
        data: {
          userId,
          tmdbMovieId: testMovieId,
          body: 'First comment'
        }
      });

      const comment2 = await prisma.comment.create({
        data: {
          userId,
          tmdbMovieId: testMovieId,
          body: 'Second comment'
        }
      });

      const app = new Hono().route('/', commentsRouter);

      const req = new Request(`http://localhost/?movieId=${testMovieId}`, {
        method: 'GET'
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(200);
      
      const data = await res.json() as any;
      expect(data.comments[0].id).toBe(comment2.id);
      expect(data.comments[1].id).toBe(comment1.id);
    });
  });

  describe('PUT /comments/:id', () => {
    it('should update own comment', async () => {
      // Create a comment
      const comment = await prisma.comment.create({
        data: {
          userId,
          tmdbMovieId: testMovieId,
          body: 'Original comment'
        }
      });

      const app = new Hono()
        .use('*', async (c, next) => {
          c.set('user', { id: userId, email: testEmail, name: 'Test' });
          await next();
        })
        .route('/', commentsRouter);

      const newText = 'Updated comment';
      const req = new Request(`http://localhost/${comment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `token=${token}`
        },
        body: JSON.stringify({
          body: newText
        })
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(200);

      // Verify update
      const updated = await prisma.comment.findUnique({
        where: { id: comment.id }
      });

      expect(updated!.body).toBe(newText);
    });

    it('should return 403 when trying to update others\' comments', async () => {
      // Create comment as user1
      const comment = await prisma.comment.create({
        data: {
          userId,
          tmdbMovieId: testMovieId,
          body: 'Original comment'
        }
      });

      const app = new Hono()
        .use('*', async (c, next) => {
          // Simulate user2 trying to edit user1's comment
          c.set('user', { id: userId2, email: testEmail2, name: 'Test2' });
          await next();
        })
        .route('/', commentsRouter);

      const req = new Request(`http://localhost/${comment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `token=${token2}`
        },
        body: JSON.stringify({
          body: 'Hacked comment'
        })
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(403);
    });

    it('should return 404 for non-existent comment', async () => {
      const app = new Hono()
        .use('*', async (c, next) => {
          c.set('user', { id: userId, email: testEmail, name: 'Test' });
          await next();
        })
        .route('/', commentsRouter);

      const req = new Request('http://localhost/non-existent-id', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `token=${token}`
        },
        body: JSON.stringify({
          body: 'New text'
        })
      });

      const res = await app.fetch(req);
      expect([403, 404]).toContain(res.status);
    });
  });

  describe('DELETE /comments/:id', () => {
    it('should delete own comment', async () => {
      const comment = await prisma.comment.create({
        data: {
          userId,
          tmdbMovieId: testMovieId,
          body: 'Comment to delete'
        }
      });

      const app = new Hono()
        .use('*', async (c, next) => {
          c.set('user', { id: userId, email: testEmail, name: 'Test' });
          await next();
        })
        .route('/', commentsRouter);

      const req = new Request(`http://localhost/${comment.id}`, {
        method: 'DELETE',
        headers: {
          'Cookie': `token=${token}`
        }
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(200);

      // Verify deletion
      const deleted = await prisma.comment.findUnique({
        where: { id: comment.id }
      });

      expect(deleted).toBeUndefined();
    });

    it('should return 403 when trying to delete others\' comments', async () => {
      const comment = await prisma.comment.create({
        data: {
          userId,
          tmdbMovieId: testMovieId,
          body: 'Comment to protect'
        }
      });

      const app = new Hono()
        .use('*', async (c, next) => {
          c.set('user', { id: userId2, email: testEmail2, name: 'Test2' });
          await next();
        })
        .route('/', commentsRouter);

      const req = new Request(`http://localhost/${comment.id}`, {
        method: 'DELETE',
        headers: {
          'Cookie': `token=${token2}`
        }
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(403);
    });
  });

  describe('Comment content validation', () => {
    it('should accept comments with special characters', async () => {
      const app = new Hono()
        .use('*', async (c, next) => {
          c.set('user', { id: userId, email: testEmail, name: 'Test' });
          await next();
        })
        .route('/', commentsRouter);

      const specialText = 'ทดสอบ 中文 🎬 café';
      const req = new Request('http://localhost/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `token=${token}`
        },
        body: JSON.stringify({
          tmdbMovieId: testMovieId,
          body: specialText
        })
      });

      const res = await app.fetch(req);
      expect(res.status).toBe(201);
      
      const data = await res.json() as any;
      expect(data.comment.body).toBe(specialText);
    });

    it('should accept long comments', async () => {
      const app = new Hono()
        .use('*', async (c, next) => {
          c.set('user', { id: userId, email: testEmail, name: 'Test' });
          await next();
        })
        .route('/', commentsRouter);

      const longText = 'Lorem ipsum '.repeat(100);
      const req = new Request('http://localhost/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `token=${token}`
        },
        body: JSON.stringify({
          tmdbMovieId: testMovieId,
          body: longText.trim()
        })
      });

      const res = await app.fetch(req);
      expect([200, 201]).toContain(res.status);
    });
  });
});
