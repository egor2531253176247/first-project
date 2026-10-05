import { PageHeading, Button } from "@/components/ui";
export default function NotFound() {
  return (
    <>
      <PageHeading
        label="404 / OFF THE TRACK"
        title="LET’S GET BACK ON TRACK."
        description="Такой страницы нет. Вернёмся к проектам?"
      />
      <div className="container section" style={{ paddingTop: 0 }}>
        <Button href="/projects">Смотреть проекты</Button>
      </div>
    </>
  );
}
