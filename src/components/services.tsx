"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { money, type Service } from "@/lib/catalog";
import { Arrow } from "./ui";
export function Services({ services }: { services: Service[] }) {
  const [selected, setSelected] = useState(services[0].id);
  const active = services.find((s) => s.id === selected) || services[0];
  return (
    <div className="services-layout">
      <div className="service-list">
        {services.map((service, i) => (
          <Link
            href={`/services/${service.id}`}
            key={service.id}
            className={`service-row ${active.id === service.id ? "selected" : ""}`}
            onMouseEnter={() => setSelected(service.id)}
            onFocus={() => setSelected(service.id)}
          >
            <span className="service-number">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
            </div>
            <Arrow />
          </Link>
        ))}
      </div>
      <aside className="service-preview">
        <div className="service-image">
          <Image src={active.image} alt={active.title} fill sizes="45vw" />
        </div>
        <div className="service-preview-label">
          <div>
            <p className="technical muted">STARTING FROM</p>
            <strong>{money(active.price)}</strong>
          </div>
          <p className="technical muted">{active.material}</p>
        </div>
        <Link className="text-link" href={`/services/${active.id}`}>
          Узнать об услуге <Arrow />
        </Link>
        <p className="fine-print">
          Предварительный ориентир. Точный объём и стоимость определяются после
          осмотра.
        </p>
      </aside>
    </div>
  );
}
