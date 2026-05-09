"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LockIcon } from "@/components/Icons/LockIcon";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error === "CredentialsSignin" ? "Invalid email or password" : result.error);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-body flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="font-playfair text-2xl font-semibold text-heading hover:text-primary transition-colors">
            Heritage Threads
          </Link>
          <p className="text-muted-text text-sm mt-2">Sign in to your account</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-error text-sm rounded-md px-4 py-3" role="alert">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-heading mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-border rounded-md bg-body text-body-text placeholder:text-muted-text focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-heading mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-border rounded-md bg-body text-body-text placeholder:text-muted-text focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-md font-medium hover:bg-primary-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-text mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary hover:text-primary-hover font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-body flex items-center justify-center"><p className="text-muted-text">Loading…</p></div>}>
      <LoginForm />
    </Suspense>
  );
}
