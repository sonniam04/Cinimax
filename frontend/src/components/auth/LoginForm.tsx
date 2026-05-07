"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Eye, EyeOff, Film } from "lucide-react";

export default function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch {
      setError(t("loginError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Film className="w-10 h-10 text-cinema-red mb-2" />
          <span className="font-display text-3xl text-cinema-red tracking-wider">CINEMAX</span>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-8">
          <h1 className="text-2xl font-semibold mb-6">{t("login")}</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">{t("email")}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-2.5 bg-surface-raised border border-border rounded-xl text-sm focus:outline-none focus:border-cinema-red transition-colors"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">{t("password")}</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full px-4 py-2.5 pr-10 bg-surface-raised border border-border rounded-xl text-sm focus:outline-none focus:border-cinema-red transition-colors" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-cinema-red hover:bg-cinema-red/90 disabled:opacity-60 text-white font-medium rounded-xl transition-colors mt-2">
              {loading ? "..." : t("loginButton")}
            </button>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-6">
            {t("noAccount")}{" "}
            <Link href="/register" className="text-cinema-red hover:underline">{t("signUpLink")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
