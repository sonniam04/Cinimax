# 🧪 Quick Test Reference

Fast reference guide for running tests in Cinemax.

## ⚡ Quick Commands

### Run All Backend Tests
```bash
cd backend
npm test
```

### Run All Frontend Tests
```bash
cd frontend
npm test
```

### Run E2E Tests
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: E2E Tests
npm run test:e2e
```

### Run Specific Test
```bash
# Backend specific file
cd backend && npm test -- auth.test.ts

# Frontend specific file
cd frontend && npm test -- RatingWidget.test.tsx

# E2E specific suite
npm run test:e2e -- --grep "Authentication"
```

---

## 🎯 Common Tasks

### Check Test Coverage
```bash
# Backend
cd backend && npm run test:coverage

# Frontend
cd frontend && npm run test:coverage
```

### Watch Mode (Auto-rerun)
```bash
# Backend
cd backend && npm run test:watch

# Frontend
cd frontend && npm run test:watch
```

### Interactive UI
```bash
# Backend
cd backend && npm run test:ui

# Frontend
cd frontend && npm run test:ui

# E2E
npm run test:e2e:ui
```

### Debug Tests
```bash
# Backend
cd backend && npm test -- --inspect-brk

# E2E
npm run test:e2e:debug
```

---

## 📋 Test Files Location

### Backend
- `backend/src/routes/auth.test.ts` - Authentication tests
- `backend/src/routes/ratings.test.ts` - Ratings tests
- `backend/src/routes/likes.test.ts` - Likes tests
- `backend/src/routes/comments.test.ts` - Comments tests

### Frontend
- `frontend/src/components/interactions/RatingWidget.test.tsx`
- `frontend/src/components/interactions/LikeButton.test.tsx`
- `frontend/src/components/comments/CommentForm.test.tsx`

### E2E
- `tests/e2e/cinemax.spec.ts` - All E2E tests

---

## 🔍 Test Statistics

- **Total Test Cases**: 200+
- **Backend Tests**: 52
- **Frontend Tests**: 27
- **E2E Tests**: 25+
- **Test Scenarios**: 100+

---

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Kill process on port
lsof -i :3000  # or :4000
kill -9 <PID>
```

### Database Issues
```bash
cd backend
rm prisma/dev.db
npx prisma migrate dev --name init
```

### Test Timeout
Add timeout to test:
```typescript
test('name', async () => {
  // test code
}, 10000); // 10 seconds
```

---

## 📚 Documentation

- **Full Testing Guide**: `TESTING_GUIDE.md`
- **Test Scenarios**: `TEST_SCENARIOS.md`
- **Test Summary**: `TEST_SUMMARY.md`

---

## ✅ Pre-commit Checklist

- [ ] Run `npm test` in backend
- [ ] Run `npm test` in frontend
- [ ] No console errors
- [ ] All tests pass

---

**Last Updated**: 2026-05-07
