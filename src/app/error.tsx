"use client";
import { PageHeading } from "@/components/ui";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <>
      <PageHeading
        label="TEMPORARY STOP"
        title="A QUICK PIT STOP."
        description="Не удалось загрузить страницу. Попробуйте ещё раз."
      />
      <div className="container section">
        <button className="button" onClick={reset}>
          Повторить
        </button>
      </div>
    </>
  );
}
