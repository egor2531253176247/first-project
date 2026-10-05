import Link from "next/link";
import Image from "next/image";
import { getCatalog } from "@/lib/db";
import { faq, process as steps, articles } from "@/lib/catalog";
import { Hero } from "@/components/hero";
import { Services } from "@/components/services";
import { ProjectCard } from "@/components/portfolio";
import { Showreel, BeforeAfter } from "@/components/media";
import { Configurator } from "@/components/configurator";
import { PPFSelector } from "@/components/ppf";
import { Testimonials } from "@/components/testimonials";
import { Arrow, SectionHeading, Label, Button, JsonLd } from "@/components/ui";
export const metadata = {
  alternates: process.env.STUDIO_URL ? { canonical: "/" } : {},
};
export default function Home() {
  const catalog = getCatalog();
  return (
    <>
      <Hero servicesCount={catalog.services.length} />
      <div className="container brand-line">
        <Label>DESIGNED FOR THE EXCEPTIONAL</Label>
        <div>
          <span>PORSCHE</span>
          <span>BMW M</span>
          <span>Mercedes-AMG</span>
          <span>AUDI SPORT</span>
          <span>McLAREN</span>
        </div>
      </div>
      <section className="container intro">
        <div className="intro-top">
          <span className="status-dot" />
          <Label>
            LESS DECORATION.
            <br />
            MORE PERFORMANCE.
          </Label>
        </div>
        <div>
          <h2>
            ВАШ АВТОМОБИЛЬ.
            <br />
            <span className="muted">НА НОВОМ УРОВНЕ.</span>
          </h2>
          <p>
            Сохраняем оригинал. Меняем характер. От невидимой защиты кузова до
            полной смены цвета — точность на каждом этапе.
          </p>
        </div>
      </section>
      <Showreel />
      <section className="container section" id="services">
        <SectionHeading
          number="02"
          label="OUR EXPERTISE"
          title={
            <>
              DETAILS MAKE
              <br />
              THE DIFFERENCE.
            </>
          }
        >
          <p>
            Разные задачи.
            <br />
            Один бескомпромиссный подход.
          </p>
        </SectionHeading>
        <Services services={catalog.services} />
      </section>
      <section className="container section" id="projects">
        <SectionHeading
          number="03"
          label="SELECTED PROJECTS"
          title={
            <>
              BUILT TO
              <br />
              STAND OUT.
            </>
          }
        >
          <Link href="/projects" className="text-link">
            Все проекты <Arrow />
          </Link>
        </SectionHeading>
        <div className="projects-featured">
          {catalog.projects.slice(0, 2).map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              services={catalog.services}
            />
          ))}
        </div>
      </section>
      <section className="container section">
        <SectionHeading
          number="04"
          label="BEFORE / AFTER"
          title="SEE THE DIFFERENCE."
        >
          <p>
            Сравните характер отражений.
            <br />
            Двигайте разделитель.
          </p>
        </SectionHeading>
        <BeforeAfter />
      </section>
      {catalog.services.some((s) => s.id === "ppf") && (
        <section className="surface">
          <div className="container section" id="protection">
            <SectionHeading
              number="05"
              label="PPF / PROTECTION"
              title={
                <>
                  PROTECT
                  <br />
                  THE ORIGINAL.
                </>
              }
            >
              <p>
                Невидимая защита.
                <br />
                Видимая разница в сохранности кузова.
              </p>
            </SectionHeading>
            <PPFSelector
              basePrice={catalog.services.find((s) => s.id === "ppf")?.price}
            />
          </div>
        </section>
      )}
      <section className="container section" id="configurator">
        <SectionHeading
          number="06"
          label="YOUR CAR / YOUR RULES"
          title={
            <>
              CHANGE THE COLOR.
              <br />
              KEEP THE CHARACTER.
            </>
          }
        >
          <p>
            Соберите свою концепцию.
            <br />
            Узнайте предварительную стоимость.
          </p>
        </SectionHeading>
        <Configurator services={catalog.services} compact />
      </section>
      <section className="container section" id="process">
        <SectionHeading
          number="07"
          label="THE PROCESS"
          title="PRECISION. STEP BY STEP."
        />
        <div className="process-list">
          {steps.map(([title, description], i) => (
            <div className="process-item" key={title}>
              <Label>{String(i + 1).padStart(2, "0")} /</Label>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="container section">
        <SectionHeading
          number="08"
          label="MATERIALS MATTER"
          title="ONLY THE RIGHT MATERIALS."
        />
        <div className="material-list">
          {catalog.materials.map((material) => (
            <span key={material.id} title={material.description}>
              {material.name}
            </span>
          ))}
        </div>
        <p className="fine-print">
          Материал подбирается под задачу и согласовывается в смете.
        </p>
      </section>
      <section className="container section" id="studio">
        <SectionHeading
          number="09"
          label="THE STUDIO"
          title="DETAIL IS EVERYTHING."
        />
        <div className="studio-feature">
          <Image
            src="/images/studio.webp"
            alt="Архитектура и линии кузова Porsche 911"
            fill
            sizes="90vw"
          />
          <Label>AN OBSESSION WITH EVERY MILLIMETER</Label>
          <h2>
            BUILT
            <br />
            FOR
            <br />
            PRECISION.
          </h2>
          <Link href="/studio" className="text-link">
            Философия студии <Arrow />
          </Link>
        </div>
      </section>
      <section className="container section">
        <SectionHeading
          number="10"
          label={catalog.reviews.length ? "CLIENT VOICES" : "OUR APPROACH"}
          title="NOTHING LEFT TO CHANCE."
        />
        <div className="testimonials">
          <Testimonials reviews={catalog.reviews} />
          <div className="faq-list">
            {faq.slice(0, 3).map(([question, answer]) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="container section">
        <SectionHeading
          number="11"
          label="LET’S TALK"
          title="YOUR NEXT CHAPTER."
        >
          <Button href="/booking" secondary>
            Записаться в студию
          </Button>
        </SectionHeading>
        <div className="cta-strip">
          <div>
            <Label>FROM AN IDEA TO A PRECISE PLAN</Label>
            <h3>У каждого проекта свой характер.</h3>
            <p className="form-note" style={{ marginBottom: 0 }}>
              Расскажите о вашем автомобиле. Остальное обсудим лично.
            </p>
          </div>
          <Button href="/quote">Начать проект</Button>
        </div>
      </section>
      <section className="container section">
        <SectionHeading
          number="+"
          label="THE JOURNAL"
          title="KNOW YOUR DETAILS."
        >
          <Link href="/blog" className="text-link">
            Читать журнал <Arrow />
          </Link>
        </SectionHeading>
        <div className="blog-grid">
          {articles.slice(0, 3).map((article) => (
            <Link
              className="article-preview"
              href={`/blog/${article.slug}`}
              key={article.slug}
            >
              <div className="article-image">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  sizes="(max-width:800px) 100vw, 30vw"
                />
              </div>
              <Label>
                {article.category} / {article.read}
              </Label>
              <h3>{article.title}</h3>
              <span className="text-link">
                Читать <Arrow />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: catalog.settings.name,
          description: catalog.settings.about,
          ...(catalog.settings.address
            ? { address: catalog.settings.address }
            : {}),
          ...(catalog.settings.phone
            ? { telephone: catalog.settings.phone }
            : {}),
          ...(process.env.STUDIO_URL ? { url: process.env.STUDIO_URL } : {}),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.slice(0, 3).map(([name, text]) => ({
            "@type": "Question",
            name,
            acceptedAnswer: { "@type": "Answer", text },
          })),
        }}
      />
    </>
  );
}
