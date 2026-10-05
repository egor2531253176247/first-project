import { notFound } from "next/navigation";
import Image from "next/image";
import { getCatalog } from "@/lib/db";
import { Gallery, BeforeAfter } from "@/components/media";
import { ProjectCard } from "@/components/portfolio";
import {
  Breadcrumb,
  Button,
  Label,
  SectionHeading,
  JsonLd,
} from "@/components/ui";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getCatalog().projects.find((p) => p.slug === slug);
  return {
    title: project?.title || "Проект",
    description: project?.story,
    alternates: process.env.STUDIO_URL
      ? { canonical: `/projects/${slug}` }
      : {},
  };
}
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalog = getCatalog();
  const project = catalog.projects.find((p) => p.slug === slug);
  if (!project) notFound();
  const service = catalog.services.find((s) => s.id === project.service);
  return (
    <>
      <div style={{ paddingTop: 105 }}>
        <div className="container">
          <Breadcrumb
            items={[
              { label: "Проекты", href: "/projects" },
              { label: project.title },
            ]}
          />
        </div>
      </div>
      <div className="detail-hero">
        <Image
          src={project.image}
          alt={project.title}
          fill
          priority
          sizes="100vw"
        />
        <div className="detail-hero-title">
          <Label>
            <span className="accent">PROJECT / {project.id}</span>{" "}
            {project.demo ? " / CONCEPT" : " / COMPLETED"}
          </Label>
          <h1>{project.title}</h1>
          <Label>{service?.name}</Label>
        </div>
      </div>
      <div className="container">
        <div className="project-specs">
          {[
            ["CAR", project.title],
            ["SERVICE", service?.title],
            ["MATERIAL", project.material],
            ["DURATION", project.duration],
            ["STATUS", project.demo ? "Concept project" : "Completed"],
          ].map(([name, value]) => (
            <div key={name}>
              <Label>{name}</Label>
              <p>{value}</p>
            </div>
          ))}
        </div>
      </div>
      <section className="container section">
        <div className="two-column">
          <div>
            <Label>THE BRIEF / PROJECT {project.id}</Label>
            <h2>
              BEYOND
              <br />
              THE SURFACE.
            </h2>
          </div>
          <div className="prose">
            <p>{project.story}</p>
            <h3>Точность исполнения</h3>
            <p>
              Диагностика покрытия, подготовка поверхности и согласование
              материала. Аккуратная работа с геометрией деталей. Проверка
              результата при направленном свете.
            </p>
            {project.demo && (
              <p className="fine-print">
                Это иллюстративный концепт. Фотографии не подтверждают
                выполнение работ студией.
              </p>
            )}
            <Button
              href={`/quote?service=${project.service}&vehicle=${encodeURIComponent(project.title)}`}
            >
              Хочу похожий проект
            </Button>
          </div>
        </div>
      </section>
      <section className="container section">
        <SectionHeading number="01" label="THE GALLERY" title="LOOK CLOSER." />
        <Gallery
          images={project.gallery.length ? project.gallery : [project.image]}
          title={project.title}
        />
      </section>
      <section className="container section">
        <SectionHeading
          number="02"
          label="FINISH / CONCEPT"
          title="A DIFFERENT PERSPECTIVE."
        />
        <BeforeAfter />
      </section>
      <section className="container section">
        <SectionHeading
          number="03"
          label="MORE PROJECTS"
          title="THE NEXT INSPIRATION."
        />
        <div className="projects-featured">
          {catalog.projects
            .filter((p) => p.id !== project.id)
            .slice(0, 2)
            .map((p) => (
              <ProjectCard project={p} services={catalog.services} key={p.id} />
            ))}
        </div>
      </section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Главная",
              item: process.env.STUDIO_URL || "/",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Проекты",
              item: (process.env.STUDIO_URL || "") + "/projects",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: project.title,
              item:
                (process.env.STUDIO_URL || "") + "/projects/" + project.slug,
            },
          ],
        }}
      />
    </>
  );
}
