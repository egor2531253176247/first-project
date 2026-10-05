import { PageHeading } from "@/components/ui";
export const metadata = {
  alternates: process.env.STUDIO_URL ? { canonical: "/cookies" } : {},
  title: "Cookie Policy",
};
export default function Cookies() {
  return (
    <>
      <PageHeading label="LEGAL / COOKIES" title="YOUR CHOICE. RESPECTED." />
      <section className="container section" style={{ paddingTop: 0 }}>
        <div className="prose">
          <h2>Необходимые файлы</h2>
          <p>
            precision_session — защищённый HttpOnly-сеанс кабинета, срок до 7
            дней. Он нужен для входа и не доступен JavaScript. Выбор настроек
            хранится локально в вашем браузере.
          </p>
          <h2>Аналитика</h2>
          <p>
            При подключении аналитики она может работать только после вашего
            согласия. Отклонение аналитики не мешает просмотру сайта, расчёту
            стоимости или записи.
          </p>
          <h2>Как изменить выбор</h2>
          <p>
            Нажмите «Cookies» в подвале сайта и сохраните новые настройки. Для
            удаления текущего сеанса выйдите из кабинета; локальные настройки
            можно удалить в браузере.
          </p>
        </div>
      </section>
    </>
  );
}
