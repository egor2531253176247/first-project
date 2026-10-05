import { getCatalog } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { QuoteForm } from "@/components/quote-form";
import { PageHeading } from "@/components/ui";
import { configurationSchema } from "@/lib/validation";
export const metadata = {
  alternates: process.env.STUDIO_URL ? { canonical: "/quote" } : {},
  title: "Рассчитать проект",
};
export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const value = (key: string) =>
    typeof query[key] === "string" ? (query[key] as string) : undefined;
  const parsed = configurationSchema
    .partial()
    .safeParse({
      vehicle: value("vehicle"),
      body: value("body"),
      service: value("service"),
      finish: value("finish"),
      color: value("color"),
      extras: value("extras")?.split(",").filter(Boolean),
      ppfPackage: value("ppfPackage"),
    });
  const user = await currentUser();
  return (
    <>
      <PageHeading
        label="LET’S BUILD SOMETHING"
        title="START YOUR PROJECT."
        description="Пять коротких шагов от идеи до точного плана. Предварительный расчёт меняется вместе с вашими пожеланиями."
      />
      <div className="container">
        <QuoteForm
          services={getCatalog().services}
          initial={parsed.success ? parsed.data : {}}
          user={user ? { name: user.name, email: user.email } : null}
        />
      </div>
    </>
  );
}
