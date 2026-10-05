import { extras, packages, type Service } from "./catalog.ts";
export type Configuration = {
  vehicle: string;
  body: "coupe" | "sedan" | "suv";
  service: string;
  finish: string;
  color: string;
  extras: string[];
  ppfPackage?: string;
};
export function calculate(config: Configuration, services: Service[]) {
  const service = services.find((s) => s.id === config.service);
  if (!service) throw new Error("Unknown service");
  if (!["coupe", "sedan", "suv"].includes(config.body))
    throw new Error("Unknown body");
  if (
    !["Gloss", "Satin", "Matte", "Metallic", "Color shift", "Carbon"].includes(
      config.finish,
    )
  )
    throw new Error("Unknown finish");
  const selectedExtras = [...new Set(config.extras)];
  if (selectedExtras.some((id) => !extras.some((extra) => extra.id === id)))
    throw new Error("Unknown extra");
  const pack = packages.find((p) => p.id === config.ppfPackage);
  if (config.service === "ppf" && config.ppfPackage && !pack)
    throw new Error("Unknown PPF package");
  const multiplier =
    config.body === "suv" ? 1.2 : config.body === "sedan" ? 1.1 : 1;
  const finishMultiplier =
    config.service === "wrap" &&
    ["Metallic", "Color shift", "Carbon"].includes(config.finish)
      ? 1.15
      : 1;
  const base =
    config.service === "ppf" && pack
      ? (pack.price * service.price) / 210000
      : service.price;
  const price =
    Math.round(
      (base * multiplier * finishMultiplier +
        selectedExtras.reduce(
          (sum, id) => sum + extras.find((x) => x.id === id)!.price,
          0,
        )) /
        1000,
    ) * 1000;
  const days =
    config.service === "ppf" && pack
      ? pack.id === "front"
        ? 2
        : pack.id === "track"
          ? 3
          : 4
      : service.days;
  return {
    price,
    days: selectedExtras.length ? days + 1 : days,
    service: service.title,
  };
}
export function studioDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
export function validBookingDate(value: string, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const day = new Date(value + "T12:00:00+03:00");
  if (!Number.isFinite(day.getTime()) || studioDate(day) !== value)
    return false;
  const today = studioDate(now);
  const last = studioDate(new Date(now.getTime() + 60 * 86400000));
  return value > today && value <= last && day.getUTCDay() !== 0;
}
export const bookingTimes = ["10:00", "12:00", "14:00", "16:00"];
