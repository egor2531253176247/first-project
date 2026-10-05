import { getCatalog } from "@/lib/db";
import { PageHeading, Label, Button } from "@/components/ui";
export const metadata = {
  alternates: process.env.STUDIO_URL ? { canonical: "/contact" } : {},
  title: "Контакты",
};
export default function ContactPage() {
  const { settings } = getCatalog();
  return (
    <>
      <PageHeading
        label="LET’S TALK"
        title="START WITH A CONVERSATION."
        description="Расскажите о вашем автомобиле и задаче. Подберём материалы, обсудим объём и согласуем следующий шаг."
      />
      <section className="container section" style={{ paddingTop: 0 }}>
        <div className="contact-grid">
          <div>
            {settings.phone && (
              <div className="contact-detail">
                <Label>PHONE</Label>
                <a href={"tel:" + settings.phone.replace(/[^+0-9]/g, "")}>
                  {settings.phone}
                </a>
              </div>
            )}
            {settings.email && (
              <div className="contact-detail">
                <Label>EMAIL</Label>
                <a href={"mailto:" + settings.email}>{settings.email}</a>
              </div>
            )}
            <div className="contact-detail">
              <Label>STUDIO / VISIT</Label>
              <p>{settings.address || "Визит по предварительной записи"}</p>
              <p className="fine-print">
                Время и детали визита согласовываем перед приездом.
              </p>
            </div>
            <div className="contact-detail">
              <Label>WORKING HOURS</Label>
              <p>{settings.hours}</p>
            </div>
            {(["telegram", "whatsapp", "instagram", "youtube"] as const)
              .filter((x) => settings[x])
              .map((x) => (
                <div className="contact-detail" key={x}>
                  <Label>{x}</Label>
                  <a target="_blank" rel="noreferrer" href={settings[x]}>
                    Написать / посмотреть ↗
                  </a>
                </div>
              ))}
          </div>
          <div className="booking-aside">
            <Label>YOUR NEXT MOVE</Label>
            <h2>
              FROM IDEA
              <br />
              TO IMPACT.
            </h2>
            <p className="form-note">
              Уже знаете, чего хотите? Соберите конфигурацию или отправьте
              фотографии автомобиля — так мы быстрее подготовим предварительный
              расчёт.
            </p>
            <Button href="/quote">Рассчитать проект</Button>
            <div style={{ marginTop: 18 }}>
              <Button href="/booking" secondary>
                Записаться на осмотр
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
