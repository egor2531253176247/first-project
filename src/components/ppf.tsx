"use client";
import { useState } from "react";
import Link from "next/link";
import { packages, money } from "@/lib/catalog";
import { Arrow, Label, Check } from "./ui";
import "./interactive.css";
const zones = [
  ["hood", "Капот", "M113 151h104l-8 61h-88Z"],
  ["bumper", "Передний бампер", "M109 125q56-30 112 0l-4 20H113Z"],
  ["fenders", "Крылья", "M91 155h18l12 60-26 9Zm130 0h18l-4 69-26-9Z"],
  ["mirrors", "Зеркала", "M79 241h16v19H77Zm156 0h16l2 19h-18Z"],
  ["doors", "Двери", "M94 270h26l5 101H98Zm116 0h26l-4 101h-27Z"],
  ["rockers", "Пороги", "M89 278h8l7 108-10 4Zm144 0h8l-5 112-10-4Z"],
  ["roof", "Крыша", "M127 272h76v82h-76Z"],
];
export function PPFSelector({ basePrice = 210000 }: { basePrice?: number }) {
  const [pack, setPack] = useState("full");
  const [zone, setZone] = useState("hood");
  const active = packages.find((p) => p.id === pack)!;
  return (
    <div className="ppf-selector">
      <div className="ppf-visual">
        <Label>COVERAGE MAP / SELECT A ZONE</Label>
        <svg
          viewBox="0 0 330 500"
          role="group"
          aria-label="Интерактивная схема защиты кузова"
        >
          <defs>
            <linearGradient id="ppfbody">
              <stop stopColor="#777" />
              <stop offset=".5" stopColor="#252525" />
              <stop offset="1" stopColor="#5c5c5c" />
            </linearGradient>
          </defs>
          <ellipse cx="165" cy="282" rx="100" ry="196" fill="#000" />
          <path
            d="M112 108q53-35 106 0l25 54 1 197-22 70q-55 34-114 0l-22-70 1-197Z"
            fill="url(#ppfbody)"
            stroke="#555"
          />
          <path d="m120 225 90 0-7 42h-76Z" fill="#101820" stroke="#777" />
          <path d="m126 361 78 0 11 42h-101Z" fill="#101820" stroke="#555" />
          <path
            d="M101 130 124 120M207 120l23 10"
            stroke="#ddd"
            strokeWidth="7"
          />
          <path d="M112 426h36m33 0h36" stroke="#a82020" strokeWidth="4" />
          {zones.map(([id, name, path]) => (
            <path
              key={id}
              d={path}
              tabIndex={0}
              role="button"
              aria-label={name}
              aria-pressed={zone === id}
              className={`ppf-zone ${active.zones.includes(id) ? "covered" : ""} ${zone === id ? "highlighted" : ""}`}
              onMouseEnter={() => setZone(id)}
              onFocus={() => setZone(id)}
              onClick={() => setZone(id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setZone(id);
                }
              }}
            />
          ))}
        </svg>
        <div className="zone-caption">
          <span className="status-dot" />
          <span>{zones.find((x) => x[0] === zone)?.[1]}</span>
          <span className="muted">
            {active.zones.includes(zone) ? "ВКЛЮЧЕНО" : "ВНЕ ПАКЕТА"}
          </span>
        </div>
      </div>
      <div className="ppf-panel">
        <div
          className="ppf-package-list"
          role="group"
          aria-label="Пакет защиты"
        >
          {packages.map((p) => (
            <button
              key={p.id}
              className={pack === p.id ? "selected" : ""}
              aria-pressed={pack === p.id}
              onClick={() => setPack(p.id)}
            >
              <span className="technical">{p.name}</span>
              <span>{p.title}</span>
              <span>{pack === p.id ? "−" : "+"}</span>
            </button>
          ))}
        </div>
        <div className="coverage-list">
          {zones.map(([id, name]) => (
            <button
              className={zone === id ? "active" : ""}
              key={id}
              onMouseEnter={() => setZone(id)}
              onFocus={() => setZone(id)}
              onClick={() => setZone(id)}
            >
              <span>{name}</span>
              <span className={active.zones.includes(id) ? "accent" : "muted"}>
                {active.zones.includes(id) ? <Check size={12} /> : "—"}
              </span>
            </button>
          ))}
        </div>
        <div className="estimate-row">
          <div>
            <p className="technical muted">STARTING FROM</p>
            <strong>
              {money(
                Math.round((active.price * basePrice) / 210000 / 1000) * 1000,
              )}
            </strong>
          </div>
          <div>
            <p className="technical muted">TIME</p>
            <span>{active.days}</span>
          </div>
        </div>
        <Link
          className="button button-outline"
          href={`/quote?service=ppf&ppfPackage=${pack}`}
        >
          Рассчитать защиту <Arrow />
        </Link>
        <p className="fine-print">
          Стоимость для купе. Окончательная смета после осмотра. Цвет схемы
          показывает зоны покрытия, а не цвет плёнки.
        </p>
      </div>
    </div>
  );
}
