"use client";
import { useState } from "react";
import type { Review } from "@/lib/catalog";
import { Label } from "./ui";
export function Testimonials({ reviews }: { reviews: Review[] }) {
  const [index, setIndex] = useState(0);
  if (!reviews.length)
    return (
      <div className="testimonial">
        <Label>OUR STANDARD / NO SHORTCUTS</Label>
        <blockquote>
          «Результат должен выглядеть безупречно. Даже там, куда вы не смотрите
          каждый день.»
        </blockquote>
        <p className="technical muted">ФИЛОСОФИЯ PRECISION</p>
      </div>
    );
  const review = reviews[index % reviews.length];
  return (
    <div className="testimonial">
      <span className="accent" aria-label={`${review.rating} из 5`}>
        {"★".repeat(review.rating)}
      </span>
      <blockquote>«{review.text}»</blockquote>
      <div className="testimonial-meta">
        <span className="technical">{review.name}</span>
        <span className="technical muted">{review.car}</span>
      </div>
      {reviews.length > 1 && (
        <div className="testimonial-controls">
          <button
            aria-label="Предыдущий отзыв"
            onClick={() =>
              setIndex((index - 1 + reviews.length) % reviews.length)
            }
          >
            ←
          </button>
          <button
            aria-label="Следующий отзыв"
            onClick={() => setIndex((index + 1) % reviews.length)}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
