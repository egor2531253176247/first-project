"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Arrow, Label } from "./ui";
import "./interactive.css";
export function AccountForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: mode,
          name: name || undefined,
          email,
          password,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      router.push(data.role === "admin" ? "/admin" : "/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не удалось войти. Попробуйте позже.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-card">
      <Label>YOUR PRIVATE GARAGE</Label>
      <div className="auth-tabs">
        <button
          className={mode === "login" ? "active" : ""}
          onClick={() => {
            setMode("login");
            setError("");
          }}
        >
          Вход
        </button>
        <button
          className={mode === "register" ? "active" : ""}
          onClick={() => {
            setMode("register");
            setError("");
          }}
        >
          Регистрация
        </button>
      </div>
      <form onSubmit={submit}>
        {mode === "register" && (
          <label className="form-field">
            <span>Имя</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
            />
          </label>
        )}
        <label className="form-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            maxLength={200}
          />
        </label>
        <label className="form-field">
          <span>Пароль</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            required
            minLength={10}
            maxLength={128}
          />
        </label>
        {mode === "register" && (
          <>
            <p className="fine-print">
              Минимум 10 символов. Используйте уникальный пароль.
            </p>
            <label className="checkbox-label">
              <input type="checkbox" required />
              <span>
                Принимаю{" "}
                <a href="/terms" style={{ textDecoration: "underline" }}>
                  условия
                </a>{" "}
                и{" "}
                <a href="/privacy" style={{ textDecoration: "underline" }}>
                  политику конфиденциальности
                </a>
                .
              </span>
            </label>
          </>
        )}
        {error && (
          <p className="form-message" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          className={`button ${busy ? "loading" : ""}`}
          disabled={busy}
        >
          {busy ? "Проверяем…" : mode === "login" ? "Войти" : "Создать кабинет"}
          <Arrow />
        </button>
      </form>
      <p className="fine-print">
        Кабинет хранит заявки, отправленные после входа. Анонимные заявки
        автоматически к аккаунту не привязываются.
      </p>
    </div>
  );
}
export function Logout() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div>
      {error && (
        <p className="form-message" role="alert">
          {error}
        </p>
      )}
      <button
        disabled={busy}
        className="text-link"
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            const response = await fetch("/api/auth", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "logout" }),
            });
            if (!response.ok) throw new Error();
            router.push("/account");
            router.refresh();
          } catch {
            setError("Не удалось завершить сеанс.");
            setBusy(false);
          }
        }}
      >
        {busy ? "Выходим…" : "Выйти"} ↗
      </button>
    </div>
  );
}
