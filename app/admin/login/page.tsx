"use client";

import { FormEvent, useState } from "react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const result = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) {
        setError(result.error || "Sign-in failed. Please try again.");
        return;
      }
      window.location.assign("/dashboard");
    } catch {
      setError("We couldn't connect to the sign-in service. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-auth-page">
      <div className="admin-auth-orbit admin-auth-orbit-one" aria-hidden="true" />
      <div className="admin-auth-orbit admin-auth-orbit-two" aria-hidden="true" />
      <section className="admin-login-card">
        <a className="admin-brand" href="/" aria-label="AppverseSI home">
          <span className="admin-brand-mark">A</span>
          <span>APPVERSE<span className="admin-brand-dot">.</span>SI <small>ADMIN</small></span>
        </a>
        <p className="admin-eyebrow">PRIVATE WORKSPACE / 001</p>
        <h1>Good to see you.</h1>
        <p className="admin-auth-description">Sign in to review project enquiries and manage your inbox.</p>
        <form className="admin-login-form" onSubmit={signIn}>
          <label htmlFor="admin-username">Username</label>
          <input
            id="admin-username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            maxLength={120}
            required
          />
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            maxLength={1024}
            required
          />
          {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
          <button className="admin-primary-button" type="submit" disabled={busy}>
            {busy ? "Verifying access…" : "Sign in securely"} <span aria-hidden="true">→</span>
          </button>
        </form>
        <div className="admin-auth-foot"><span className="admin-status-dot" /> Protected admin access <span>•</span> Session expires after 8 hours</div>
      </section>
      <p className="admin-auth-bottom">APPVERSESI / BUSINESS ENQUIRIES / PRIVATE</p>
    </main>
  );
}
