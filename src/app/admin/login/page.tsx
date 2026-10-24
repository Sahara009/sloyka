"use client";

import { useState, type FormEvent } from "react";

export default function AdminLogin() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const password = new FormData(e.currentTarget).get("password");
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) window.location.href = "/admin";
    else {
      setError(data.error ?? "Не получилось войти");
      setBusy(false);
    }
  };

  return (
    <div className="admin-login bg-gingham">
      <form className="admin-login__card" onSubmit={onSubmit}>
        <img src="/logo.svg" alt="Sloyka" width={160} height={60} />
        <h1>Админ-панель</h1>
        <label className="field">
          <span>Пароль</span>
          <input name="password" type="password" required autoFocus autoComplete="current-password" />
        </label>
        {error && <p className="admin-error">{error}</p>}
        <button className="btn btn--block" disabled={busy}>
          {busy ? "Входим…" : "Войти"}
        </button>
      </form>
    </div>
  );
}
