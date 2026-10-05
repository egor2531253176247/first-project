import Link from "next/link";
import type { ReactNode } from "react";
export function Arrow({ diagonal = true }: { diagonal?: boolean }) {
  return (
    <svg
      className="arrow"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d={diagonal ? "M5 19 19 5M5 5h14v14" : "M4 12h15m-6-6 6 6-6 6"} />
    </svg>
  );
}
export function Check({ size = 24 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}
export function Play() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M7 4 20 12 7 20Z" fill="currentColor" />
    </svg>
  );
}
export function CompareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M3 12h18M7 8l-4 4 4 4m10-8 4 4-4 4" />
    </svg>
  );
}
export function UploadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="28"
      height="28"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    >
      <path d="M12 16V3m-5 5 5-5 5 5M4 17v4h16v-4" />
    </svg>
  );
}
export function Button({
  href,
  children,
  secondary = false,
  className = "",
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`button ${secondary ? "button-outline" : ""} ${className}`}
    >
      {children}
      <Arrow />
    </Link>
  );
}
export function Label({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={`technical ${className}`}>{children}</p>;
}
export function SectionHeading({
  number,
  label,
  title,
  children,
}: {
  number: string;
  label: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <Label>
        <span className="accent">{number}</span>
        <span className="label-separator">/</span>
        {label}
      </Label>
      <div className="heading-line">
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}
export function PageHeading({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="page-heading container">
      <Label>
        <span className="accent">PRECISION</span> / {label}
      </Label>
      <h1>{title}</h1>
      {description && <p className="page-intro">{description}</p>}
    </div>
  );
}
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
export function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav className="breadcrumb technical" aria-label="Хлебные крошки">
      <Link href="/">Главная</Link>
      {items.map((x, i) => (
        <span key={i}>
          {" "}
          / {x.href ? <Link href={x.href}>{x.label}</Link> : x.label}
        </span>
      ))}
    </nav>
  );
}
