"use client";
import { useEffect, useState } from "react";
import { colors } from "@/lib/catalog";
import { CarModel } from "./car";
import { Label, Arrow, UploadIcon } from "./ui";
import "./interactive.css";
export function Visualizer() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [color, setColor] = useState("graphite");
  const [finish, setFinish] = useState("Satin");
  const [style, setStyle] = useState("OEM+");
  const [available, setAvailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  useEffect(() => {
    fetch("/api/visualize")
      .then((r) => r.json())
      .then((x) => setAvailable(x.available))
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  async function generate() {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.set("image", file);
      form.set("color", color);
      form.set("finish", finish);
      form.set("style", style);
      const response = await fetch("/api/visualize", {
        method: "POST",
        body: form,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setResult(data.image);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось создать концепцию.",
      );
    } finally {
      setBusy(false);
    }
  }
  const selected = colors.find((x) => x.id === color)!;
  return (
    <div className="visualizer-layout">
      <div>
        <div className="visualizer-preview">
          {result ? (
            <img
              src={result}
              alt="AI-концепция автомобиля с выбранной плёнкой"
            />
          ) : preview ? (
            <img src={preview} alt="Загруженный автомобиль, исходное фото" />
          ) : (
            <CarModel color={selected.hex} finish={finish} />
          )}
        </div>
        <p className="fine-print">
          {result
            ? "AI-концепция. Цвет и геометрия могут отличаться от реального результата."
            : preview
              ? "Ваше исходное фото. Изменения появляются после AI-генерации."
              : "Предварительный образец цвета на схематичной модели."}
        </p>
        {result && (
          <a
            className="text-link"
            href={result}
            download="precision-concept.png"
          >
            Скачать концепцию <Arrow />
          </a>
        )}
      </div>
      <div className="visualizer-options">
        <Label>EXPERIMENTAL / AI CAR VISUALIZER</Label>
        <label className="upload-zone">
          <span>
            <UploadIcon />
          </span>
          <strong>Загрузите фото автомобиля</strong>
          <p>JPG / PNG / WebP · до 5 МБ</p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (
                f &&
                (f.size > 5000000 ||
                  !["image/jpeg", "image/png", "image/webp"].includes(f.type))
              ) {
                setError("Фото JPG, PNG или WebP, не более 5 МБ.");
                return;
              }
              setFile(f || null);
              setResult("");
              setError("");
            }}
            aria-label="Фото для AI-визуализации"
          />
        </label>
        <label className="form-field">
          <span>Цвет</span>
          <select
            value={color}
            onChange={(e) => {
              setColor(e.target.value);
              setResult("");
            }}
          >
            {colors.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span>Фактура</span>
          <select
            value={finish}
            onChange={(e) => {
              setFinish(e.target.value);
              setResult("");
            }}
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
          <span>Стиль</span>
          <select
            value={style}
            onChange={(e) => {
              setStyle(e.target.value);
              setResult("");
            }}
          >
            {["OEM+", "Track", "Minimal"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        {!available && (
          <p className="visualizer-warning">
            AI-генерация ещё не доступна. Цветовую концепцию и расчёт можно
            собрать в{" "}
            <a
              href="/configurator"
              style={{ textDecoration: "underline", color: "white" }}
            >
              конфигураторе
            </a>
            .
          </p>
        )}
        <button
          className={`button ${busy ? "loading" : ""}`}
          disabled={!available || !file || busy}
          onClick={() => void generate()}
        >
          {busy ? "Создаём концепцию…" : "Создать AI-концепцию"}
          <Arrow />
        </button>
        {error && (
          <p className="form-message" role="alert">
            {error}
          </p>
        )}
        <p className="fine-print">
          Для AI-генерации нужен вход в кабинет. Фото передаётся AI-сервису
          только после нажатия кнопки. До трёх концепций в сутки.
        </p>
      </div>
    </div>
  );
}
