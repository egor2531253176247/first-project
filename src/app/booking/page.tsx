import { getCatalog } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { BookingForm } from "@/components/booking-form";
import { PageHeading } from "@/components/ui";
export const metadata = {
  alternates: process.env.STUDIO_URL ? { canonical: "/booking" } : {},
  title: "Онлайн-запись",
};
export default async function BookingPage() {
  const user = await currentUser();
  return (
    <>
      <PageHeading
        label="BOOK A VISIT"
        title="YOUR NEXT PIT STOP."
        description="Выберите удобное время для осмотра и консультации. Доступность слотов проверяется при сохранении записи."
      />
      <section className="container section" style={{ paddingTop: 0 }}>
        <BookingForm
          services={getCatalog().services}
          user={user ? { name: user.name, email: user.email } : null}
        />
      </section>
    </>
  );
}
