import { getCatalog } from "@/lib/db";
import { Services } from "@/components/services";
import { PageHeading } from "@/components/ui";
export const metadata = {
  alternates: process.env.STUDIO_URL ? { canonical: "/services" } : {},
  title: "Услуги",
};
export default function ServicesPage() {
  return (
    <>
      <PageHeading
        label="OUR EXPERTISE"
        title="EXACTLY WHAT YOUR CAR NEEDS."
        description="Защитить оригинал, восстановить покрытие или полностью изменить образ. Выберите задачу — мы подберём решение."
      />
      <section className="container section" style={{ paddingTop: 0 }}>
        <Services services={getCatalog().services} />
      </section>
    </>
  );
}
