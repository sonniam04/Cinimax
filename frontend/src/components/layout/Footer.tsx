import { Film } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-cinema-red" />
          <span className="font-display text-xl text-cinema-red tracking-wide">CINEMAX</span>
        </div>
        <p className="text-muted-foreground text-sm">
          Movie data provided by{" "}
          <span className="text-foreground">TMDB</span>
        </p>
      </div>
    </footer>
  );
}
