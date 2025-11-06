"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = await signIn("email", {
      email,
      redirect: false
    });

    if (result?.error) {
      setMessage(result.error);
    } else {
      setMessage("Check your inbox for a login link. For local development, see console output.");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-white">Sign in to AI BlogCraft</h1>
        <p className="text-sm text-zinc-400">Use your email address to receive a secure magic link.</p>
      </header>
      <label className="space-y-2 text-sm">
        <span className="font-medium text-zinc-300">Email address</span>
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-brand focus:outline-none"
          placeholder="you@company.com"
        />
      </label>
      {message && <p className="rounded-md border border-zinc-700 bg-zinc-900/60 p-3 text-sm text-zinc-300">{message}</p>}
      <button type="submit" className="btn-primary w-full justify-center gap-2" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send magic link"}
      </button>
    </form>
  );
}
