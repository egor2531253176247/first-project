import { getCatalog } from "@/lib/db";
import { Configurator } from "@/components/configurator";
import { PPFSelector } from "@/components/ppf";
import { PageHeading, SectionHeading, Button } from "@/components/ui";
export const metadata = {
  alternates: process.env.STUDIO_URL ? { canonical: "/configurator" } : {},
  title: "Конфигуратор",
};
export default function ConfiguratorPage() {
  const { services } = getCatalog();
  return (
    <>
      <PageHeading
        label="YOUR CAR / YOUR RULES"
        title="DESIGN YOUR NEXT CHAPTER."
        description="Выберите автомобиль, покрытие и цвет. Посмотрите концепцию и предварительный расчёт."
      />
      <section className="container section" style={{ paddingTop: 0 }}>
        <Configurator services={services} />
      </section>
      {services.some((s) => s.id === "ppf") && (
        <section className="container section">
          <SectionHeading
            number="02"
            label="PROTECTION"
            title="PROTECT THE PERFORMANCE."
          />
          <PPFSelector
            basePrice={services.find((s) => s.id === "ppf")?.price}
          />
        </section>
      )}
      <section className="container section">
        <div className="cta-strip">
          <div>
            <h3>Визуальная концепция вашего автомобиля</h3>
            <p className="form-note">
              Загрузите фото и подготовьте параметры для AI-визуализации.
            </p>
          </div>
          <Button href="/visualizer" secondary>
            AI Visualizer
          </Button>
        </div>
      </section>
    </>
  );
}
