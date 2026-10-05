"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Project, Service } from "@/lib/catalog";
import { Arrow } from "./ui";
export function ProjectCard({
  project,
  services,
}: {
  project: Project;
  services: Service[];
}) {
  return (
    <Link href={`/projects/${project.slug}`} className="project-card">
      <div className="project-photo">
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(max-width:520px) 100vw, (max-width:800px) 50vw, 45vw"
        />
        <div className="project-overlay">
          <span className="technical">PROJECT / {project.id}</span>
          <span className="project-open">
            <Arrow />
          </span>
        </div>
      </div>
      <div className="project-info">
        <p className="technical">
          {services.find((x) => x.id === project.service)?.name} /{" "}
          {project.material}
        </p>
        <h3>{project.title}</h3>
        <div className="project-info-bottom">
          <span>
            {project.color} / {project.duration}
          </span>
          {project.demo && <span className="demo-label">CONCEPT PROJECT</span>}
        </div>
      </div>
    </Link>
  );
}
export function Portfolio({
  projects,
  services,
}: {
  projects: Project[];
  services: Service[];
}) {
  const [category, setCategory] = useState("all");
  const [advanced, setAdvanced] = useState(false);
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [body, setBody] = useState("");
  const visible = projects.filter(
    (x) =>
      (category === "all" || x.service === category) &&
      (!brand || x.brand === brand) &&
      (!color || x.color === color) &&
      (!body || x.body === body),
  );
  function reset() {
    setCategory("all");
    setBrand("");
    setColor("");
    setBody("");
  }
  return (
    <>
      <div className="portfolio-controls">
        <div className="filter-tabs" role="group" aria-label="Услуга проекта">
          {[
            ["all", "ALL"],
            ...services
              .filter((x) => projects.some((p) => p.service === x.id))
              .map((x) => [x.id, x.id.toUpperCase()]),
          ].map(([id, name]) => (
            <button
              key={id}
              className={category === id ? "active" : ""}
              aria-pressed={category === id}
              onClick={() => setCategory(id)}
            >
              {name}
            </button>
          ))}
        </div>
        <button
          className="filter-expand"
          aria-expanded={advanced}
          onClick={() => setAdvanced(!advanced)}
        >
          ФИЛЬТРЫ {advanced ? "−" : "+"}
        </button>
      </div>
      {advanced && (
        <div className="advanced-filters">
          {[
            ["Марка", brand, setBrand, "brand"],
            ["Цвет", color, setColor, "color"],
            ["Кузов", body, setBody, "body"],
          ].map(([label, value, setValue, key]) => (
            <label className="form-field" key={label as string}>
              <span>{label as string}</span>
              <select
                value={value as string}
                onChange={(e) =>
                  (setValue as (v: string) => void)(e.target.value)
                }
              >
                <option value="">Все</option>
                {[
                  ...new Set(
                    projects.map((x) => x[key as "brand" | "color" | "body"]),
                  ),
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
      )}
      <p className="results-count" aria-live="polite">
        ПРОЕКТОВ / {String(visible.length).padStart(2, "0")}
      </p>
      {visible.length ? (
        <div className="portfolio-grid">
          {visible.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              services={services}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>ПРОЕКТЫ НЕ НАЙДЕНЫ</h3>
          <p>Попробуйте изменить параметры поиска.</p>
          <button className="text-link" onClick={reset}>
            Сбросить фильтры <Arrow />
          </button>
        </div>
      )}
    </>
  );
}
