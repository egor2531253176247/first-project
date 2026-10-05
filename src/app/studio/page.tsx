import Image from "next/image";
import { getCatalog } from "@/lib/db";
import { process as steps } from "@/lib/catalog";
import { PageHeading, Label, SectionHeading, Button } from "@/components/ui";
export const metadata = {
  alternates: process.env.STUDIO_URL ? { canonical: "/studio" } : {},
  title: "Студия",
};
export default function StudioPage() {
  const { settings, materials } = getCatalog();
  return (
    <>
      <PageHeading
        label="THE STUDIO"
        title="DETAIL IS EVERYTHING."
        description={settings.about}
      />
      <section className="container section" style={{ paddingTop: 0 }}>
        <div className="studio-feature">
          <Image
            src="/images/studio.webp"
            alt="Выразительная геометрия Porsche 911"
            fill
            priority
            sizes="90vw"
          />
          <Label>THE PHILOSOPHY / {settings.name}</Label>
          <h2>
            BUILT
            <br />
            FOR
            <br />
            PRECISION.
          </h2>
        </div>
      </section>
      <section className="container section">
        <div className="studio-values">
          {[
            [
              "01 / PRECISION",
              "Каждый миллиметр.",
              "Кромки, стыки, отражения. Контролируем не только общее впечатление, но и детали, которые определяют качество работы.",
            ],
            [
              "02 / MATERIALS",
              "Правильный материал.",
              "Подбираем покрытие под условия эксплуатации и задачу. Согласовываем фактуру, оттенок и требования к уходу заранее.",
            ],
            [
              "03 / TRANSPARENCY",
              "Понятный процесс.",
              "Объём, смета и сроки — до начала работ. Статус проекта, документы и рекомендации доступны клиенту в кабинете.",
            ],
          ].map(([number, title, description]) => (
            <div key={number}>
              <Label>
                <span className="accent">{number}</span>
              </Label>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="container section">
        <SectionHeading number="01" label="HOW WE WORK" title="NO SHORTCUTS." />
        <div className="process-list">
          {steps.map(([title, description], i) => (
            <div className="process-item" key={title}>
              <Label>0{i + 1} /</Label>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="container section">
        <SectionHeading
          number="02"
          label="OUR MATERIALS"
          title="QUALITY STARTS HERE."
        />
        <div className="material-list">
          {materials.map((m) => (
            <span key={m.id}>{m.name}</span>
          ))}
        </div>
      </section>
      <section className="container section">
        <div className="cta-strip">
          <h3>Посмотрим на ваш автомобиль вместе.</h3>
          <Button href="/booking">Записаться на осмотр</Button>
        </div>
      </section>
    </>
  );
}
