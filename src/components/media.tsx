"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { Label, Play, CompareIcon } from "./ui";
export function Showreel() {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  return (
    <section className="showreel container" id="showreel">
      <div className="showreel-header">
        <Label>
          <span className="accent">01</span> / THE WAY WE SEE IT
        </Label>
        <span className="technical muted">CONCEPT FILM / 00:18</span>
      </div>
      <button
        className="showreel-trigger"
        aria-label="Смотреть автомобильный шоу-рил"
        onClick={() => {
          dialog.current?.showModal();
          void video.current?.play();
        }}
      >
        <Image
          src="/images/hero.webp"
          alt="Крупный план антикрыла Porsche 911 GT3 RS"
          fill
          sizes="(max-width: 800px) 100vw, 90vw"
        />
        <span className="showreel-title">
          PRECISION
          <br />
          IN MOTION.
        </span>
        <span className="play-circle">
          <Play />
          <span>PLAY</span>
        </span>
        <span className="technical showreel-caption">
          AUTOMOTIVE CONCEPT / SHOWREEL
        </span>
      </button>
      <dialog
        className="video-dialog"
        ref={dialog}
        onClose={() => video.current?.pause()}
      >
        <button
          className="icon-button"
          aria-label="Закрыть видео"
          onClick={() => dialog.current?.close()}
        >
          ×
        </button>
        <video
          ref={video}
          src="/video/showreel.mp4"
          poster="/images/hero.webp"
          controls
          playsInline
          preload="none"
        />
      </dialog>
    </section>
  );
}
export function BeforeAfter() {
  const [value, setValue] = useState(50);
  const [caseIndex, setCaseIndex] = useState(0);
  const cases = [
    { name: "PAINT CORRECTION", image: "/images/porsche.webp" },
    { name: "COLOR & CONTRAST", image: "/images/taycan.webp" },
  ];
  return (
    <div>
      <div className="comparison-tabs">
        {cases.map((x, i) => (
          <button
            key={x.name}
            className={caseIndex === i ? "active" : ""}
            onClick={() => setCaseIndex(i)}
          >
            {x.name}
          </button>
        ))}
      </div>
      <div className="comparison">
        <Image
          src={cases[caseIndex].image}
          alt="Визуальная концепция покрытия после обработки"
          fill
          sizes="(max-width:800px) 100vw, 90vw"
        />
        <div
          className="comparison-before"
          style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}
        >
          <Image
            src={cases[caseIndex].image}
            alt="Симуляция покрытия до обработки"
            fill
            sizes="(max-width:800px) 100vw, 90vw"
            className={caseIndex ? "desaturated" : "uncorrected"}
          />
          {!caseIndex && <div className="scratch-overlay" />}
        </div>
        <span className="comparison-label before">BEFORE</span>
        <span className="comparison-label after">AFTER</span>
        <div className="comparison-handle" style={{ left: `${value}%` }}>
          <span>
            <CompareIcon />
          </span>
        </div>
        <input
          type="range"
          min="2"
          max="98"
          value={value}
          onChange={(e) => setValue(+e.target.value)}
          aria-label="Сравнить покрытие до и после"
        />
      </div>
      <p className="fine-print">
        Визуальная демонстрация эффекта обработки, не фотографии выполненного
        заказа.
      </p>
    </div>
  );
}
export function Gallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <div className="project-gallery">
        {images.map((image, i) => (
          <button
            className={i === 0 ? "gallery-wide" : ""}
            key={i}
            onClick={() => {
              setActive(i);
              dialog.current?.showModal();
            }}
            aria-label={`Открыть фото ${i + 1}`}
          >
            <Image
              src={image}
              alt={`${title}, деталь ${i + 1}`}
              width={1600}
              height={1000}
              sizes="(max-width:800px) 100vw, 80vw"
            />
            <span className="gallery-expand">↗</span>
          </button>
        ))}
      </div>
      <dialog className="gallery-dialog" ref={dialog}>
        <button
          className="icon-button"
          onClick={() => dialog.current?.close()}
          aria-label="Закрыть фото"
        >
          ×
        </button>
        <Image src={images[active]} alt={title} width={1920} height={1200} />
        <div className="gallery-controls">
          <button
            onClick={() =>
              setActive((active - 1 + images.length) % images.length)
            }
          >
            ← Предыдущее
          </button>
          <span>
            {active + 1} / {images.length}
          </span>
          <button onClick={() => setActive((active + 1) % images.length)}>
            Следующее →
          </button>
        </div>
      </dialog>
    </>
  );
}
