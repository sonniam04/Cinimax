"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "next-intl";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Film, User, LogOut, Menu, X } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const { user, logout } = useAuth();
  const t = useTranslations("nav");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
      setMobileOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Film className="w-7 h-7 text-cinema-red" />
          <span className="font-display text-2xl text-cinema-red tracking-wide">CINEMAX</span>
        </Link>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm ml-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full pl-9 pr-4 py-2 rounded-full bg-surface-raised border border-border text-sm focus:outline-none focus:border-cinema-red transition-colors placeholder:text-muted-foreground"
            />
          </div>
        </form>

        <nav className="hidden md:flex items-center gap-2 ml-auto">
          <LanguageSwitcher />
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-surface-raised transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-cinema-red flex items-center justify-center text-xs font-semibold uppercase">
                  {user.name?.[0] ?? user.email[0]}
                </div>
                <span className="text-sm text-muted-foreground max-w-24 truncate">
                  {user.name ?? user.email}
                </span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-surface border border-border rounded-xl shadow-lg overflow-hidden">
                  <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-surface-raised transition-colors">
                    <User className="w-4 h-4" /> {t("profile")}
                  </Link>
                  <button onClick={() => { logout(); setUserMenuOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-surface-raised transition-colors text-left text-destructive">
                    <LogOut className="w-4 h-4" /> {t("logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">{t("login")}</Link>
              <Link href="/register" className="px-4 py-1.5 text-sm bg-cinema-red hover:bg-cinema-red/90 text-white rounded-full transition-colors font-medium">{t("register")}</Link>
            </div>
          )}
        </nav>

        <button className="md:hidden ml-auto p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-4 flex flex-col gap-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("searchPlaceholder")} className="w-full pl-9 pr-4 py-2 rounded-full bg-surface-raised border border-border text-sm focus:outline-none focus:border-cinema-red" />
          </form>
          <div className="flex items-center justify-between">
            <LanguageSwitcher />
            {user ? (
              <div className="flex gap-2">
                <Link href="/profile" onClick={() => setMobileOpen(false)} className="px-3 py-1.5 text-sm bg-surface-raised rounded-full">{t("profile")}</Link>
                <button onClick={() => logout()} className="px-3 py-1.5 text-sm text-destructive">{t("logout")}</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="px-3 py-1.5 text-sm">{t("login")}</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="px-3 py-1.5 text-sm bg-cinema-red text-white rounded-full">{t("register")}</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
