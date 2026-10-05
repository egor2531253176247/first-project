"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Lead } from "@/lib/db";
import { money, stages } from "@/lib/catalog";
import { Label, Button } from "./ui";
import "./interactive.css";
type Booking = {
  id: string;
  lead_id: string;
  date: string;
  time: string;
  status: string;
};
type Document = { title: string; content: string };
const tabs = [
  ["projects", "ACTIVE PROJECT"],
  ["cars", "MY CARS"],
  ["history", "HISTORY"],
  ["documents", "DOCUMENTS"],
  ["invoices", "INVOICES"],
  ["warranty", "WARRANTY"],
  ["recommendations", "RECOMMENDATIONS"],
];
function download(document: Document) {
  const url = URL.createObjectURL(
    new Blob([document.content], { type: "text/plain;charset=utf-8" }),
  );
  const anchor = window.document.createElement("a");
  anchor.href = url;
  anchor.download =
    document.title.replace(/[^а-яА-Яa-zA-Z0-9 _-]/g, "") + ".txt";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function Dashboard({
  leads,
  bookings,
}: {
  leads: Lead[];
  bookings: Booking[];
}) {
  const [tab, setTab] = useState("projects");
  const router = useRouter();
  const active = leads.filter((l) => !["COMPLETED", "LOST"].includes(l.status));
  const history = leads.filter((l) => ["COMPLETED", "LOST"].includes(l.status));
  const documents = leads.flatMap((l) =>
    Array.isArray(l.payload.documents)
      ? (l.payload.documents as Document[])
      : [],
  );
  const cars = [
    ...new Map(
      leads.map((l) => [
        String(l.payload.brand) + " " + String(l.payload.model),
        l,
      ]),
    ).values(),
  ];
  return (
    <div className="dashboard-layout">
      <nav className="dashboard-nav" aria-label="Разделы кабинета">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            className={tab === id ? "active" : ""}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
        <button onClick={() => router.refresh()}>Обновить статус ↻</button>
      </nav>
      <div>
        {(tab === "projects" || tab === "history") && (
          <>
            {(tab === "projects" ? active : history).map((lead) => (
              <div key={lead.id} className="dashboard-order">
                <Label>
                  <span className="accent">
                    PROJECT / {lead.id.slice(0, 8).toUpperCase()}
                  </span>{" "}
                  / {lead.status}
                </Label>
                <h3>
                  {String(lead.payload.brand)} {String(lead.payload.model)}
                </h3>
                <p className="form-note">
                  {String(
                    (lead.payload.estimate as { service?: string })?.service ||
                      "Проект",
                  )}
                </p>
                <div className="project-progress">
                  {stages.map((stage, i) => (
                    <div
                      className={
                        i <= stages.indexOf(lead.stage) ? "complete" : ""
                      }
                      key={stage}
                    >
                      {stage}
                    </div>
                  ))}
                </div>
                {bookings
                  .filter((b) => b.lead_id === lead.id)
                  .map((booking) => (
                    <p className="form-note" key={booking.id}>
                      Визит: {booking.date}, {booking.time} (UTC+3) /{" "}
                      {booking.status}
                    </p>
                  ))}
                {typeof lead.payload.recommendation === "string" &&
                  lead.payload.recommendation && (
                    <p className="form-note">{lead.payload.recommendation}</p>
                  )}
                {Array.isArray(lead.payload.photos) && (
                  <div className="dashboard-photos">
                    {(lead.payload.photos as string[]).map((file) => (
                      <a
                        href={"/api/media/" + file}
                        target="_blank"
                        rel="noreferrer"
                        key={file}
                      >
                        <img
                          src={"/api/media/" + file}
                          alt="Фотография вашего автомобиля"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {!(tab === "projects" ? active : history).length && (
              <Empty
                text={
                  tab === "projects"
                    ? "Активных проектов пока нет."
                    : "Завершённые проекты появятся здесь."
                }
              />
            )}
          </>
        )}
        {tab === "cars" && (
          <>
            {cars.map((lead) => (
              <div className="dashboard-order" key={lead.id}>
                <Label>MY GARAGE</Label>
                <h3>
                  {String(lead.payload.brand)} {String(lead.payload.model)}
                </h3>
                <p className="form-note">Год / {String(lead.payload.year)}</p>
                <Button
                  href={`/quote?vehicle=${encodeURIComponent(String(lead.payload.brand) + " " + String(lead.payload.model))}`}
                  secondary
                >
                  Новый проект
                </Button>
              </div>
            ))}
            {!cars.length && (
              <Empty text="Ваши автомобили появятся после первой заявки." />
            )}
          </>
        )}
        {tab === "documents" && (
          <div className="document-list">
            {documents.map((doc, i) => (
              <details key={i}>
                <summary>{doc.title}</summary>
                <pre>{doc.content}</pre>
                <button className="text-link" onClick={() => download(doc)}>
                  Скачать документ ↗
                </button>
              </details>
            ))}
            {!documents.length && (
              <Empty text="Студия добавит документы после согласования проекта." />
            )}
          </div>
        )}
        {tab === "invoices" && (
          <>
            {leads
              .filter((l) => Number(l.payload.invoice) > 0)
              .map((lead) => (
                <div className="dashboard-order" key={lead.id}>
                  <Label>ESTIMATE / {lead.id.slice(0, 8).toUpperCase()}</Label>
                  <h3>{money(Number(lead.payload.invoice))}</h3>
                  <p className="form-note">
                    Согласованная стоимость. Реквизиты и платёжные документы
                    предоставляются студией отдельно.
                  </p>
                </div>
              ))}
            {!leads.some((l) => Number(l.payload.invoice) > 0) && (
              <Empty text="Согласованные суммы появятся после подготовки сметы." />
            )}
          </>
        )}
        {(tab === "warranty" || tab === "recommendations") && (
          <>
            {leads
              .filter(
                (l) =>
                  l.payload[tab === "warranty" ? "warranty" : "recommendation"],
              )
              .map((lead) => (
                <div className="dashboard-order" key={lead.id}>
                  <Label>PROJECT / {lead.id.slice(0, 8).toUpperCase()}</Label>
                  <h3>
                    {String(lead.payload.brand)} {String(lead.payload.model)}
                  </h3>
                  <p className="form-note" style={{ whiteSpace: "pre-wrap" }}>
                    {String(
                      lead.payload[
                        tab === "warranty" ? "warranty" : "recommendation"
                      ],
                    )}
                  </p>
                </div>
              ))}
            {!leads.some(
              (l) =>
                l.payload[tab === "warranty" ? "warranty" : "recommendation"],
            ) && (
              <Empty
                text={
                  tab === "warranty"
                    ? "Условия гарантии добавляются после согласования материалов."
                    : "Рекомендации по уходу появятся после выполнения работ."
                }
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="empty-state">
      <h3>THE NEXT CHAPTER IS YOURS.</h3>
      <p>{text}</p>
      <Button href="/quote" secondary>
        Начать проект
      </Button>
    </div>
  );
}
