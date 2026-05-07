import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { tmdbImageUrl, formatYear } from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Heart, Star, User } from "lucide-react";
import type { TMDBMovie } from "@/types/tmdb";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:4000";

interface ProfileData {
  likedMovies: TMDBMovie[];
  ratedMovies: (TMDBMovie & { userScore: number })[];
  stats: { likes: number; ratings: number };
}

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  const t = await getTranslations("profile");

  const [meRes, profileRes] = await Promise.all([
    fetch(`${BACKEND}/auth/me`, { headers: { Cookie: `token=${token}` } }),
    fetch(`${BACKEND}/tmdb/profile`, { headers: { Cookie: `token=${token}` } }),
  ]);

  if (!meRes.ok) redirect("/login");

  const { user }: { user: AuthUser } = await meRes.json();
  const profile: ProfileData = profileRes.ok ? await profileRes.json() : { likedMovies: [], ratedMovies: [], stats: { likes: 0, ratings: 0 } };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 rounded-full bg-cinema-red flex items-center justify-center text-2xl font-bold uppercase">
            {user.name?.[0] ?? user.email[0] ?? <User />}
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{user.name ?? user.email}</h1>
            <p className="text-muted-foreground text-sm">{user.email}</p>
            <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
              <span>{profile.stats.likes} likes</span>
              <span>{profile.stats.ratings} ratings</span>
            </div>
          </div>
        </div>

        {/* Liked movies */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-cinema-red fill-cinema-red" />
            <h2 className="text-xl font-semibold">{t("likedMovies")}</h2>
            <span className="text-muted-foreground text-sm">({profile.stats.likes})</span>
          </div>
          {profile.likedMovies.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p>{t("noLikes")}</p>
              <Link href="/" className="text-cinema-red hover:underline text-sm mt-2 inline-block">
                {t("browseMovies")}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {profile.likedMovies.map((movie) => (
                <Link key={movie.id} href={`/movies/${movie.id}`} className="group flex flex-col gap-2">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-border group-hover:border-cinema-red/50 transition-all">
                    <Image
                      src={tmdbImageUrl(movie.poster_path, "w342")}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                    <div className="absolute top-2 right-2">
                      <Heart className="w-4 h-4 fill-cinema-red text-cinema-red" />
                    </div>
                  </div>
                  <p className="text-sm font-medium line-clamp-2">{movie.title}</p>
                  <p className="text-xs text-muted-foreground">{formatYear(movie.release_date)}</p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Rated movies */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-gold fill-gold" />
            <h2 className="text-xl font-semibold">{t("myRatings")}</h2>
            <span className="text-muted-foreground text-sm">({profile.stats.ratings})</span>
          </div>
          {profile.ratedMovies.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p>{t("noRatings")}</p>
              <Link href="/" className="text-cinema-red hover:underline text-sm mt-2 inline-block">
                {t("browseMovies")}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {profile.ratedMovies.map((movie) => (
                <Link key={movie.id} href={`/movies/${movie.id}`} className="group flex flex-col gap-2">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-border group-hover:border-cinema-red/50 transition-all">
                    <Image
                      src={tmdbImageUrl(movie.poster_path, "w342")}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                    <div className="absolute top-2 left-2 bg-gold text-black text-xs font-bold px-2 py-0.5 rounded-full">
                      {movie.userScore}/10
                    </div>
                  </div>
                  <p className="text-sm font-medium line-clamp-2">{movie.title}</p>
                  <p className="text-xs text-muted-foreground">{formatYear(movie.release_date)}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
