import Link from "next/link";
import Image from "next/image";
import { articles } from "@/lib/catalog";
import { PageHeading, Label, Arrow } from "@/components/ui";
export const metadata = {
  alternates: process.env.STUDIO_URL ? { canonical: "/blog" } : {},
  title: "Журнал",
};
export default function BlogPage() {
  return (
    <>
      <PageHeading
        label="THE JOURNAL"
        title="KNOW YOUR DETAILS."
        description="Материалы, защита и уход. Разбираем вопросы, которые стоит задать до начала проекта."
      />
      <section className="container section" style={{ paddingTop: 0 }}>
        <div className="portfolio-grid">
          {articles.map((article) => (
            <Link
              className="article-preview"
              href={"/blog/" + article.slug}
              key={article.slug}
            >
              <div className="article-image" style={{ height: 320 }}>
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  sizes="(max-width:800px) 100vw, 45vw"
                />
              </div>
              <Label>
                {article.category} / {article.read}
              </Label>
              <h3>{article.title}</h3>
              <span className="text-link">
                Читать <Arrow />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
