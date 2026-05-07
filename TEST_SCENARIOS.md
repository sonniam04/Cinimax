# 🧪 Cinemax - Test Scenarios & Cases

## Overview
Comprehensive test scenarios for Cinemax system covering authentication, movie interactions, comments, and recommendations.

---

## 1️⃣ Authentication Module

### 1.1 User Registration
**TC-AUTH-001**: Successful user registration
- **Precondition**: User is not registered
- **Steps**:
  1. Navigate to register page
  2. Enter name, email, password
  3. Click register button
- **Expected**: User account created, redirected to home page, logged in
- **Data**: name="John Doe", email="john@test.com", password="SecurePass123"

**TC-AUTH-002**: Register with existing email
- **Precondition**: Email already exists in database
- **Steps**: Try to register with existing email
- **Expected**: Error message "emailExists", user not created

**TC-AUTH-003**: Register with invalid email
- **Steps**: Enter invalid email format
- **Expected**: Validation error, prevent submission

**TC-AUTH-004**: Register with weak password
- **Steps**: Enter password < 6 characters
- **Expected**: Validation error

**TC-AUTH-005**: Register with missing fields
- **Steps**: Submit form with empty fields
- **Expected**: Validation errors for each field

---

### 1.2 User Login
**TC-AUTH-006**: Successful login
- **Precondition**: User account exists
- **Steps**:
  1. Navigate to login page
  2. Enter correct email and password
  3. Click login button
- **Expected**: User logged in, redirected to home page

**TC-AUTH-007**: Login with incorrect password
- **Steps**: Enter correct email but wrong password
- **Expected**: Error message "Invalid credentials"

**TC-AUTH-008**: Login with non-existent email
- **Steps**: Enter email that doesn't exist
- **Expected**: Error message "Invalid credentials"

**TC-AUTH-009**: Session persistence
- **Precondition**: User is logged in
- **Steps**: Close and reopen browser
- **Expected**: User still logged in (token in httpOnly cookie)

**TC-AUTH-010**: Login with empty fields
- **Steps**: Submit form without email or password
- **Expected**: Validation errors

---

### 1.3 User Logout
**TC-AUTH-011**: Successful logout
- **Precondition**: User is logged in
- **Steps**:
  1. Click logout button
  2. Try to access protected page
- **Expected**: User logged out, redirected to login page

**TC-AUTH-012**: Session cleared after logout
- **Steps**: After logout, try accessing /api/auth/me
- **Expected**: Returns `{ user: null }`

---

### 1.4 Get Current User
**TC-AUTH-013**: Get current user info
- **Precondition**: User is logged in
- **Steps**: API call to GET /auth/me
- **Expected**: Returns correct user data (id, email, name)

**TC-AUTH-014**: Get user when not logged in
- **Steps**: API call to GET /auth/me without token
- **Expected**: Returns `{ user: null }`

---

## 2️⃣ Movie Browsing

### 2.1 Home Page
**TC-MOVIE-001**: Load trending movies
- **Steps**: Open home page
- **Expected**: Trending movies carousel loads (min 10 movies)

**TC-MOVIE-002**: Load now playing movies
- **Steps**: View "Now Playing" section
- **Expected**: Now playing carousel loads

**TC-MOVIE-003**: Load top rated movies
- **Steps**: View "Top Rated" section
- **Expected**: Top rated carousel loads

**TC-MOVIE-004**: Image loading
- **Steps**: View movie posters
- **Expected**: All posters display correctly

**TC-MOVIE-005**: Language toggle
- **Precondition**: Home page loaded in English
- **Steps**: Click language switcher, select Thai
- **Expected**: All text changes to Thai, persists on refresh

---

### 2.2 Movie Detail Page
**TC-MOVIE-006**: Load movie details
- **Precondition**: User clicks on a movie
- **Steps**: Navigate to /movies/[id]
- **Expected**: Movie title, description, poster, cast, rating display

**TC-MOVIE-007**: Movie not found
- **Steps**: Navigate to /movies/invalid-id
- **Expected**: 404 or "Movie not found" message

**TC-MOVIE-008**: Display recommendations
- **Precondition**: User is on movie detail page
- **Steps**: Scroll to recommendations section
- **Expected**: Similar movies load (min 5 movies)

**TC-MOVIE-009**: Trailer modal
- **Precondition**: Movie has trailer
- **Steps**: Click "Watch Trailer" button
- **Expected**: Trailer modal opens, video plays

**TC-MOVIE-010**: Cast carousel
- **Steps**: View cast section
- **Expected**: Cast cards display correctly with images

---

### 2.3 Search
**TC-MOVIE-011**: Search by title
- **Steps**:
  1. Navigate to search page
  2. Enter movie title (e.g., "Avatar")
  3. Click search
- **Expected**: Search results display matching movies

**TC-MOVIE-012**: Search with no results
- **Steps**: Search for very specific/non-existent movie
- **Expected**: "No results found" message

**TC-MOVIE-013**: Filter by genre
- **Precondition**: Search results loaded
- **Steps**: Select genre filter
- **Expected**: Results filtered by selected genre

**TC-MOVIE-014**: Clear search
- **Steps**: Click clear/reset button
- **Expected**: Search cleared, filters reset

**TC-MOVIE-015**: Search pagination
- **Precondition**: Search returns many results
- **Steps**: Navigate through pages
- **Expected**: Different movies on each page

---

## 3️⃣ Ratings & Likes

### 3.1 Rating Movies
**TC-RATING-001**: Add rating to movie
- **Precondition**: User logged in, on movie detail page
- **Steps**:
  1. Click on rating widget
  2. Select score 1-10
  3. Submit
- **Expected**: Rating saved, UI shows user's rating

**TC-RATING-002**: Update rating
- **Precondition**: User has existing rating
- **Steps**: Change rating from 7 to 9
- **Expected**: Rating updated in database and UI

**TC-RATING-003**: Delete rating
- **Precondition**: User has rating
- **Steps**: Click to remove rating
- **Expected**: Rating deleted

**TC-RATING-004**: View all ratings on profile
- **Precondition**: User has multiple ratings
- **Steps**: Navigate to profile page
- **Expected**: All rated movies display with scores

**TC-RATING-005**: Optimistic UI update
- **Precondition**: User rates a movie
- **Steps**: Observe UI before server response
- **Expected**: Rating updates immediately in UI

**TC-RATING-006**: Invalid rating score
- **Steps**: Try to submit score outside 1-10
- **Expected**: Validation error, request rejected

**TC-RATING-007**: Rating while offline
- **Precondition**: Network is disabled
- **Steps**: Try to submit rating
- **Expected**: Error message, retry option available

---

### 3.2 Liking Movies
**TC-LIKE-001**: Like a movie
- **Precondition**: User logged in, on movie detail page
- **Steps**: Click like button
- **Expected**: Movie added to likes, button state changes

**TC-LIKE-002**: Unlike a movie
- **Precondition**: Movie is liked
- **Steps**: Click like button again
- **Expected**: Movie removed from likes

**TC-LIKE-003**: View liked movies
- **Precondition**: User has liked several movies
- **Steps**: Navigate to profile, view "Likes" tab
- **Expected**: All liked movies display

**TC-LIKE-004**: Like same movie twice (idempotent)
- **Precondition**: Movie is already liked
- **Steps**: Click like button again
- **Expected**: Movie remains liked (no duplicate)

**TC-LIKE-005**: Favorite icon state
- **Precondition**: User has liked movie
- **Steps**: Navigate to different page and back
- **Expected**: Heart icon still shows as filled

---

## 4️⃣ Comments

### 4.1 Posting Comments
**TC-COMMENT-001**: Post new comment
- **Precondition**: User logged in, on movie detail page
- **Steps**:
  1. Click comment input
  2. Enter comment text
  3. Click post
- **Expected**: Comment displayed in list immediately

**TC-COMMENT-002**: Post empty comment
- **Steps**: Try to submit empty comment
- **Expected**: Validation error, prevent submission

**TC-COMMENT-003**: Post very long comment
- **Steps**: Enter 1000+ character comment
- **Expected**: Accept and display (with word wrap)

**TC-COMMENT-004**: Multiple users commenting
- **Precondition**: Multiple users on same movie
- **Steps**: Each user posts comment
- **Expected**: All comments displayed, newest first

**TC-COMMENT-005**: Comment appears for all users
- **Precondition**: User A posts comment while User B viewing
- **Steps**: Observe User B's screen
- **Expected**: Comment appears without page refresh (if real-time) or on next load

---

### 4.2 Editing Comments
**TC-COMMENT-006**: Edit own comment
- **Precondition**: User has posted comment
- **Steps**:
  1. Click edit on their comment
  2. Modify text
  3. Save
- **Expected**: Comment updated, "edited" indicator shows

**TC-COMMENT-007**: Cannot edit others' comments
- **Precondition**: Another user's comment is visible
- **Steps**: Try to click edit button on their comment
- **Expected**: Edit button not available

**TC-COMMENT-008**: Cannot edit after logout
- **Precondition**: User logs out
- **Steps**: Try to access edit endpoint with old token
- **Expected**: 401 Unauthorized

---

### 4.3 Deleting Comments
**TC-COMMENT-009**: Delete own comment
- **Precondition**: User has posted comment
- **Steps**: Click delete button
- **Expected**: Comment removed from list

**TC-COMMENT-010**: Confirm delete dialog
- **Precondition**: User clicks delete
- **Steps**: Observe dialog
- **Expected**: Confirmation dialog shows before deletion

**TC-COMMENT-011**: Cannot delete others' comments
- **Precondition**: Another user's comment visible
- **Steps**: Try to delete button
- **Expected**: Delete button not available or returns 403

---

### 4.4 Comment Pagination
**TC-COMMENT-012**: Load first page of comments
- **Precondition**: Movie has 20+ comments
- **Steps**: View comment section
- **Expected**: First 20 comments load

**TC-COMMENT-013**: Load more comments
- **Steps**: Click "Load More" or scroll
- **Expected**: Next page of comments loads

**TC-COMMENT-014**: Comment count display
- **Steps**: View comment section header
- **Expected**: Total comment count displayed correctly

---

## 5️⃣ Recommendations

### 5.1 Personalized Recommendations
**TC-REC-001**: Show recommendations based on likes
- **Precondition**: User has liked several movies
- **Steps**: Navigate to home page, scroll to recommendations
- **Expected**: Recommended movies similar to likes

**TC-REC-002**: Show recommendations based on ratings
- **Precondition**: User has rated 5+ movies
- **Steps**: View recommendations
- **Expected**: Recommended based on high ratings

**TC-REC-003**: Recommendations update after new like
- **Precondition**: User likes a movie
- **Steps**: Observe recommendations change
- **Expected**: New recommendations reflect the like

**TC-REC-004**: No recommendations when new user
- **Precondition**: Newly registered user with no likes/ratings
- **Steps**: View recommendations section
- **Expected**: Default/popular movies shown instead

---

## 6️⃣ User Profile

### 6.1 Profile Page
**TC-PROFILE-001**: View profile information
- **Precondition**: User logged in
- **Steps**: Navigate to profile page
- **Expected**: User name, email display

**TC-PROFILE-002**: View liked movies tab
- **Steps**: Click "Liked" tab
- **Expected**: All liked movies display in grid

**TC-PROFILE-003**: View rated movies tab
- **Steps**: Click "Rated" tab
- **Expected**: All rated movies display with scores

**TC-PROFILE-004**: Empty liked movies
- **Precondition**: User has no likes
- **Steps**: View liked tab
- **Expected**: "No liked movies" message

**TC-PROFILE-005**: Empty rated movies
- **Precondition**: User has no ratings
- **Steps**: View rated tab
- **Expected**: "No rated movies" message

**TC-PROFILE-006**: Navigate from profile to movie detail
- **Precondition**: User viewing profile
- **Steps**: Click on a liked/rated movie
- **Expected**: Navigate to movie detail page

---

## 7️⃣ Bilingual Support (i18n)

### 7.1 Thai Language
**TC-i18n-001**: Switch to Thai
- **Precondition**: Site in English
- **Steps**: Click language switcher, select Thai
- **Expected**: All UI text changes to Thai

**TC-i18n-002**: Thai persistence
- **Precondition**: Language set to Thai
- **Steps**: Refresh page
- **Expected**: Language remains Thai

**TC-i18n-003**: Button labels in Thai
- **Steps**: Check button text (Register, Login, etc.)
- **Expected**: Proper Thai translations

### 7.2 English Language
**TC-i18n-004**: Switch to English
- **Precondition**: Site in Thai
- **Steps**: Click language switcher, select English
- **Expected**: All UI text changes to English

---

## 8️⃣ Cross-Cutting Concerns

### 8.1 Error Handling
**TC-ERROR-001**: Network error handling
- **Steps**: Disable network, perform action
- **Expected**: User-friendly error message

**TC-ERROR-002**: Server error (500)
- **Steps**: API returns 500 error
- **Expected**: Generic error message, retry option

**TC-ERROR-003**: Timeout handling
- **Steps**: Slow network, long request
- **Expected**: Timeout error after reasonable time

### 8.2 Performance
**TC-PERF-001**: Page load time
- **Steps**: Load home page with performance monitor
- **Expected**: Initial load < 3 seconds

**TC-PERF-002**: Search performance
- **Steps**: Perform search
- **Expected**: Results load < 2 seconds

**TC-PERF-003**: Image lazy loading
- **Steps**: Scroll through carousel
- **Expected**: Images load as they enter viewport

### 8.3 Security
**TC-SEC-001**: XSS prevention in comments
- **Steps**: Try to post `<script>alert('xss')</script>` as comment
- **Expected**: Script escaped/sanitized

**TC-SEC-002**: CSRF token
- **Steps**: Verify requests include CSRF protection
- **Expected**: Form submissions protected

**TC-SEC-003**: Password hashing
- **Precondition**: User registered
- **Steps**: Check database directly
- **Expected**: Password is hashed (bcrypt), not plain text

**TC-SEC-004**: JWT token expiration
- **Precondition**: User has JWT token
- **Steps**: Wait for token to expire
- **Expected**: User logged out, need to login again

### 8.4 Accessibility
**TC-A11Y-001**: Keyboard navigation
- **Steps**: Navigate entire site using Tab key
- **Expected**: All interactive elements accessible

**TC-A11Y-002**: Alt text on images
- **Steps**: Check movie poster images
- **Expected**: All have meaningful alt text

**TC-A11Y-003**: Color contrast
- **Steps**: Check text contrast ratios
- **Expected**: Meet WCAG AA standards

---

## 9️⃣ Data Integrity

### 9.1 Concurrent Operations
**TC-DATA-001**: Concurrent likes
- **Precondition**: Two users on same movie
- **Steps**: Both users like movie simultaneously
- **Expected**: Both likes saved, no conflicts

**TC-DATA-002**: Concurrent ratings
- **Steps**: Two users rate same movie simultaneously
- **Expected**: Both ratings saved correctly

**TC-DATA-003**: Update-delete conflict
- **Precondition**: User editing comment
- **Steps**: Another user deletes comment during edit
- **Expected**: Appropriate error handling

### 9.2 Data Consistency
**TC-DATA-004**: Rating deletion cascades
- **Precondition**: User account with ratings
- **Steps**: Delete user account
- **Expected**: All ratings deleted (cascade)

**TC-DATA-005**: Like deletion cascades
- **Precondition**: User with likes
- **Steps**: Delete user
- **Expected**: All likes deleted

---

## 🔟 Edge Cases

**TC-EDGE-001**: Very long username
- **Steps**: Register with 100+ character name
- **Expected**: Truncated or validation error

**TC-EDGE-002**: Special characters in search
- **Steps**: Search for "Café" or "Ñoño"
- **Expected**: Correct results

**TC-EDGE-003**: Movie with no description
- **Precondition**: TMDB movie missing synopsis
- **Steps**: View movie detail
- **Expected**: Display available info gracefully

**TC-EDGE-004**: Very fast clicking
- **Steps**: Rapidly click like button
- **Expected**: No race conditions, correct final state

**TC-EDGE-005**: Offline fallback
- **Precondition**: Service worker enabled
- **Steps**: Go offline
- **Expected**: Cached pages display

---

## Test Execution Matrix

| Module | Manual | Automated | E2E |
|--------|--------|-----------|-----|
| Auth | ✓ | ✓ | ✓ |
| Movies | ✓ | ✓ | ✓ |
| Ratings | ✓ | ✓ | ✓ |
| Likes | ✓ | ✓ | ✓ |
| Comments | ✓ | ✓ | ✓ |
| Recommendations | ✓ | ✓ | ✓ |
| i18n | ✓ | ✓ | ✓ |
| Security | ✓ | ✓ | ✗ |

---

## Test Data Requirements

### Users
```
User1: { email: "alice@test.com", password: "AlicePass123", name: "Alice" }
User2: { email: "bob@test.com", password: "BobPass123", name: "Bob" }
User3: { email: "charlie@test.com", password: "CharliePass123", name: "Charlie" }
```

### Sample TMDB Movie IDs
- 550 (Fight Club)
- 278 (The Shawshank Redemption)
- 238 (The Godfather)
- 240 (The Godfather: Part II)
- 10 (Pier Paolo Pasolini)

---

**Version**: 1.0  
**Last Updated**: 2026-05-07  
**Test Environment**: Local (localhost:3000 & localhost:4000)
