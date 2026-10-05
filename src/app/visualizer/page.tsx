import { PageHeading } from "@/components/ui";
import { Visualizer } from "@/components/visualizer";
export const metadata = {
  alternates: process.env.STUDIO_URL ? { canonical: "/visualizer" } : {},
  title: "AI Car Visualizer",
};
export default function VisualizerPage() {
  return (
    <>
      <PageHeading
        label="EXPERIMENTAL"
        title="IMAGINE THE POSSIBILITIES."
        description="Ваш автомобиль. Новый оттенок. Визуальная концепция перед выбором реального материала."
      />
      <section className="container section" style={{ paddingTop: 0 }}>
        <Visualizer />
      </section>
    </>
  );
}
