# 🎬 Cinemax

A full-stack movie discovery and recommendation web app built with **Next.js 16** + **Hono**. Browse trending movies, search by title, rate (1–10), like, comment, and get personalised recommendations — all powered by the TMDB API.

---

## ✨ Features

- 🎥 **Browse movies** — Trending, Now Playing, Top Rated carousels on the home page
- 🔍 **Search** — Search by title with genre filters
- ⭐ **Rate** — Score movies 1–10 with optimistic UI
- ❤️ **Like** — Add movies to your favourites
- 💬 **Comment** — Post, edit, and delete comments on any movie
- 🤖 **Recommendations** — Personalised carousel based on your likes/ratings
- 👤 **Profile** — See all your liked and rated movies
- 🌐 **Bilingual** — Thai / English (switch in the Navbar)
- 🔒 **Auth** — Email + password with JWT httpOnly cookies

---

## 🗂️ Project Structure

```
cinemax/
├── backend/      # Hono API server  (port 4000)
│   ├── prisma/   # SQLite schema + migrations
│   └── src/
│       ├── routes/     # auth · ratings · likes · comments · tmdb
│       ├── lib/        # prisma · jwt · tmdb helpers
│       └── middleware/
└── frontend/     # Next.js 16 App Router  (port 3000)
    └── src/
        ├── app/          # pages (home · movies · search · profile · auth)
        ├── components/   # layout · movies · interactions · comments · auth
        ├── context/      # AuthContext  (useAuth hook)
        ├── hooks/        # useRating · useLike  (SWR)
        └── lib/          # api · tmdb · utils
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 · TypeScript · Tailwind CSS v4 |
| Backend | Hono · Node.js · TypeScript |
| Database | SQLite · Prisma v7 (libsql adapter) |
| Auth | JWT · bcryptjs · httpOnly cookies |
| Movie Data | TMDB API |
| State / Data | SWR (optimistic mutations) |
| i18n | next-intl (TH / EN) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A free [TMDB API key](https://www.themoviedb.org/settings/api)

### 1. Clone
```bash
git clone https://github.com/sonniam04/Cinimax.git
cd Cinimax
```

### 2. Backend setup
```bash
cd backend
cp .env.example .env        # fill in JWT_SECRET and TMDB_API_KEY
npm install
npx prisma migrate dev --name init
npm run dev                 # → http://localhost:4000
```

### 3. Frontend setup
```bash
cd ../frontend
cp .env.example .env.local  # set BACKEND_URL=http://localhost:4000
npm install
npm run dev                 # → http://localhost:3000
```

Open **http://localhost:3000** 🎉

---

## ⚙️ Environment Variables

### `backend/.env`
```env
PORT=4000
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET=<openssl rand -base64 32>
TMDB_API_KEY=<your_tmdb_key>
TMDB_BASE_URL=https://api.themoviedb.org/3
FRONTEND_URL=http://localhost:3000
```

### `frontend/.env.local`
```env
BACKEND_URL=http://localhost:4000
```

---

## 📡 API Overview

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Create account |
| POST | `/auth/login` | — | Login, sets cookie |
| POST | `/auth/logout` | — | Clear cookie |
| GET | `/auth/me` | cookie | Current user |
| GET | `/tmdb/trending` | — | Home page movies |
| GET | `/tmdb/movies/:id` | — | Movie detail |
| GET | `/tmdb/search?q=` | — | Search |
| GET | `/tmdb/recommendations` | optional | Personalised picks |
| GET | `/tmdb/profile` | ✅ | Liked + rated movies |
| GET/POST/DELETE | `/ratings?movieId=` | ✅ | User ratings |
| GET/POST/DELETE | `/likes?movieId=` | ✅ | User likes |
| GET/POST | `/comments?movieId=` | POST ✅ | Comments |
| PUT/DELETE | `/comments/:id` | ✅ | Edit / delete comment |

> The frontend proxies all `/api/*` requests to the backend via Next.js rewrites — no CORS issues.
