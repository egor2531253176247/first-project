import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db, getCatalog, leadsFor } from "@/lib/db";
import { Admin } from "@/components/admin";
import { Logout } from "@/components/account";
import { PageHeading } from "@/components/ui";
export const metadata = {
  title: "Управление студией",
  robots: { index: false, follow: false },
};
export default async function AdminPage() {
  const user = await currentUser();
  if (!user) redirect("/account");
  if (user.role !== "admin") redirect("/dashboard");
  const initial = {
    catalog: getCatalog(),
    leads: leadsFor(),
    bookings: db()
      .prepare("SELECT * FROM bookings ORDER BY date,time")
      .all()
      .map((row) => ({ ...row })) as {
      id: string;
      lead_id: string;
      date: string;
      time: string;
      status: string;
    }[],
    clients: db()
      .prepare("SELECT id,name,email,role FROM users")
      .all()
      .map((row) => ({ ...row })) as {
      id: string;
      name: string;
      email: string;
      role: string;
    }[],
    events: db()
      .prepare(
        "SELECT id,kind,status,created_at FROM events ORDER BY created_at DESC LIMIT 50",
      )
      .all()
      .map((row) => ({ ...row })) as {
      id: string;
      kind: string;
      status: string;
      created_at: string;
    }[],
  };
  return (
    <>
      <PageHeading label="STUDIO CONTROL" title="THE CONTROL ROOM." />
      <section className="container section" style={{ paddingTop: 0 }}>
        <div className="account-top">
          <h2>Управление студией</h2>
          <Logout />
        </div>
        <Admin initial={initial} />
      </section>
    </>
  );
}
