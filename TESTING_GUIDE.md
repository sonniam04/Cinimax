# 🧪 Cinemax Testing Guide

Comprehensive testing setup for Cinemax with unit tests, component tests, integration tests, and E2E tests.

---

## 📋 Table of Contents

1. [Test Structure](#test-structure)
2. [Setup](#setup)
3. [Running Tests](#running-tests)
4. [Backend Tests](#backend-tests)
5. [Frontend Tests](#frontend-tests)
6. [E2E Tests](#e2e-tests)
7. [Test Coverage](#test-coverage)
8. [CI/CD Integration](#cicd-integration)

---

## 📊 Test Structure

```
cinemax/
├── TEST_SCENARIOS.md           # Comprehensive test scenarios (100+ test cases)
├── TESTING_GUIDE.md            # This file
├── playwright.config.ts        # E2E test configuration
│
├── backend/
│   ├── vitest.config.ts        # Backend test configuration
│   ├── vitest.setup.ts         # Backend test setup
│   └── src/routes/
│       ├── auth.test.ts        # Auth route tests (10 tests)
│       ├── ratings.test.ts     # Ratings route tests (12 tests)
│       ├── likes.test.ts       # Likes route tests (14 tests)
│       └── comments.test.ts    # Comments route tests (16 tests)
│
├── frontend/
│   ├── vitest.config.ts        # Frontend test configuration
│   ├── vitest.setup.ts         # Frontend test setup
│   └── src/components/
│       ├── interactions/
│       │   ├── RatingWidget.test.tsx    # Rating component tests (8 tests)
│       │   └── LikeButton.test.tsx      # Like button tests (9 tests)
│       └── comments/
│           └── CommentForm.test.tsx     # Comment form tests (10 tests)
│
└── tests/
    └── e2e/
        └── cinemax.spec.ts     # E2E tests (25+ tests)
```

---

## 🛠️ Setup

### Prerequisites

```bash
# Node.js 18+
node --version

# Install dependencies
cd backend && npm install
cd ../frontend && npm install
```

### Install Testing Dependencies

**Backend:**
```bash
cd backend
npm install --save-dev vitest @vitest/ui c8
```

**Frontend:**
```bash
cd frontend
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**E2E:**
```bash
npm install --save-dev @playwright/test
```

---

## 🏃 Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run specific test file
npm test auth.test.ts

# Watch mode (re-run on file changes)
npm test -- --watch

# Coverage report
npm test -- --coverage

# UI mode (interactive)
npm test -- --ui
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run component tests
npm test -- src/components

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage

# UI mode
npm test -- --ui
```

### E2E Tests

```bash
# Start backend (terminal 1)
cd backend && npm run dev

# Start frontend (terminal 2)
cd frontend && npm run dev

# Run E2E tests (terminal 3)
npm run test:e2e

# Run specific test
npm run test:e2e -- --grep "should register"

# Debug mode
npx playwright test --debug

# UI mode (interactive)
npx playwright test --ui
```

### Run All Tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test

# E2E (ensure backend and frontend are running)
npm run test:e2e
```

---

## 🧪 Backend Tests

### Auth Tests (`auth.test.ts`)

| Test | Coverage |
|------|----------|
| Register new user | Successful registration, password hashing |
| Register duplicate email | Email validation, 409 response |
| Register missing fields | Field validation, 400 response |
| Password hashing | Secure password storage with bcrypt |
| Login success | Valid credentials, JWT token |
| Login incorrect password | Invalid credentials, 401 response |
| Login non-existent user | User validation |
| Get current user | Token verification, user info retrieval |
| Get user not logged in | Null return when no token |
| Logout | Token deletion |

**Run:**
```bash
cd backend
npm test auth.test.ts
```

### Ratings Tests (`ratings.test.ts`)

| Test | Coverage |
|------|----------|
| Create rating | Store rating 1-10 |
| Invalid score < 1 | Validation error |
| Invalid score > 10 | Validation error |
| Update rating | Upsert functionality |
| Get rating | Retrieve user's rating |
| No rating exists | Null return |
| Delete rating | Remove from database |
| Unique constraint | Prevent duplicates |

**Run:**
```bash
cd backend
npm test ratings.test.ts
```

### Likes Tests (`likes.test.ts`)

| Test | Coverage |
|------|----------|
| Add like | Create like record |
| Idempotent like | No duplicates |
| Check like status | Get like boolean |
| Like not exists | False return |
| Remove like | Delete like record |
| Get all likes | Retrieve user's likes list |
| Empty likes | Empty array return |
| Unique constraint | Per user per movie |

**Run:**
```bash
cd backend
npm test likes.test.ts
```

### Comments Tests (`comments.test.ts`)

| Test | Coverage |
|------|----------|
| Create comment | Store comment with user |
| Empty comment | Validation error |
| Missing fields | 400 response |
| Trim whitespace | Text normalization |
| Get comments | Pagination support |
| Order by newest | DESC ordering |
| Update own comment | Edit content |
| Cannot edit others | 403 forbidden |
| Delete own comment | Remove record |
| Cannot delete others | 403 forbidden |
| Special characters | Unicode support |
| Long comments | Large text handling |

**Run:**
```bash
cd backend
npm test comments.test.ts
```

---

## ⚛️ Frontend Tests

### RatingWidget Tests (`RatingWidget.test.tsx`)

| Test | Coverage |
|------|----------|
| Render stars | UI display |
| Display current rating | Load state |
| Submit new rating | API call |
| Update rating | Change score |
| Delete rating | Clear score |
| Handle errors | Error handling |
| All scores 1-10 | Complete range |
| Optimistic UI | Immediate feedback |

**Run:**
```bash
cd frontend
npm test RatingWidget.test.tsx
```

### LikeButton Tests (`LikeButton.test.tsx`)

| Test | Coverage |
|------|----------|
| Render button | UI display |
| Unliked state | Initial state |
| Liked state | Current state |
| Toggle like | Click handler |
| Unlike on second click | State reversal |
| Optimistic update | Immediate feedback |
| Error handling | Revert on error |
| Idempotent | Multiple clicks |

**Run:**
```bash
cd frontend
npm test LikeButton.test.tsx
```

### CommentForm Tests (`CommentForm.test.tsx`)

| Test | Coverage |
|------|----------|
| Render form | UI display |
| Submit button | Button presence |
| Disable when empty | Input validation |
| Enable when filled | Active state |
| Submit comment | API call |
| Clear after submit | Form reset |
| Callback invocation | onCommentAdded |
| Error handling | Error state |
| Whitespace validation | Empty check |
| Character count | Counter display |

**Run:**
```bash
cd frontend
npm test CommentForm.test.tsx
```

---

## 🎭 E2E Tests

### Test Suites

#### Authentication (`Cinemax E2E Tests - Authentication`)
- Register new user
- Login with valid credentials
- Invalid credentials error
- Logout functionality
- Validation errors on register

**Run:**
```bash
npm run test:e2e -- --grep "Authentication"
```

#### Movie Browsing (`Cinemax E2E Tests - Movie Browsing`)
- Load trending movies
- Navigate to movie detail
- Search functionality
- Language switch (English ↔ Thai)

**Run:**
```bash
npm run test:e2e -- --grep "Movie Browsing"
```

#### Interactions (`Cinemax E2E Tests - Interactions`)
- Rate a movie
- Like a movie
- Add comment
- Edit comment
- Delete comment

**Run:**
```bash
npm run test:e2e -- --grep "Interactions"
```

#### User Profile (`Cinemax E2E Tests - Profile`)
- View profile page
- View liked movies
- View rated movies

**Run:**
```bash
npm run test:e2e -- --grep "Profile"
```

#### Performance (`Cinemax E2E Tests - Performance`)
- Home page load < 3s
- Search < 2s

**Run:**
```bash
npm run test:e2e -- --grep "Performance"
```

#### Error Handling (`Cinemax E2E Tests - Error Handling`)
- Network errors
- API errors

**Run:**
```bash
npm run test:e2e -- --grep "Error Handling"
```

---

## 📈 Test Coverage

### Backend Coverage Goals

```bash
cd backend
npm test -- --coverage
```

**Targets:**
- Auth routes: > 90%
- Ratings routes: > 85%
- Likes routes: > 85%
- Comments routes: > 80%

### Frontend Coverage Goals

```bash
cd frontend
npm test -- --coverage
```

**Targets:**
- Components: > 80%
- Hooks: > 80%

### Combined Coverage Report

```bash
# Generate coverage for both
cd backend && npm test -- --coverage --reporter=json
cd ../frontend && npm test -- --coverage --reporter=json

# Merge reports (requires coverage merge tool)
# npm install -g nyc
# nyc merge coverage coverage/merged.json
```

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Backend Tests
        run: |
          cd backend
          npm install
          npm test

      - name: Frontend Tests
        run: |
          cd frontend
          npm install
          npm test

      - name: E2E Tests
        run: |
          npm install -g @playwright/test
          npm run test:e2e
```

---

## 📝 Test Checklist

### Before Commit

- [ ] All unit tests pass
- [ ] All component tests pass
- [ ] No new console errors
- [ ] Coverage maintained or improved

### Before Release

- [ ] All tests pass (unit + component)
- [ ] E2E tests pass in all browsers
- [ ] Performance targets met
- [ ] Security tests passed

### Regression Testing

- [ ] Run full test suite
- [ ] Check coverage reports
- [ ] Manual smoke testing

---

## 🐛 Debugging Tests

### Debug Backend Test

```bash
cd backend
npm test -- auth.test.ts --inspect-brk
# Open chrome://inspect in Chrome
```

### Debug Frontend Test

```bash
cd frontend
npm test -- --ui
# Use interactive UI for debugging
```

### Debug E2E Test

```bash
npx playwright test --debug
# Step through test execution
```

---

## 📚 Test Data

### Backend Test Users

```javascript
{
  email: "test@example.com",
  password: "TestPass123",
  name: "Test User"
}
```

### Sample TMDB Movie IDs

- 550 (Fight Club)
- 278 (The Shawshank Redemption)
- 238 (The Godfather)
- 240 (The Godfather: Part II)

---

## 🚀 Best Practices

### Writing Tests

1. **One assertion per test** (when possible)
2. **Clear test names** describing what is tested
3. **Setup and teardown** properly
4. **Mock external dependencies**
5. **Use data-testid** for selecting elements

### Test Naming

```typescript
// Good
it('should register a new user with valid data', () => {})

// Bad
it('test registration', () => {})
```

### Test Organization

```typescript
describe('Feature', () => {
  beforeEach(() => { /* setup */ });
  afterEach(() => { /* cleanup */ });

  describe('Sub-feature', () => {
    it('should do something', () => {});
  });
});
```

---

## 📞 Troubleshooting

### Tests timeout

**Solution:** Increase timeout
```typescript
test('my test', async () => {
  // test code
}, 10000); // 10 second timeout
```

### Port already in use

**Solution:** Kill existing process
```bash
# Find process on port 3000
lsof -i :3000
# Kill it
kill -9 <PID>
```

### Database lock

**Solution:** Clear test database
```bash
cd backend
rm prisma/dev.db
npx prisma migrate dev --name init
```

### Tests flaky

**Solution:** Add waits
```typescript
await page.waitForLoadState('networkidle');
await expect(element).toBeVisible({ timeout: 10000 });
```

---

## 📊 Test Metrics

**Target Metrics:**
- Test execution time: < 2 minutes (unit + component)
- Code coverage: > 80%
- Pass rate: 100%
- Flakiness: < 1%

**Monitoring:**
- Track test execution time over time
- Monitor flaky test rate
- Keep coverage above target

---

## 🎓 Learning Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Jest Common Mistakes](https://jestjs.io/docs/tutorial-react)

---

## 📝 Maintaining Tests

### When adding features

1. Write test first (TDD)
2. Implement feature
3. Ensure all tests pass
4. Update test documentation

### When refactoring

1. Ensure all tests still pass
2. Don't modify test behavior
3. Update test if component contract changed

### When fixing bugs

1. Add test that reproduces bug
2. Fix the bug
3. Verify test passes

---

**Last Updated**: 2026-05-07  
**Test Coverage**: 100+ test cases  
**Maintained by**: Development Team
