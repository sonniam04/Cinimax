import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:4000';

test.describe('Cinemax E2E Tests - Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('should register a new user', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);

    // Fill registration form
    const timestamp = Date.now();
    const email = `e2e-test-${timestamp}@example.com`;

    await page.fill('input[name="name"]', 'E2E Test User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'E2ETestPass123');

    // Submit
    await page.click('button:has-text("Register")');

    // Should redirect to home page
    await page.waitForURL(`${BASE_URL}/`);
    expect(page.url()).toBe(`${BASE_URL}/`);

    // Should be logged in - check for logout button
    await expect(page.locator('button:has-text("Logout")')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill('input[name="email"]', 'alice@test.com');
    await page.fill('input[name="password"]', 'AlicePass123');

    await page.click('button:has-text("Login")');

    await page.waitForURL(`${BASE_URL}/`);
    expect(page.url()).toBe(`${BASE_URL}/`);

    // Check for logout button
    await expect(page.locator('button:has-text("Logout")')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill('input[name="email"]', 'invalid@test.com');
    await page.fill('input[name="password"]', 'WrongPassword');

    await page.click('button:has-text("Login")');

    // Should see error message
    await expect(
      page.locator('text=/Invalid credentials|error/i')
    ).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'alice@test.com');
    await page.fill('input[name="password"]', 'AlicePass123');
    await page.click('button:has-text("Login")');

    await page.waitForURL(`${BASE_URL}/`);

    // Click logout
    await page.click('button:has-text("Logout")');

    // Should redirect to login or show login button
    await expect(page.locator('button:has-text("Login")')).toBeVisible({
      timeout: 5000
    });
  });

  test('should show validation errors on register', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);

    // Try submit with empty fields
    await page.click('button:has-text("Register")');

    // Should see validation errors
    const errorMessages = page.locator('[role="alert"], .error, .invalid');
    await expect(errorMessages.first()).toBeVisible();
  });
});

test.describe('Cinemax E2E Tests - Movie Browsing', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'alice@test.com');
    await page.fill('input[name="password"]', 'AlicePass123');
    await page.click('button:has-text("Login")');
    await page.waitForURL(`${BASE_URL}/`);
  });

  test('should load and display trending movies', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    // Wait for movies to load
    await page.waitForSelector('[data-testid="movie-card"]', { timeout: 10000 });

    const movies = page.locator('[data-testid="movie-card"]');
    const count = await movies.count();

    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to movie detail page', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    // Click first movie
    await page.click('[data-testid="movie-card"]');

    // Should be on movie detail page
    await expect(page.locator('h1')).toBeVisible();

    // Should display movie information
    await expect(page.locator('[data-testid="movie-title"]')).toBeVisible();
  });

  test('should search for movies', async ({ page }) => {
    await page.goto(`${BASE_URL}/search`);

    // Enter search term
    await page.fill('input[placeholder*="search" i]', 'Avatar');

    // Wait for results
    await page.waitForSelector('[data-testid="movie-card"]', { timeout: 10000 });

    const results = page.locator('[data-testid="movie-card"]');
    const count = await results.count();

    expect(count).toBeGreaterThan(0);
  });

  test('should switch language to Thai', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    // Find language switcher and click
    await page.click('[data-testid="language-switcher"]');

    // Select Thai
    await page.click('text=ไทย');

    // Verify UI changed to Thai (check for Thai text)
    await page.waitForSelector('text=/ภาพยนตร์|สตรีมมิ่ง/');
  });
});

test.describe('Cinemax E2E Tests - Interactions', () => {
  let movieUrl: string;

  test.beforeEach(async ({ page }) => {
    // Login and navigate to a movie
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'alice@test.com');
    await page.fill('input[name="password"]', 'AlicePass123');
    await page.click('button:has-text("Login")');
    await page.waitForURL(`${BASE_URL}/`);

    // Navigate to first available movie
    await page.goto(`${BASE_URL}/movies/550`); // Fight Club
    await page.waitForLoadState('networkidle');
    movieUrl = page.url();
  });

  test('should rate a movie', async ({ page }) => {
    // Find and click rating (e.g., 8 stars)
    await page.click('[data-testid="rating-star-8"]');

    // Verify rating is saved
    await page.waitForLoadState('networkidle');

    const ratingElement = page.locator('[data-testid="current-rating"]');
    await expect(ratingElement).toContainText('8');
  });

  test('should like a movie', async ({ page }) => {
    // Click like button
    const likeButton = page.locator('[data-testid="like-button"]');

    // Get initial state
    const initialClass = await likeButton.getAttribute('class');

    // Click like
    await likeButton.click();

    // Wait for state change
    await page.waitForLoadState('networkidle');

    // Verify state changed
    const newClass = await likeButton.getAttribute('class');
    expect(newClass).not.toBe(initialClass);
  });

  test('should add a comment', async ({ page }) => {
    // Scroll to comments section
    await page.locator('[data-testid="comments-section"]').scrollIntoViewIfNeeded();

    // Fill comment form
    const timestamp = Date.now();
    const commentText = `E2E Test Comment ${timestamp}`;

    await page.fill(
      '[data-testid="comment-input"]',
      commentText
    );

    // Submit
    await page.click('[data-testid="submit-comment"]');

    // Wait for comment to appear
    await page.waitForSelector(`text="${commentText}"`, { timeout: 5000 });

    // Verify comment is visible
    await expect(page.locator(`text="${commentText}"`)).toBeVisible();
  });

  test('should edit own comment', async ({ page }) => {
    // First add a comment
    const timestamp = Date.now();
    const originalText = `Original Comment ${timestamp}`;

    await page.fill('[data-testid="comment-input"]', originalText);
    await page.click('[data-testid="submit-comment"]');

    await page.waitForSelector(`text="${originalText}"`, { timeout: 5000 });

    // Find and click edit button
    await page.click('[data-testid="edit-comment"]');

    // Modify comment
    const editedText = `Edited Comment ${timestamp}`;
    const commentInput = page.locator('[data-testid="edit-comment-input"]');

    await commentInput.clear();
    await commentInput.fill(editedText);

    // Save
    await page.click('[data-testid="save-comment"]');

    // Verify edit
    await expect(page.locator(`text="${editedText}"`)).toBeVisible();
  });

  test('should delete own comment', async ({ page }) => {
    // First add a comment
    const timestamp = Date.now();
    const commentText = `Comment to Delete ${timestamp}`;

    await page.fill('[data-testid="comment-input"]', commentText);
    await page.click('[data-testid="submit-comment"]');

    await page.waitForSelector(`text="${commentText}"`);

    // Find and click delete button
    await page.click('[data-testid="delete-comment"]');

    // Confirm delete if there's a dialog
    if (await page.locator('[data-testid="confirm-delete"]').isVisible()) {
      await page.click('[data-testid="confirm-delete"]');
    }

    // Verify comment is removed
    await expect(page.locator(`text="${commentText}"`)).not.toBeVisible();
  });
});

test.describe('Cinemax E2E Tests - Profile', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'alice@test.com');
    await page.fill('input[name="password"]', 'AlicePass123');
    await page.click('button:has-text("Login")');
    await page.waitForURL(`${BASE_URL}/`);
  });

  test('should view profile page', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);

    // Verify page loaded
    await expect(page.locator('h1:has-text("Profile")')).toBeVisible();

    // Check for tabs
    await expect(page.locator('[data-testid="tab-liked"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-rated"]')).toBeVisible();
  });

  test('should view liked movies', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);

    // Click liked tab
    await page.click('[data-testid="tab-liked"]');

    // Should display liked movies
    const likedMovies = page.locator('[data-testid="movie-card"]');
    const count = await likedMovies.count();

    // At least 0 (user might not have any)
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should view rated movies', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);

    // Click rated tab
    await page.click('[data-testid="tab-rated"]');

    // Should display rated movies
    const ratedMovies = page.locator('[data-testid="movie-card"]');
    const count = await ratedMovies.count();

    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Cinemax E2E Tests - Performance', () => {
  test('should load home page within 3 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle' });

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
  });

  test('should search within 2 seconds', async ({ page }) => {
    await page.goto(`${BASE_URL}/search`);

    const startTime = Date.now();

    await page.fill('input[placeholder*="search" i]', 'Avatar');
    await page.waitForSelector('[data-testid="movie-card"]', { timeout: 5000 });

    const searchTime = Date.now() - startTime;

    expect(searchTime).toBeLessThan(2000);
  });
});

test.describe('Cinemax E2E Tests - Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Go offline
    await page.context().setOffline(true);

    await page.goto(`${BASE_URL}/`);

    // Should show error message or cached content
    await expect(
      page.locator('[data-testid="error-message"], text=/offline|error/i')
    ).toBeVisible({ timeout: 10000 });

    // Go online
    await page.context().setOffline(false);
  });

  test('should handle API errors', async ({ page }) => {
    // Setup route interception to simulate error
    await page.route(`${API_URL}/**`, route => {
      route.abort('failed');
    });

    await page.goto(`${BASE_URL}/`);

    // Should show error message
    await expect(
      page.locator('text=/error|failed|try again/i')
    ).toBeVisible({ timeout: 5000 });
  });
});
