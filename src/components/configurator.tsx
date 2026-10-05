"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { colors, extras, money, type Service } from "@/lib/catalog";
import { calculate, type Configuration } from "@/lib/calculator";
import { CarModel } from "./car";
import { Arrow, Label } from "./ui";
import "./interactive.css";
const vehicles = [
  ["Porsche 911", "coupe"],
  ["BMW M4 Competition", "coupe"],
  ["Mercedes-AMG GT", "coupe"],
  ["Audi RS6", "sedan"],
  ["Porsche Taycan", "sedan"],
  ["Lamborghini Huracán", "coupe"],
  ["Ferrari Roma", "coupe"],
  ["McLaren 720S", "coupe"],
  ["Range Rover Sport", "suv"],
  ["Tesla Model S", "sedan"],
];
const finishes = [
  "Gloss",
  "Satin",
  "Matte",
  "Metallic",
  "Color shift",
  "Carbon",
];
export function Configurator({
  services,
  compact = false,
}: {
  services: Service[];
  compact?: boolean;
}) {
  const [vehicle, setVehicle] = useState("BMW M4 Competition");
  const [service, setService] = useState(
    services.some((s) => s.id === "wrap") ? "wrap" : services[0].id,
  );
  const [finish, setFinish] = useState("Satin");
  const [color, setColor] = useState("graphite");
  const [selectedExtras, setExtras] = useState<string[]>([]);
  const [ppfPackage, setPackage] = useState("full");
  const selected = colors.find((x) => x.id === color)!;
  const body = (vehicles.find((x) => x[0] === vehicle)?.[1] ||
    "coupe") as Configuration["body"];
  const configuration: Configuration = {
    vehicle,
    body,
    service,
    finish,
    color: selected.name,
    extras: selectedExtras,
    ...(service === "ppf" ? { ppfPackage } : {}),
  };
  const estimate = useMemo(
    () => calculate(configuration, services),
    [vehicle, service, finish, color, selectedExtras, ppfPackage, services],
  );
  const quoteQuery = new URLSearchParams({
    vehicle,
    body,
    service,
    finish,
    color: selected.name,
    extras: selectedExtras.join(","),
    ...(service === "ppf" ? { ppfPackage } : {}),
  }).toString();
  return (
    <div className={`configurator ${compact ? "compact" : ""}`}>
      <div className="configurator-visual">
        <div className="visual-top">
          <Label>YOUR VISION / OUR PRECISION</Label>
          <span className="technical muted">LIVE CONCEPT</span>
        </div>
        <CarModel color={selected.hex} finish={finish} body={body} />
        <div className="visual-bottom">
          <div>
            <h3>{vehicle}</h3>
            <p className="technical">
              {selected.name} / {finish}
            </p>
          </div>
          <span className="technical muted">SIDE PROFILE / 01</span>
        </div>
        <p className="fine-print">
          Схематичная концепция. Точный оттенок и фактуру выбираем по
          физическому образцу.
        </p>
      </div>
      <div className="configurator-panel">
        <div className="config-fields">
          <label className="form-field">
            <span>
              <b className="accent">01 /</b> VEHICLE
            </span>
            <select
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
            >
              {vehicles.map(([name]) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>
              <b className="accent">02 /</b> SERVICE
            </span>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </label>
          {service === "ppf" && (
            <label className="form-field">
              <span>Пакет защиты</span>
              <select
                value={ppfPackage}
                onChange={(e) => setPackage(e.target.value)}
              >
                <option value="front">Front package</option>
                <option value="track">Track package</option>
                <option value="full">Full body</option>
              </select>
            </label>
          )}
          <div className="form-field">
            <span>
              <b className="accent">03 /</b> FINISH
            </span>
            <div
              className="finish-options"
              role="group"
              aria-label="Фактура покрытия"
            >
              {finishes.map((name) => (
                <button
                  className={finish === name ? "active" : ""}
                  aria-pressed={finish === name}
                  key={name}
                  onClick={() => setFinish(name)}
                >
                  {name.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="form-field">
            <span>
              <b className="accent">04 /</b> COLOR{" "}
              <span className="color-name">{selected.name}</span>
            </span>
            <div
              className="color-swatches"
              role="group"
              aria-label="Цвет плёнки"
            >
              {colors.map((c) => (
                <button
                  className={color === c.id ? "selected" : ""}
                  aria-label={c.name}
                  aria-pressed={color === c.id}
                  key={c.id}
                  title={c.name}
                  onClick={() => {
                    setColor(c.id);
                    setFinish(c.finish);
                  }}
                  style={{ "--swatch": c.hex } as React.CSSProperties}
                />
              ))}
            </div>
            <p className="color-code">
              {selected.brand} / {selected.code} / {finish}
            </p>
          </div>
          <fieldset className="extras-options">
            <legend>
              <b className="accent">05 /</b> EXTRAS
            </legend>
            {extras.map((extra) => (
              <label key={extra.id}>
                <input
                  type="checkbox"
                  checked={selectedExtras.includes(extra.id)}
                  onChange={() =>
                    setExtras(
                      selectedExtras.includes(extra.id)
                        ? selectedExtras.filter((x) => x !== extra.id)
                        : [...selectedExtras, extra.id],
                    )
                  }
                />
                <span>{extra.name}</span>
                <span>{money(extra.price)}</span>
              </label>
            ))}
          </fieldset>
        </div>
        <div className="estimate-row" aria-live="polite">
          <div>
            <p className="technical muted">ESTIMATE / ОРИЕНТИР</p>
            <strong>{money(estimate.price)}</strong>
          </div>
          <div>
            <p className="technical muted">TIME</p>
            <span>
              {estimate.days}–{estimate.days + 1} дней
            </span>
          </div>
        </div>
        <Link className="button" href={"/quote?" + quoteQuery}>
          Получить точный расчёт <Arrow />
        </Link>
        <p className="fine-print">
          Расчёт предварительный. Материалы, состояние кузова и объём подготовки
          влияют на итоговую смету.
        </p>
      </div>
    </div>
  );
}
