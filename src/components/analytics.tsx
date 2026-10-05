"use client";
import { useEffect } from "react";
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}
export function Analytics({ id }: { id?: string }) {
  useEffect(() => {
    if (!id || !/^G-[A-Z0-9]+$/.test(id)) return;
    let loaded = false;
    function consent(allowed: boolean) {
      if (!id) return;
      (window as unknown as Record<string, unknown>)[`ga-disable-${id}`] =
        !allowed;
      if (!allowed) {
        if (loaded)
          window.gtag("consent", "update", {
            analytics_storage: "denied",
            ad_storage: "denied",
          });
        return;
      }
      if (loaded) {
        window.gtag("consent", "update", {
          analytics_storage: "granted",
          ad_storage: "denied",
        });
        return;
      }
      loaded = true;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function (...args) {
        window.dataLayer.push(args);
      };
      window.gtag("consent", "default", {
        analytics_storage: "granted",
        ad_storage: "denied",
      });
      window.gtag("js", new Date());
      window.gtag("config", id, {
        anonymize_ip: true,
        allow_google_signals: false,
      });
      const script = document.createElement("script");
      script.src = "https://www.googletagmanager.com/gtag/js?id=" + id;
      script.async = true;
      document.head.appendChild(script);
    }
    try {
      consent(
        JSON.parse(localStorage.getItem("precision-consent") || "{}")
          .analytics === true,
      );
    } catch {}
    const update = (event: Event) =>
      consent((event as CustomEvent).detail.analytics);
    window.addEventListener("consent-updated", update);
    return () => window.removeEventListener("consent-updated", update);
  }, [id]);
  return null;
}
