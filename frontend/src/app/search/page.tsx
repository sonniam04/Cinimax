import { getTranslations } from "next-intl/server";
import { searchMovies, getGenres } from "@/lib/tmdb";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MovieGrid from "@/components/movies/MovieGrid";
import SearchFilters from "@/components/movies/SearchFilters";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string; genre?: string; sort?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q ?? "";
  const page = parseInt(params.page ?? "1");
  const t = await getTranslations("search");

  const [genres, searchResult] = await Promise.all([
    getGenres(),
    query.trim() ? searchMovies(query, page) : Promise.resolve({ results: [], total_results: 0, total_pages: 0, page: 1 }),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">
            {query ? (
              <>
                {t("title")}: <span className="text-cinema-red">&ldquo;{query}&rdquo;</span>
              </>
            ) : (
              t("searchFor")
            )}
          </h1>
          {query && (
            <p className="text-muted-foreground text-sm mt-1">
              {searchResult.total_results.toLocaleString()} results
            </p>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <aside className="md:w-48 shrink-0">
            <SearchFilters genres={genres} currentQuery={query} />
          </aside>

          <div className="flex-1">
            {!query.trim() ? (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-lg">{t("searchFor")}</p>
              </div>
            ) : searchResult.results.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p>{t("noResults")} &ldquo;{query}&rdquo;</p>
              </div>
            ) : (
              <MovieGrid movies={searchResult.results} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
