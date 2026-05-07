"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Eye, EyeOff, Film } from "lucide-react";

export default function RegisterForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError(t("passwordMin"));
      return;
    }
    if (password !== confirm) {
      setError(t("passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      router.push("/");
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      setError(status === 409 ? t("emailExists") : t("registerError"));
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
          <h1 className="text-2xl font-semibold mb-6">{t("register")}</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">{t("name")}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-surface-raised border border-border rounded-xl text-sm focus:outline-none focus:border-cinema-red transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">{t("email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-surface-raised border border-border rounded-xl text-sm focus:outline-none focus:border-cinema-red transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">{t("password")}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 pr-10 bg-surface-raised border border-border rounded-xl text-sm focus:outline-none focus:border-cinema-red transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">{t("confirmPassword")}</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-surface-raised border border-border rounded-xl text-sm focus:outline-none focus:border-cinema-red transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-cinema-red hover:bg-cinema-red/90 disabled:opacity-60 text-white font-medium rounded-xl transition-colors mt-2"
            >
              {loading ? "..." : t("registerButton")}
            </button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            {t("hasAccount")}{" "}
            <Link href="/login" className="text-cinema-red hover:underline">
              {t("signInLink")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
