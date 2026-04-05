"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { TreePine, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(false);
    setLoading(true);
    const ok = login(username.trim(), password);
    setLoading(false);
    if (ok) {
      router.push("/");
    } else {
      setError(true);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sage-50 px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-700 text-white shadow-lg">
            <TreePine size={28} />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-charcoal-800">
              {t("nav.brand")}
            </h1>
            <p className="text-sm text-charcoal-500">{t("nav.sub")}</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-sage-100">
          <h2 className="mb-6 text-lg font-semibold text-charcoal-800">
            {t("auth.login")}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal-700">
                {t("auth.username")}
              </label>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-lg border border-sage-200 bg-sage-50 px-3.5 py-2.5 text-sm text-charcoal-800 outline-none transition focus:border-sage-500 focus:ring-2 focus:ring-sage-200"
                placeholder="admin / staff"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal-700">
                {t("auth.password")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-sage-200 bg-sage-50 px-3.5 py-2.5 pr-10 text-sm text-charcoal-800 outline-none transition focus:border-sage-500 focus:ring-2 focus:ring-sage-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                <AlertCircle size={15} className="shrink-0" />
                {t("auth.loginError")}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-sage-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sage-600 disabled:opacity-60"
            >
              {loading ? "…" : t("auth.login")}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-5 rounded-lg bg-sage-50 px-3.5 py-3 text-xs text-charcoal-500">
            <p className="font-medium text-charcoal-600 mb-1">Demo accounts</p>
            <p>admin / admin123 — full access</p>
            <p>staff / staff123 — limited access</p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-charcoal-400">
          v3.0 &middot; PMS + POS &middot; Internal use only
        </p>
      </div>
    </div>
  );
}
