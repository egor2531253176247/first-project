import { getCatalog } from "@/lib/db";
import { PageHeading } from "@/components/ui";
import { Portfolio } from "@/components/portfolio";
export const metadata = {
  title: "Проекты",
  alternates: process.env.STUDIO_URL ? { canonical: "/projects" } : {},
};
export default function ProjectsPage() {
  const catalog = getCatalog();
  return (
    <>
      <PageHeading
        label="PROJECT ARCHIVE"
        title="EVERY CAR. A NEW STATEMENT."
        description="Защита, цвет и чистота отражений. Посмотрите концепции проектов и выберите направление для своего автомобиля."
      />
      <section className="container section" style={{ paddingTop: 0 }}>
        <Portfolio projects={catalog.projects} services={catalog.services} />
        {catalog.projects.some((x) => x.demo) && (
          <p className="fine-print">
            Проекты с отметкой CONCEPT PROJECT — иллюстрации возможных решений,
            а не выполненные заказы студии.
          </p>
        )}
      </section>
    </>
  );
}
