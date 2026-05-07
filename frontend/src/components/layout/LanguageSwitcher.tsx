"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Globe } from "lucide-react";

const locales = [
  { code: "en", label: "EN" },
  { code: "th", label: "TH" },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function switchLocale(locale: string) {
    setPending(true);
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    });
    router.refresh();
    setPending(false);
  }

  return (
    <div className="flex items-center gap-1 bg-surface-raised rounded-full px-1 py-0.5">
      <Globe className="w-3.5 h-3.5 text-muted-foreground ml-1" />
      {locales.map((l) => (
        <button
          key={l.code}
          onClick={() => switchLocale(l.code)}
          disabled={pending}
          className="px-2 py-0.5 text-xs rounded-full hover:bg-border transition-colors disabled:opacity-50"
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
