import { notFound } from "next/navigation";
import Image from "next/image";
import { articles } from "@/lib/catalog";
import { PageHeading, Label, Button, Breadcrumb } from "@/components/ui";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  return {
    title: article?.title || "Журнал",
    description: article?.paragraphs[0],
    alternates: process.env.STUDIO_URL ? { canonical: `/blog/${slug}` } : {},
  };
}
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();
  return (
    <>
      <PageHeading
        label={`${article.category} / ${article.read}`}
        title={article.title}
      />
      <div className="container">
        <Breadcrumb
          items={[{ label: "Журнал", href: "/blog" }, { label: article.title }]}
        />
        <div className="detail-hero">
          <Image
            src={article.image}
            alt={article.title}
            fill
            priority
            sizes="90vw"
          />
        </div>
      </div>
      <section className="container section">
        <article className="article-body">
          <Label>PRECISION / THE JOURNAL</Label>
          {article.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <h2>Решение начинается с осмотра.</h2>
          <p>
            Расскажите о вашем автомобиле и режиме эксплуатации — подберём
            защиту под вашу задачу.
          </p>
          <Button href="/quote">Обсудить проект</Button>
        </article>
      </section>
    </>
  );
}
