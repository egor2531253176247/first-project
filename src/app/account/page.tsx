import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { PageHeading } from "@/components/ui";
import { AccountForm } from "@/components/account";
export const metadata = {
  title: "Вход в кабинет",
  robots: { index: false, follow: false },
};
export default async function AccountPage() {
  const user = await currentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/dashboard");
  return (
    <>
      <PageHeading
        label="CUSTOMER ACCESS"
        title="YOUR PRIVATE GARAGE."
        description="Автомобили, статус проектов, документы и рекомендации — в одном месте."
      />
      <section className="container section" style={{ paddingTop: 0 }}>
        <AccountForm />
      </section>
    </>
  );
}
