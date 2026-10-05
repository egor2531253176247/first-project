"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { type Service } from "@/lib/catalog";
import { studioDate } from "@/lib/calculator";
import { bookingSchema } from "@/lib/validation";
import { Button, Arrow, Label, Check } from "./ui";
import "./interactive.css";
export function BookingForm({
  services,
  user,
}: {
  services: Service[];
  user: { name: string; email: string } | null;
}) {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [service, setService] = useState(
    services.some((s) => s.id === "ppf") ? "ppf" : services[0].id,
  );
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    bookingId: string;
    emailSent: boolean;
  } | null>(null);
  useEffect(() => {
    setTime("");
    setSlots([]);
    if (!date) return;
    setSlotsLoading(true);
    setSlotsError("");
    const controller = new AbortController();
    fetch("/api/bookings?date=" + date, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        setSlots(data.slots);
        setSlotsError(
          data.error ||
            (!data.slots.length
              ? "В этот день свободных слотов нет. Выберите другую дату."
              : ""),
        );
      })
      .catch((err) => {
        if (err.name !== "AbortError")
          setSlotsError("Не удалось загрузить доступное время.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setSlotsLoading(false);
      });
    return () => controller.abort();
  }, [date]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (busy) return;
    const input = {
      brand,
      model,
      year: +year,
      name,
      email,
      phone,
      consent,
      date,
      time,
      photos: [],
      configuration: {
        vehicle: `${brand} ${model}`,
        body: "coupe",
        service,
        finish: "Satin",
        color: "Original",
        extras: [],
        ...(service === "ppf" ? { ppfPackage: "full" } : {}),
      },
    };
    const result = bookingSchema.safeParse(input);
    if (!result.success) {
      setError(
        result.error.issues[0]?.message || "Проверьте дату, время и контакты",
      );
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          setTime("");
          setSlots(slots.filter((x) => x !== time));
        }
        throw new Error(data.error);
      }
      setSuccess(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Запись не выполнена. Попробуйте позже.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (success)
    return (
      <div className="success-screen" role="status">
        <div className="success-mark">
          <Check />
        </div>
        <Label>BOOKING / RESERVED</Label>
        <h2>
          SEE YOU
          <br />
          AT THE STUDIO.
        </h2>
        <p className="form-note">
          {name}, визит сохранён:{" "}
          {new Date(date + "T12:00:00+03:00").toLocaleDateString("ru-RU")} в{" "}
          {time}, Москва (UTC+3).
        </p>
        <div className="reference">
          ЗАПИСЬ / {success.bookingId.slice(0, 8).toUpperCase()}
        </div>
        <p className="form-note">
          {success.emailSent
            ? "Подтверждение отправлено на email."
            : "Email-подтверждение пока недоступно. Сохраните дату и номер записи."}{" "}
          Объём и начало работ согласовываются после осмотра.
        </p>
        <Button href={user ? "/dashboard" : "/"}>
          {user ? "Мой кабинет" : "На главную"}
        </Button>
      </div>
    );
  return (
    <div className="booking-layout">
      <form className="booking-form" onSubmit={submit}>
        <fieldset disabled={busy} style={{ padding: 0, border: 0, margin: 0 }}>
          <div className="form-grid">
            <label className="form-field">
              <span>Марка *</span>
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
                maxLength={40}
              />
            </label>
            <label className="form-field">
              <span>Модель *</span>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
                maxLength={80}
              />
            </label>
            <label className="form-field">
              <span>Год *</span>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                min="1950"
                max={new Date().getFullYear() + 1}
                required
              />
            </label>
            <label className="form-field">
              <span>Услуга</span>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
              >
                {services.map((s) => (
                  <option value={s.id} key={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <h3>CHOOSE YOUR TIME.</h3>
          <label className="form-field">
            <span>Дата визита *</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={studioDate(new Date(Date.now() + 86400000))}
              max={studioDate(new Date(Date.now() + 60 * 86400000))}
              required
            />
          </label>
          {slotsLoading && (
            <p className="form-note loading" aria-live="polite">
              Проверяем доступное время…
            </p>
          )}
          {slotsError && (
            <p className="form-note" role="status">
              {slotsError}
            </p>
          )}
          <div className="booking-slots" role="group" aria-label="Время визита">
            {slots.map((slot) => (
              <button
                type="button"
                key={slot}
                className={time === slot ? "active" : ""}
                aria-pressed={time === slot}
                onClick={() => setTime(slot)}
              >
                {slot}
              </button>
            ))}
          </div>
          <p className="fine-print">
            Время по Москве (UTC+3). Запись на консультацию и осмотр; срок работ
            согласовывается отдельно.
          </p>
          <h3>YOUR CONTACT DETAILS.</h3>
          <div className="form-grid">
            <label className="form-field">
              <span>Имя *</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
                maxLength={100}
              />
            </label>
            <label className="form-field">
              <span>Телефон *</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                placeholder="+7 …"
                required
                maxLength={30}
              />
            </label>
            <label className="form-field full-width">
              <span>Email *</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                maxLength={200}
              />
            </label>
          </div>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              required
            />
            <span>
              Согласен на обработку персональных данных.{" "}
              <Link href="/privacy">Политика конфиденциальности</Link>.
            </span>
          </label>
          {error && (
            <p className="form-message" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy || !time}
            className={`button ${busy ? "loading" : ""}`}
          >
            {busy ? "Сохраняем…" : "Записаться"}
            <Arrow />
          </button>
        </fieldset>
      </form>
      <aside className="booking-aside">
        <Label>
          <span className="accent">PIT STOP /</span> THE FIRST STEP
        </Label>
        <h2>
          LET’S LOOK
          <br />
          AT THE DETAILS.
        </h2>
        <p className="form-note">
          На осмотре оценим состояние покрытия, покажем образцы материалов и
          подготовим точную смету.
        </p>
        <ul className="feature-list">
          <li>
            <span>01</span>Диагностика кузова
          </li>
          <li>
            <span>02</span>Выбор материалов
          </li>
          <li>
            <span>03</span>Согласование проекта
          </li>
        </ul>
        <p className="fine-print">
          Пн–Сб · 10:00–19:00.
          <br />
          Начало работ — после согласования.
        </p>
        {!user && (
          <Link href="/account" className="text-link">
            Войти перед записью <Arrow />
          </Link>
        )}
      </aside>
    </div>
  );
}
