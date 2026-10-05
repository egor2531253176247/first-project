"use client";
import { useState } from "react";
import {
  type Catalog,
  type Project,
  type Service,
  type Material,
  type Review,
  type Settings,
  money,
  leadStatuses,
  stages,
} from "@/lib/catalog";
import type { Lead } from "@/lib/db";
import { Label, Arrow } from "./ui";
import "./interactive.css";
type Booking = {
  id: string;
  lead_id: string;
  date: string;
  time: string;
  status: string;
};
type Client = { id: string; name: string; email: string; role: string };
type Event = { id: string; kind: string; status: string; created_at: string };
type Data = {
  catalog: Catalog;
  leads: Lead[];
  bookings: Booking[];
  clients: Client[];
  events: Event[];
};
type Collection = "projects" | "services" | "materials" | "reviews";
type RecordItem = Project | Service | Material | Review;
const fieldNames: Record<string, string> = {
  id: "ID",
  name: "Название",
  title: "Заголовок",
  slug: "Адрес страницы",
  brand: "Марка",
  service: "Услуга",
  color: "Цвет",
  body: "Кузов",
  image: "Главная фотография",
  gallery: "Галерея",
  material: "Материал",
  duration: "Срок",
  story: "История проекта",
  demo: "Это концепт, а не выполненная работа",
  description: "Описание",
  price: "Стоимость, ₽",
  days: "Срок, дней",
  features: "Что входит",
  category: "Категория",
  car: "Автомобиль",
  text: "Отзыв",
  rating: "Оценка",
  phone: "Телефон",
  email: "Email",
  address: "Адрес",
  hours: "Часы работы",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  youtube: "YouTube",
  about: "Философия студии",
};
const initialRecords: Record<Collection, RecordItem> = {
  projects: {
    id: "",
    slug: "",
    title: "",
    brand: "",
    service: "ppf",
    color: "",
    body: "Купе",
    image: "/images/porsche.webp",
    gallery: ["/images/porsche.webp"],
    material: "",
    duration: "",
    story: "",
    demo: false,
  },
  services: {
    id: "",
    name: "",
    title: "",
    description: "",
    price: 0,
    days: 1,
    material: "",
    image: "/images/porsche.webp",
    features: [],
  },
  materials: { id: "", name: "", category: "", description: "" },
  reviews: { id: "", name: "", car: "", text: "", rating: 5 },
};
export function Admin({ initial }: { initial: Data }) {
  const [data, setData] = useState(initial);
  const [tab, setTab] = useState("leads");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [record, setRecord] = useState<Record<string, unknown> | null>(null);
  const [originalId, setOriginalId] = useState<string | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [settings, setSettings] = useState(data.catalog.settings);
  async function action(input: unknown) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const output = await response.json();
      if (!response.ok) throw new Error(output.error);
      const fresh = await fetch("/api/admin");
      if (!fresh.ok) throw new Error("Обновите страницу и войдите повторно");
      setData(await fresh.json());
      setMessage("Изменения сохранены.");
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось сохранить изменения.",
      );
      return false;
    } finally {
      setBusy(false);
    }
  }
  const completed = data.leads.filter((l) => l.status === "COMPLETED");
  const revenue = completed.reduce(
    (sum, l) => sum + Number(l.payload.invoice || 0),
    0,
  );
  const average = completed.length ? revenue / completed.length : 0;
  const collection = ["projects", "services", "materials", "reviews"].includes(
    tab,
  )
    ? (tab as Collection)
    : null;
  const stats = [
    ["NEW LEADS", String(data.leads.filter((l) => l.status === "NEW").length)],
    [
      "ACTIVE PROJECTS",
      String(data.leads.filter((l) => l.status === "IN PROGRESS").length),
    ],
    [
      "BOOKINGS",
      String(
        data.bookings.filter(
          (b) => !["CANCELLED", "COMPLETED"].includes(b.status),
        ).length,
      ),
    ],
    ["REVENUE", money(revenue)],
    ["AVERAGE ORDER", money(Math.round(average))],
    [
      "CONVERSION",
      `${data.leads.length ? Math.round((completed.length / data.leads.length) * 100) : 0}%`,
    ],
  ];
  const tabs = [
    ["leads", "Заявки"],
    ["bookings", "Записи"],
    ["clients", "Клиенты / автомобили"],
    ["projects", "Портфолио"],
    ["services", "Услуги / цены"],
    ["materials", "Материалы"],
    ["reviews", "Отзывы"],
    ["settings", "Контент / контакты"],
    ["events", "Интеграции"],
  ];
  function changeTab(value: string) {
    setTab(value);
    setRecord(null);
    setLead(null);
    setError("");
    setMessage("");
    setSettings(data.catalog.settings);
  }
  function editLead(value: Lead) {
    setLead({
      ...value,
      payload: {
        ...value.payload,
        invoice: value.payload.invoice || 0,
        warranty: value.payload.warranty || "",
        recommendation: value.payload.recommendation || "",
        documents: Array.isArray(value.payload.documents)
          ? value.payload.documents
          : [],
      },
    });
  }
  async function saveRecord(e: React.FormEvent) {
    e.preventDefault();
    if (!collection || !record) return;
    const records = (data.catalog[collection] as RecordItem[]).filter(
      (x) => x.id !== originalId,
    );
    const catalog = { ...data.catalog, [collection]: [...records, record] };
    if (await action({ action: "catalog", catalog })) setRecord(null);
  }
  function newRecord() {
    if (!collection) return;
    const id = crypto.randomUUID().slice(0, 8);
    setRecord({ ...initialRecords[collection], id });
    setOriginalId(null);
  }
  async function removeRecord(id: string) {
    if (!collection) return;
    if (!window.confirm("Удалить запись? Изменение будет видно на сайте."))
      return;
    await action({
      action: "catalog",
      catalog: {
        ...data.catalog,
        [collection]: (data.catalog[collection] as RecordItem[]).filter(
          (x) => x.id !== id,
        ),
      },
    });
  }
  function setLeadPayload(key: string, value: unknown) {
    if (lead) setLead({ ...lead, payload: { ...lead.payload, [key]: value } });
  }
  return (
    <>
      <div className="admin-stats">
        {stats.map(([name, value]) => (
          <div key={name}>
            <Label>{name}</Label>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <nav className="admin-tabs" aria-label="Разделы управления">
        {tabs.map(([id, title]) => (
          <button
            disabled={busy}
            className={tab === id ? "active" : ""}
            key={id}
            onClick={() => changeTab(id)}
          >
            {title}
          </button>
        ))}
      </nav>
      {error && (
        <p className="form-message" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="form-message success" role="status">
          {message}
        </p>
      )}
      {tab === "leads" && (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ЗАЯВКА</th>
                  <th>КЛИЕНТ</th>
                  <th>АВТОМОБИЛЬ</th>
                  <th>СТАТУС</th>
                  <th>ОРИЕНТИР</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.leads.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.id.slice(0, 8).toUpperCase()}
                      <br />
                      {new Date(item.created_at).toLocaleDateString("ru-RU")}
                    </td>
                    <td>
                      {String(item.payload.name)}
                      <br />
                      {String(item.payload.email)}
                      <br />
                      {String(item.payload.phone)}
                    </td>
                    <td>
                      {String(item.payload.brand)} {String(item.payload.model)}
                    </td>
                    <td>
                      {item.status}
                      <br />
                      {item.stage}
                    </td>
                    <td>
                      {money(
                        Number(
                          (item.payload.estimate as { price?: number })
                            ?.price || 0,
                        ),
                      )}
                    </td>
                    <td>
                      <button
                        className="text-button"
                        onClick={() => editLead(item)}
                      >
                        Управлять ↗
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!data.leads.length && (
            <p className="form-note">
              Заявок пока нет. Новые формы появятся здесь автоматически.
            </p>
          )}
          {lead && (
            <form
              className="admin-editor"
              onSubmit={async (e) => {
                e.preventDefault();
                if (
                  await action({
                    action: "lead",
                    id: lead.id,
                    status: lead.status,
                    stage: lead.stage,
                    invoice: lead.payload.invoice,
                    warranty: lead.payload.warranty,
                    recommendation: lead.payload.recommendation,
                    documents: lead.payload.documents,
                  })
                )
                  setLead(null);
              }}
            >
              <h3>PROJECT / {lead.id.slice(0, 8).toUpperCase()}</h3>
              <fieldset
                disabled={busy}
                style={{ border: 0, padding: 0, margin: 0 }}
              >
                <div className="form-grid">
                  <label className="form-field">
                    <span>CRM-статус</span>
                    <select
                      value={lead.status}
                      onChange={(e) =>
                        setLead({ ...lead, status: e.target.value })
                      }
                    >
                      {leadStatuses.map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                  <label className="form-field">
                    <span>Этап работ</span>
                    <select
                      value={lead.stage}
                      onChange={(e) =>
                        setLead({ ...lead, stage: e.target.value })
                      }
                    >
                      {stages.map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                  <label className="form-field">
                    <span>Согласованная стоимость, ₽</span>
                    <input
                      type="number"
                      min="0"
                      max="10000000"
                      value={String(lead.payload.invoice)}
                      onChange={(e) =>
                        setLeadPayload("invoice", +e.target.value)
                      }
                    />
                  </label>
                  <label className="form-field full-width">
                    <span>Гарантия</span>
                    <textarea
                      maxLength={1000}
                      value={String(lead.payload.warranty)}
                      onChange={(e) =>
                        setLeadPayload("warranty", e.target.value)
                      }
                    />
                  </label>
                  <label className="form-field full-width">
                    <span>Рекомендации по уходу</span>
                    <textarea
                      maxLength={2000}
                      value={String(lead.payload.recommendation)}
                      onChange={(e) =>
                        setLeadPayload("recommendation", e.target.value)
                      }
                    />
                  </label>
                </div>
                <p className="form-note" style={{ marginTop: 20 }}>
                  Пожелания клиента:{" "}
                  {String(lead.payload.notes || "Не указаны")}
                </p>
                <div className="dashboard-photos">
                  {Array.isArray(lead.payload.photos) &&
                    (lead.payload.photos as string[]).map((file) => (
                      <a
                        href={"/api/media/" + file}
                        target="_blank"
                        rel="noreferrer"
                        key={file}
                      >
                        <img
                          src={"/api/media/" + file}
                          alt="Автомобиль клиента"
                        />
                      </a>
                    ))}
                </div>
                <h3 style={{ marginTop: 30 }}>ДОКУМЕНТЫ</h3>
                {(
                  lead.payload.documents as { title: string; content: string }[]
                ).map((doc, index) => (
                  <div
                    className="form-grid"
                    key={index}
                    style={{ marginBottom: 20 }}
                  >
                    <label className="form-field full-width">
                      <span>Название документа</span>
                      <input
                        value={doc.title}
                        maxLength={100}
                        required
                        onChange={(e) =>
                          setLeadPayload(
                            "documents",
                            (lead.payload.documents as (typeof doc)[]).map(
                              (d, i) =>
                                i === index
                                  ? { ...d, title: e.target.value }
                                  : d,
                            ),
                          )
                        }
                      />
                    </label>
                    <label className="form-field full-width">
                      <span>Текст документа / счёта / гарантийного талона</span>
                      <textarea
                        value={doc.content}
                        maxLength={10000}
                        required
                        onChange={(e) =>
                          setLeadPayload(
                            "documents",
                            (lead.payload.documents as (typeof doc)[]).map(
                              (d, i) =>
                                i === index
                                  ? { ...d, content: e.target.value }
                                  : d,
                            ),
                          )
                        }
                      />
                    </label>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() =>
                        setLeadPayload(
                          "documents",
                          (lead.payload.documents as (typeof doc)[]).filter(
                            (_, i) => i !== index,
                          ),
                        )
                      }
                    >
                      Удалить документ
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-link"
                  disabled={(lead.payload.documents as unknown[]).length >= 10}
                  onClick={() =>
                    setLeadPayload("documents", [
                      ...(lead.payload.documents as unknown[]),
                      { title: "", content: "" },
                    ])
                  }
                >
                  Добавить документ +
                </button>
                <div className="form-actions">
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setLead(null)}
                  >
                    Закрыть
                  </button>
                  <button className="button" type="submit">
                    Сохранить проект <Arrow />
                  </button>
                </div>
              </fieldset>
            </form>
          )}
        </>
      )}
      {tab === "bookings" && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ДАТА / UTC+3</th>
                <th>ВРЕМЯ</th>
                <th>КЛИЕНТ</th>
                <th>СТАТУС</th>
              </tr>
            </thead>
            <tbody>
              {data.bookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.date}</td>
                  <td>{b.time}</td>
                  <td>
                    {String(
                      data.leads.find((l) => l.id === b.lead_id)?.payload
                        .name || "",
                    )}
                  </td>
                  <td>
                    <select
                      aria-label="Статус записи"
                      value={b.status}
                      disabled={busy}
                      onChange={(e) =>
                        void action({
                          action: "booking",
                          id: b.id,
                          status: e.target.value,
                        })
                      }
                    >
                      {["BOOKED", "CONFIRMED", "CANCELLED", "COMPLETED"].map(
                        (x) => (
                          <option key={x}>{x}</option>
                        ),
                      )}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data.bookings.length && (
            <p className="form-note">Записей пока нет.</p>
          )}
        </div>
      )}
      {tab === "clients" && (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>КЛИЕНТ</th>
                  <th>EMAIL</th>
                  <th>АВТОМОБИЛИ</th>
                  <th>ЗАЯВКИ</th>
                </tr>
              </thead>
              <tbody>
                {data.clients.map((client) => (
                  <tr key={client.id}>
                    <td>
                      {client.name}
                      <br />
                      <span className="muted">{client.role}</span>
                    </td>
                    <td>{client.email}</td>
                    <td>
                      {[
                        ...new Set(
                          data.leads
                            .filter((l) => l.user_id === client.id)
                            .map(
                              (l) =>
                                String(l.payload.brand) +
                                " " +
                                String(l.payload.model),
                            ),
                        ),
                      ].join(", ") || "—"}
                    </td>
                    <td>
                      {data.leads.filter((l) => l.user_id === client.id).length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="fine-print">
            Контакты анонимных клиентов хранятся в заявках. Привязка к аккаунтам
            по совпадению email не выполняется.
          </p>
        </>
      )}
      {collection && (
        <>
          <div className="admin-toolbar">
            <h2>{tabs.find((x) => x[0] === tab)?.[1]}</h2>
            <button className="button" disabled={busy} onClick={newRecord}>
              Добавить <Arrow />
            </button>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>НАЗВАНИЕ</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {(data.catalog[collection] as RecordItem[]).map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>
                      {"title" in item
                        ? item.title
                        : "name" in item
                          ? item.name
                          : ""}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="text-button"
                        disabled={busy}
                        onClick={() => {
                          setRecord({ ...item });
                          setOriginalId(item.id);
                        }}
                      >
                        Изменить
                      </button>
                      <button
                        className="text-button"
                        style={{ marginLeft: 20, color: "#ff8e8e" }}
                        disabled={busy}
                        onClick={() => void removeRecord(item.id)}
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {record && (
            <form className="admin-editor" onSubmit={saveRecord}>
              <h3>{originalId ? "РЕДАКТИРОВАНИЕ" : "НОВАЯ ЗАПИСЬ"}</h3>
              <RecordFields
                value={record}
                onChange={setRecord}
                services={data.catalog.services}
                disabled={busy}
                originalId={originalId}
              />
              <div className="form-actions">
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setRecord(null)}
                >
                  Закрыть
                </button>
                <button type="submit" className="button" disabled={busy}>
                  Сохранить <Arrow />
                </button>
              </div>
            </form>
          )}
        </>
      )}
      {tab === "settings" && (
        <form
          className="admin-editor"
          style={{ marginTop: 0 }}
          onSubmit={(e) => {
            e.preventDefault();
            void action({
              action: "catalog",
              catalog: { ...data.catalog, settings },
            });
          }}
        >
          <h3>КОНТАКТЫ И ФИЛОСОФИЯ</h3>
          <RecordFields
            value={settings as unknown as Record<string, unknown>}
            onChange={(v) => setSettings(v as unknown as Settings)}
            services={data.catalog.services}
            disabled={busy}
            originalId={null}
          />
          <div className="form-actions">
            <p className="fine-print">
              Пустые контакты не показываются посетителям. Соцсети — полные
              HTTPS-ссылки.
            </p>
            <button className="button" disabled={busy}>
              Сохранить <Arrow />
            </button>
          </div>
        </form>
      )}
      {tab === "events" && (
        <>
          <p className="form-note">
            История попыток отправки подтверждений и CRM-событий. PENDING —
            сервис ещё не настроен; FAILED — проверьте подключение.
            Автоматическая повторная отправка не выполняется.
          </p>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ТИП</th>
                  <th>СТАТУС</th>
                  <th>ДАТА</th>
                </tr>
              </thead>
              <tbody>
                {data.events.map((event) => (
                  <tr key={event.id}>
                    <td>{event.kind}</td>
                    <td>{event.status}</td>
                    <td>
                      {new Date(event.created_at).toLocaleString("ru-RU", {
                        timeZone: "Europe/Moscow",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
function RecordFields({
  value,
  onChange,
  services,
  disabled,
  originalId,
}: {
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  services: Service[];
  disabled: boolean;
  originalId: string | null;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  async function upload(file: File | undefined, key: string) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.set("image", file);
      const response = await fetch("/api/assets", {
        method: "POST",
        body: form,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      onChange({
        ...value,
        [key]:
          key === "gallery"
            ? [...(value.gallery as string[]), data.src]
            : data.src,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Загрузка не выполнена");
    } finally {
      setUploading(false);
    }
  }
  return (
    <fieldset
      disabled={disabled || uploading}
      style={{ border: 0, padding: 0, margin: 0 }}
    >
      <div className="form-grid">
        {Object.entries(value).map(([key, item]) => {
          if (typeof item === "boolean")
            return (
              <label className="checkbox-label full-width" key={key}>
                <input
                  type="checkbox"
                  checked={item}
                  onChange={(e) =>
                    onChange({ ...value, [key]: e.target.checked })
                  }
                />
                {fieldNames[key] || key}
              </label>
            );
          if (key === "service")
            return (
              <label className="form-field" key={key}>
                <span>{fieldNames[key]}</span>
                <select
                  value={item as string}
                  onChange={(e) =>
                    onChange({ ...value, [key]: e.target.value })
                  }
                >
                  {services.map((s) => (
                    <option value={s.id} key={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </label>
            );
          const multiline =
            Array.isArray(item) ||
            ["description", "story", "text", "about"].includes(key);
          return (
            <div
              className={`form-field ${multiline ? "full-width" : ""}`}
              key={key}
            >
              <label htmlFor={"admin-" + key}>
                {fieldNames[key] || key}
                {Array.isArray(item) ? " · одна строка — один пункт" : ""}
              </label>
              {multiline ? (
                <textarea
                  id={"admin-" + key}
                  value={Array.isArray(item) ? item.join("\n") : String(item)}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      [key]: Array.isArray(item)
                        ? e.target.value.split("\n")
                        : e.target.value,
                    })
                  }
                />
              ) : (
                <input
                  id={"admin-" + key}
                  type={typeof item === "number" ? "number" : "text"}
                  value={String(item)}
                  readOnly={key === "id" && !!originalId}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      [key]:
                        typeof item === "number"
                          ? +e.target.value
                          : e.target.value,
                    })
                  }
                  required={["id", "name", "title", "slug"].includes(key)}
                  maxLength={
                    key === "id" ? 30 : key === "slug" ? 100 : undefined
                  }
                />
              )}{" "}
              {(key === "image" || key === "gallery") && (
                <label
                  className="text-link"
                  style={{ fontSize: 9, alignSelf: "start" }}
                >
                  {uploading ? "Загрузка…" : "Загрузить фото"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{
                      maxWidth: 200,
                      fontSize: 9,
                      minHeight: 32,
                      padding: 5,
                    }}
                    onChange={(e) => void upload(e.target.files?.[0], key)}
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>
      {error && (
        <p className="form-message" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
