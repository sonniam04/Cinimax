import { getTranslations } from "next-intl/server";
import { getHomeMovies, getGenres } from "@/lib/tmdb";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MovieHero from "@/components/movies/MovieHero";
import MovieCarousel from "@/components/movies/MovieCarousel";
import RecommendationsCarousel from "@/components/movies/RecommendationsCarousel";
import GenreBrowser from "@/components/movies/GenreBrowser";

export default async function HomePage() {
  const t = await getTranslations("home");

  const [{ trending, topRated, nowPlaying }, genres] = await Promise.all([
    getHomeMovies(),
    getGenres(),
  ]);

  const heroMovie = trending[0];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        {heroMovie && (
          <div className="mb-8">
            <MovieHero
              movie={heroMovie}
              watchTrailerLabel={t("watchTrailer")}
              moreInfoLabel={t("moreInfo")}
            />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 flex flex-col gap-10 pb-12">
          <MovieCarousel movies={trending.slice(1)} title={t("trending")} />
          <MovieCarousel movies={nowPlaying} title={t("nowPlaying")} />
          <MovieCarousel movies={topRated} title={t("topRated")} />
          <RecommendationsCarousel />
          <GenreBrowser genres={genres} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
