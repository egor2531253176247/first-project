import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db, leadsFor } from "@/lib/db";
import { Dashboard } from "@/components/dashboard";
import { Logout } from "@/components/account";
import { PageHeading } from "@/components/ui";
export const metadata = {
  title: "Мой кабинет",
  robots: { index: false, follow: false },
};
export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/account");
  const leads = leadsFor(user.id);
  const bookings = db()
    .prepare(
      "SELECT bookings.* FROM bookings JOIN leads ON leads.id=bookings.lead_id WHERE leads.user_id=?",
    )
    .all(user.id)
    .map((row) => ({ ...row })) as {
    id: string;
    lead_id: string;
    date: string;
    time: string;
    status: string;
  }[];
  return (
    <>
      <PageHeading label="CUSTOMER DASHBOARD" title="YOUR PRIVATE GARAGE." />
      <section className="container section" style={{ paddingTop: 0 }}>
        <div className="account-top">
          <h2>{user.name}</h2>
          <Logout />
        </div>
        <Dashboard leads={leads} bookings={bookings} />
      </section>
    </>
  );
}
