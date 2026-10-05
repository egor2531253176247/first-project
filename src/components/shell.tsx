"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type { Settings } from "@/lib/catalog";
import { Button, Arrow } from "./ui";
const nav = [
  ["Услуги", "/services"],
  ["Проекты", "/projects"],
  ["Конфигуратор", "/configurator"],
  ["Студия", "/studio"],
  ["Контакты", "/contact"],
];
export function Logo({ name = "PRECISION" }: { name?: string }) {
  return (
    <Link href="/" className="logo" aria-label={`${name}, главная`}>
      <svg viewBox="0 0 39 36" aria-hidden="true">
        <path
          fill="currentColor"
          d="M10 2h25L27 19H14L7 34H0L10 2Zm5 7-2 4h10l2-4H15Z"
        />
        <path fill="#ff1e1e" d="m27 25-4 9h9l4-9h-9Z" />
      </svg>
      <span>
        {name}
        <small>AUTO PERFORMANCE STUDIO</small>
      </span>
    </Link>
  );
}
export function Navbar({ settings }: { settings: Settings }) {
  const [scrolled, setScrolled] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);
  return (
    <>
      <header
        className={`navbar ${scrolled || pathname !== "/" ? "scrolled" : ""}`}
      >
        <div className="nav-inner">
          <Logo name={settings.name} />
          <nav className="desktop-nav" aria-label="Главная навигация">
            {nav.map(([text, url]) => (
              <Link
                key={url}
                href={url}
                className={pathname.startsWith(url) ? "active" : ""}
              >
                {text}
              </Link>
            ))}
          </nav>
          <div className="nav-actions">
            <Link
              className="account-link"
              href="/dashboard"
              aria-label="Личный кабинет"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="3.3" />
                <path d="M5 21v-3a7 7 0 0 1 14 0v3" />
              </svg>
            </Link>
            <Button href="/quote" className="nav-cta">
              Начать проект
            </Button>
            <button
              className="menu-toggle"
              aria-label="Открыть меню"
              onClick={() => dialog.current?.showModal()}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>
      <dialog className="mobile-menu" ref={dialog}>
        <div className="menu-top">
          <Logo name={settings.name} />
          <button
            className="icon-button"
            onClick={() => dialog.current?.close()}
            aria-label="Закрыть меню"
          >
            ×
          </button>
        </div>
        <nav aria-label="Мобильная навигация">
          {nav.map(([text, url], i) => (
            <Link key={url} href={url} onClick={() => dialog.current?.close()}>
              <span className="technical accent">0{i + 1}</span>
              {text}
              <Arrow />
            </Link>
          ))}
        </nav>
        <Button href="/booking">Записаться в студию</Button>
      </dialog>
    </>
  );
}
export function Footer({ settings }: { settings: Settings }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <p className="technical">
              <span className="accent">NEXT /</span> YOUR PROJECT
            </p>
            <h2>
              READY FOR
              <br />
              <span className="muted">WHAT’S NEXT?</span>
            </h2>
          </div>
          <Button href="/quote">Обсудить проект</Button>
        </div>
        <div className="footer-grid">
          <div>
            <Logo name={settings.name} />
            <p className="footer-philosophy">
              Точность в работе.
              <br />
              Характер в каждой детали.
            </p>
          </div>
          <div>
            <p className="technical muted">НАВИГАЦИЯ</p>
            {nav.map(([name, path]) => (
              <Link key={path} href={path}>
                {name}
              </Link>
            ))}
          </div>
          <div>
            <p className="technical muted">КОНТАКТ</p>
            {settings.phone && (
              <a href={"tel:" + settings.phone.replace(/[^+0-9]/g, "")}>
                {settings.phone}
              </a>
            )}
            {settings.email && (
              <a href={"mailto:" + settings.email}>{settings.email}</a>
            )}
            {settings.address && <p>{settings.address}</p>}
            <p>{settings.hours}</p>
            {!settings.phone && !settings.email && (
              <Link href="/quote">
                Оставить заявку <Arrow />
              </Link>
            )}
          </div>
          <div>
            <p className="technical muted">FOLLOW THE DETAILS</p>
            {(["telegram", "instagram", "youtube", "whatsapp"] as const)
              .filter((x) => settings[x])
              .map((x) => (
                <a key={x} href={settings[x]} target="_blank" rel="noreferrer">
                  {x.toUpperCase()} <Arrow />
                </a>
              ))}
            <Link href="/blog">Журнал</Link>
            <Link href="/dashboard">Личный кабинет</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {settings.name}. Все права защищены.
          </span>
          <div>
            <Link href="/privacy">Конфиденциальность</Link>
            <button
              onClick={() =>
                window.dispatchEvent(new Event("cookie-preferences"))
              }
            >
              Cookies
            </button>
            <Link href="/terms">Условия</Link>
          </div>
          <span className="technical">DARK. FAST. PRECISE.</span>
        </div>
      </div>
    </footer>
  );
}
export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [preferences, setPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  useEffect(() => {
    try {
      setVisible(!localStorage.getItem("precision-consent"));
      setAnalytics(
        JSON.parse(localStorage.getItem("precision-consent") || "{}")
          .analytics === true,
      );
    } catch {
      setVisible(true);
    }
    const open = () => {
      setVisible(true);
      setPreferences(true);
    };
    window.addEventListener("cookie-preferences", open);
    return () => window.removeEventListener("cookie-preferences", open);
  }, []);
  function save(allow: boolean) {
    setAnalytics(allow);
    try {
      localStorage.setItem(
        "precision-consent",
        JSON.stringify({
          necessary: true,
          analytics: allow,
          date: new Date().toISOString(),
        }),
      );
    } catch {}
    setVisible(false);
    window.dispatchEvent(
      new CustomEvent("consent-updated", { detail: { analytics: allow } }),
    );
  }
  if (!visible) return null;
  return (
    <aside className="cookie-banner" aria-label="Настройки файлов cookie">
      <div>
        <p className="technical">YOUR PRIVACY / YOUR CHOICE</p>
        <p>
          Технические cookies нужны для входа. Аналитика включается только с
          вашего согласия. <Link href="/cookies">Подробнее</Link>
        </p>
        {preferences && (
          <div className="cookie-options">
            <label>
              <input type="checkbox" checked disabled /> Необходимые
            </label>
            <label>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
              />{" "}
              Аналитика
            </label>
          </div>
        )}
      </div>
      <div className="cookie-actions">
        <button className="text-button" onClick={() => save(false)}>
          Отклонить
        </button>
        <button
          className="text-button"
          onClick={() => (preferences ? save(analytics) : setPreferences(true))}
        >
          {preferences ? "Сохранить" : "Настроить"}
        </button>
        <button className="button" onClick={() => save(true)}>
          Принять все
        </button>
      </div>
    </aside>
  );
}
export function AmbientUI() {
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => {
    const update = () =>
      setProgress(
        window.scrollY /
          Math.max(
            1,
            document.documentElement.scrollHeight - window.innerHeight,
          ),
      );
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [path]);
  return (
    <>
      <div
        className="scroll-progress"
        style={{ transform: `scaleX(${progress})` }}
      />
      <div className="floating-contact">
        {open && (
          <div className="contact-popover">
            <Link href="/quote">
              Рассчитать проект <Arrow />
            </Link>
            <Link href="/booking">
              Записаться <Arrow />
            </Link>
            <Link href="/contact">
              Контакты <Arrow />
            </Link>
          </div>
        )}
        <button
          aria-label={
            open ? "Закрыть быстрые контакты" : "Открыть быстрые контакты"
          }
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? (
            "×"
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 11a8 8 0 0 1-8 8H5l-3 3V11a9 9 0 1 1 18 0Z" />
              <path d="M7 9h8M7 13h5" />
            </svg>
          )}
        </button>
      </div>
      <Link href="/quote" className="mobile-sticky-cta">
        Начать проект <Arrow />
      </Link>
    </>
  );
}
