"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { colors, extras, money, type Service } from "@/lib/catalog";
import { calculate, type Configuration } from "@/lib/calculator";
import { CarModel } from "./car";
import { Arrow, Button, Label, Check, UploadIcon } from "./ui";
import { leadSchema } from "@/lib/validation";
import "./interactive.css";
type Initial = Partial<Configuration>;
export function QuoteForm({
  services,
  initial = {},
  user,
}: {
  services: Service[];
  initial?: Initial;
  user: { name: string; email: string } | null;
}) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    id: string;
    emailSent: boolean;
  } | null>(null);
  const words = (initial.vehicle || "").split(" ");
  const [brand, setBrand] = useState(words[0] || "");
  const [model, setModel] = useState(words.slice(1).join(" "));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [body, setBody] = useState<Configuration["body"]>(
    initial.body || "coupe",
  );
  const [service, setService] = useState(
    services.some((s) => s.id === initial.service)
      ? initial.service!
      : services.some((s) => s.id === "ppf")
        ? "ppf"
        : services[0].id,
  );
  const [finish, setFinish] = useState(initial.finish || "Satin");
  const [color, setColor] = useState(initial.color || "Graphite Black");
  const [selectedExtras, setExtras] = useState(initial.extras || []);
  const [ppfPackage, setPackage] = useState(initial.ppfPackage || "full");
  const [notes, setNotes] = useState("");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [messenger, setMessenger] = useState("");
  const [consent, setConsent] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploaded, setUploaded] = useState<string[]>([]);
  useEffect(() => {
    const urls = photos.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [photos]);
  const configuration: Configuration = {
    vehicle: `${brand} ${model}`.trim() || initial.vehicle || "Ваш автомобиль",
    body,
    service,
    finish,
    color,
    extras: selectedExtras,
    ...(service === "ppf" ? { ppfPackage } : {}),
  };
  const estimate = calculate(configuration, services);
  function next() {
    setError("");
    if (
      step === 0 &&
      (!brand.trim() ||
        !model.trim() ||
        !Number.isInteger(+year) ||
        +year < 1950 ||
        +year > new Date().getFullYear() + 1)
    ) {
      setError("Укажите марку, модель и корректный год автомобиля.");
      return;
    }
    setStep(Math.min(step + 1, 4));
  }
  function selectPhotos(files: FileList | null) {
    if (!files) return;
    const selected = Array.from(files);
    if (
      selected.length > 5 ||
      selected.some(
        (x) =>
          x.size > 5000000 ||
          !["image/jpeg", "image/png", "image/webp"].includes(x.type),
      )
    ) {
      setError(
        "Выберите до 5 фотографий JPG, PNG или WebP, не более 5 МБ каждая.",
      );
      return;
    }
    setPhotos(selected);
    setUploaded([]);
    setError("");
  }
  async function submit() {
    if (busy) return;
    setError("");
    const input = {
      brand,
      model,
      year: +year,
      configuration,
      name,
      email,
      phone,
      messenger,
      notes,
      photos: uploaded,
      consent,
    };
    const result = leadSchema.safeParse(input);
    if (!result.success) {
      setError(result.error.issues[0]?.message || "Проверьте поля формы");
      return;
    }
    setBusy(true);
    try {
      let files = uploaded;
      if (photos.length && !files.length) {
        const form = new FormData();
        photos.forEach((file) => form.append("photos", file));
        const response = await fetch("/api/uploads", {
          method: "POST",
          body: form,
        });
        const output = await response.json();
        if (!response.ok) throw new Error(output.error);
        files = output.files;
        setUploaded(files);
      }
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, photos: files }),
      });
      const output = await response.json();
      if (!response.ok) throw new Error(output.error);
      setSuccess(output);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Не удалось отправить заявку. Попробуйте позже.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (success)
    return (
      <div className="quote-layout">
        <div className="success-screen" role="status">
          <div className="success-mark">
            <Check />
          </div>
          <Label>PROJECT REQUEST / SAVED</Label>
          <h2>
            YOUR PROJECT
            <br />
            STARTS HERE.
          </h2>
          <p className="form-note">
            {name}, ваша заявка сохранена. Предварительный ориентир —{" "}
            {money(estimate.price)}. Точную смету и начало работ согласовываем
            отдельно.
          </p>
          <div className="reference">
            ЗАЯВКА / {success.id.slice(0, 8).toUpperCase()}
          </div>
          <p className="form-note">
            {success.emailSent
              ? "Подтверждение отправлено на ваш email."
              : "Email-подтверждение пока недоступно. Сохраните номер заявки."}
          </p>
          <Button href={user ? "/dashboard" : "/"}>
            {user ? "Открыть кабинет" : "На главную"}
          </Button>
        </div>
      </div>
    );
  return (
    <div className="quote-layout">
      <div className="quote-card">
        <div className="quote-steps" aria-label="Этапы заявки">
          {["VEHICLE", "SERVICE", "OPTIONS", "UPLOAD", "CONTACT"].map(
            (label, i) => (
              <button
                disabled={i > step || busy}
                className={i === step ? "active" : i < step ? "complete" : ""}
                key={label}
                onClick={() => {
                  setStep(i);
                  setError("");
                }}
                aria-current={i === step ? "step" : undefined}
              >
                <span>0{i + 1}</span>
                <span>{label}</span>
              </button>
            ),
          )}
        </div>
        <h2>
          {
            [
              "Ваш автомобиль",
              "Выберите услугу",
              "Детали проекта",
              "Фотографии автомобиля",
              "Как с вами связаться",
            ][step]
          }
        </h2>
        <p className="form-note">
          {
            [
              "Начнём с того, что делает ваш автомобиль особенным.",
              "Выберите основную задачу. Остальные пожелания обсудим при осмотре.",
              "Покрытие, цвет и акценты. Укажите всё, что важно для вашего проекта.",
              "Фото помогут оценить состояние и объём работ. Этот шаг можно пропустить.",
              "Оставьте контакты для согласования точной сметы.",
            ][step]
          }
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            step === 4 ? void submit() : next();
          }}
        >
          <fieldset
            disabled={busy}
            style={{ border: 0, padding: 0, margin: 0 }}
          >
            {step === 0 && (
              <div className="form-grid">
                <label className="form-field">
                  <span>Марка *</span>
                  <input
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    autoComplete="off"
                    placeholder="Porsche"
                    maxLength={40}
                    required
                  />
                </label>
                <label className="form-field">
                  <span>Модель *</span>
                  <input
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="911 GT3"
                    maxLength={80}
                    required
                  />
                </label>
                <label className="form-field">
                  <span>Год *</span>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    min={1950}
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </label>
                <label className="form-field">
                  <span>Тип кузова</span>
                  <select
                    value={body}
                    onChange={(e) =>
                      setBody(e.target.value as Configuration["body"])
                    }
                  >
                    <option value="coupe">Купе</option>
                    <option value="sedan">Седан / универсал</option>
                    <option value="suv">Внедорожник</option>
                  </select>
                </label>
              </div>
            )}
            {step === 1 && (
              <div
                className="service-choice"
                role="group"
                aria-label="Основная услуга"
              >
                {services.map((s) => (
                  <button
                    type="button"
                    className={service === s.id ? "selected" : ""}
                    key={s.id}
                    aria-pressed={service === s.id}
                    onClick={() => setService(s.id)}
                  >
                    <span>{s.title}</span>
                    <span>
                      {service === s.id ? <Check size={16} /> : <Arrow />}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {step === 2 && (
              <div className="form-grid">
                {service === "ppf" && (
                  <label className="form-field full-width">
                    <span>Пакет PPF</span>
                    <select
                      value={ppfPackage}
                      onChange={(e) => setPackage(e.target.value)}
                    >
                      <option value="front">
                        Front package / передняя часть
                      </option>
                      <option value="track">Track package / зоны риска</option>
                      <option value="full">Full body / весь кузов</option>
                    </select>
                  </label>
                )}
                <label className="form-field">
                  <span>Фактура</span>
                  <select
                    value={finish}
                    onChange={(e) => setFinish(e.target.value)}
                  >
                    {[
                      "Gloss",
                      "Satin",
                      "Matte",
                      "Metallic",
                      "Color shift",
                      "Carbon",
                    ].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
                <label className="form-field">
                  <span>Цвет</span>
                  <input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    maxLength={60}
                  />
                </label>
                <fieldset className="extras-options full-width">
                  <legend>Дополнительные работы</legend>
                  {extras.map((x) => (
                    <label key={x.id}>
                      <input
                        type="checkbox"
                        checked={selectedExtras.includes(x.id)}
                        onChange={() =>
                          setExtras(
                            selectedExtras.includes(x.id)
                              ? selectedExtras.filter((id) => id !== x.id)
                              : [...selectedExtras, x.id],
                          )
                        }
                      />
                      <span>{x.name}</span>
                      <span>{money(x.price)}</span>
                    </label>
                  ))}
                </fieldset>
                <label className="form-field full-width">
                  <span>Пожелания и состояние автомобиля</span>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={2000}
                    placeholder="Например: сохранить заводской цвет, защитить зоны риска…"
                  />
                </label>
              </div>
            )}
            {step === 3 && (
              <>
                <label className="upload-zone">
                  <span>
                    <UploadIcon />
                  </span>
                  <strong>Выберите фотографии</strong>
                  <p>JPG, PNG, WebP · до 5 файлов · до 5 МБ каждый</p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={(e) => selectPhotos(e.target.files)}
                    aria-label="Загрузить фотографии автомобиля"
                  />
                </label>
                <div className="photo-previews">
                  {previews.map((url, i) => (
                    <div key={url}>
                      <img src={url} alt={`Фотография автомобиля ${i + 1}`} />
                      <button
                        type="button"
                        aria-label={`Удалить фото ${i + 1}`}
                        onClick={() => {
                          setPhotos(photos.filter((_, index) => index !== i));
                          setUploaded([]);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
            {step === 4 && (
              <>
                <div className="form-grid">
                  <label className="form-field">
                    <span>Имя *</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      autoComplete="name"
                      maxLength={100}
                    />
                  </label>
                  <label className="form-field">
                    <span>Телефон *</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      autoComplete="tel"
                      maxLength={30}
                      placeholder="+7 …"
                    />
                  </label>
                  <label className="form-field">
                    <span>Email *</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      maxLength={200}
                    />
                  </label>
                  <label className="form-field">
                    <span>Telegram / WhatsApp</span>
                    <input
                      value={messenger}
                      onChange={(e) => setMessenger(e.target.value)}
                      maxLength={100}
                      placeholder="@username или телефон"
                    />
                  </label>
                </div>
                <label className="checkbox-label" style={{ marginTop: 25 }}>
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    required
                  />
                  <span>
                    Согласен на обработку персональных данных для ответа на
                    заявку.{" "}
                    <Link href="/privacy">Политика конфиденциальности</Link>.
                  </span>
                </label>
                {!user && (
                  <p className="fine-print">
                    Для сохранения проекта в личном кабинете{" "}
                    <Link
                      href="/account"
                      className="text-link"
                      style={{ fontSize: 9 }}
                    >
                      войдите до отправки
                    </Link>
                    .
                  </p>
                )}
              </>
            )}
            {error && (
              <p className="form-message" role="alert">
                {error}
              </p>
            )}
            <div className="form-actions">
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setStep(Math.max(step - 1, 0));
                  setError("");
                }}
                disabled={step === 0 || busy}
              >
                ← Назад
              </button>
              <button
                className={`button ${busy ? "loading" : ""}`}
                type="submit"
                disabled={busy}
              >
                {busy
                  ? "Сохраняем…"
                  : step === 4
                    ? "Получить расчёт"
                    : step === 3
                      ? "Продолжить"
                      : "Далее"}
                <Arrow />
              </button>
            </div>
          </fieldset>
        </form>
      </div>
      <aside className="quote-summary">
        <Label>
          <span className="accent">PROJECT /</span> YOUR CONFIGURATION
        </Label>
        <CarModel
          color={colors.find((x) => x.name === color)?.hex || "#353638"}
          body={body}
          finish={finish}
        />
        <h3>
          {brand || "YOUR"} {model || "CAR"}
        </h3>
        {[
          ["Услуга", services.find((s) => s.id === service)?.title],
          ["Покрытие", `${color} / ${finish}`],
          [
            "Дополнительно",
            selectedExtras.length
              ? selectedExtras
                  .map((id) => extras.find((x) => x.id === id)?.name)
                  .join(", ")
              : "Без дополнительных работ",
          ],
        ].map(([key, value]) => (
          <div className="summary-line" key={key}>
            <span>{key}</span>
            <span>{value}</span>
          </div>
        ))}
        <div className="estimate-row" aria-live="polite">
          <div>
            <Label>ESTIMATE / ОРИЕНТИР</Label>
            <strong>{money(estimate.price)}</strong>
          </div>
          <div>
            <Label>TIME</Label>
            <span>
              {estimate.days}–{estimate.days + 1} дней
            </span>
          </div>
        </div>
        <p className="fine-print">
          Предварительный расчёт не является офертой. Финальная смета после
          осмотра и согласования материалов.
        </p>
      </aside>
    </div>
  );
}
