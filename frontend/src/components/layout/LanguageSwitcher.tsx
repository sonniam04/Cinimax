"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Globe } from "lucide-react";

const locales = [
  { code: "en", label: "EN" },
  { code: "th", label: "TH" },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const currentLocale = useLocale();

  function switchLocale(locale: string) {
    if (locale === currentLocale) return;
    // Set cookie directly — no API call needed
    document.cookie = `locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 bg-surface-raised rounded-full px-1 py-0.5">
      <Globe className="w-3.5 h-3.5 text-muted-foreground ml-1" />
      {locales.map((l) => (
        <button
          key={l.code}
          onClick={() => switchLocale(l.code)}
          className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
            currentLocale === l.code
              ? "bg-cinema-red text-white font-semibold"
              : "hover:bg-border text-muted-foreground"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
