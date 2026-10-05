import { notFound } from "next/navigation";
import { getCatalog } from "@/lib/db";
import { money, faq } from "@/lib/catalog";
import {
  PageHeading,
  Button,
  Label,
  Breadcrumb,
  JsonLd,
  SectionHeading,
} from "@/components/ui";
import { PPFSelector } from "@/components/ppf";
import Image from "next/image";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getCatalog().services.find((s) => s.id === slug);
  return {
    title: service?.title || "Услуга",
    description: service?.description,
    alternates: process.env.STUDIO_URL
      ? { canonical: `/services/${slug}` }
      : {},
  };
}
export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalog = getCatalog();
  const service = catalog.services.find((s) => s.id === slug);
  if (!service) notFound();
  return (
    <>
      <PageHeading
        label="SERVICES"
        title={service.name}
        description={service.description}
      />
      <div className="container">
        <Breadcrumb
          items={[
            { label: "Услуги", href: "/services" },
            { label: service.title },
          ]}
        />
      </div>
      <section className="container section" style={{ paddingTop: 0 }}>
        <div className="two-column">
          <div className="service-image">
            <Image
              src={service.image}
              alt={service.title}
              fill
              sizes="(max-width:800px) 100vw, 50vw"
              priority
            />
          </div>
          <div className="detail-summary">
            <Label>SERVICE / {service.id.toUpperCase()}</Label>
            <h2>{service.title}</h2>
            <p>{service.description}</p>
            <ul className="feature-list">
              {service.features.map((feature, i) => (
                <li key={feature}>
                  <span>0{i + 1}</span>
                  {feature}
                </li>
              ))}
            </ul>
            <div className="estimate-row">
              <div>
                <Label>STARTING FROM</Label>
                <strong>{money(service.price)}</strong>
              </div>
              <div>
                <Label>TIME</Label>
                <span>
                  {service.days}–{service.days + 1} дней
                </span>
              </div>
            </div>
            <Button href={`/quote?service=${service.id}`}>
              Рассчитать проект
            </Button>
            <p className="fine-print">
              Материалы: {service.material}. Точная стоимость определяется после
              осмотра.
            </p>
          </div>
        </div>
      </section>
      {slug === "ppf" && (
        <section className="container section">
          <SectionHeading
            number="01"
            label="COVERAGE"
            title="CHOOSE YOUR PROTECTION."
          />
          <PPFSelector basePrice={service.price} />
        </section>
      )}
      {slug === "paint" && (
        <section className="container section">
          <SectionHeading
            number="01"
            label="PAINT PROCESS"
            title="EVERY LAYER MATTERS."
          />
          <div className="process-list">
            {[
              "INSPECTION",
              "DISASSEMBLY",
              "PREPARATION",
              "PRIMER",
              "PAINT",
              "CLEAR COAT",
              "POLISHING",
              "QUALITY CONTROL",
            ].map((title, i) => (
              <div className="process-item" key={title}>
                <Label>0{i + 1} /</Label>
                <h3>{title}</h3>
              </div>
            ))}
          </div>
          <p className="fine-print">
            OEM colors / custom colors / individual paint / special finishes
          </p>
        </section>
      )}
      <section className="container section">
        <SectionHeading
          number="02"
          label="QUESTIONS"
          title="THE DETAILS, EXPLAINED."
        />
        <div className="faq-list">
          {faq.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.title,
          description: service.description,
          provider: { "@type": "LocalBusiness", name: catalog.settings.name },
          offers: {
            "@type": "Offer",
            priceCurrency: "RUB",
            price: service.price,
          },
        }}
      />
    </>
  );
}
