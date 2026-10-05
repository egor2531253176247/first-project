"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Arrow, Button } from "./ui";
export function Hero({ servicesCount = 9 }: { servicesCount?: number }) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const canPlay = () => !media.matches && window.innerWidth > 800;
    const element = video.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && canPlay())
        void element.play().catch(() => {});
      else element.pause();
    });
    observer.observe(element);
    const change = () => {
      if (!canPlay()) element.pause();
    };
    media.addEventListener("change", change);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", change);
    };
  }, []);
  return (
    <section className="hero">
      <div className="hero-media">
        <Image
          src="/images/hero.webp"
          alt="Porsche 911 GT3 RS, точность в каждой детали"
          fill
          priority
          sizes="100vw"
        />
        <video
          ref={video}
          muted
          loop
          playsInline
          preload="none"
          poster="/images/hero.webp"
          aria-hidden="true"
        >
          <source src="/video/showreel.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="container hero-content">
        <p className="technical hero-kicker">
          <span className="status-dot" /> AUTOMOTIVE PERFORMANCE STUDIO
        </p>
        <h1>
          PERFORMANCE
          <br />
          IN EVERY
          <br />
          <span className="outline">DETAIL.</span>
        </h1>
        <p className="hero-subtitle">PPF · WRAP · PAINT · DETAILING</p>
        <div className="hero-actions">
          <Button href="/quote">Рассчитать проект</Button>
          <Link href="/projects" className="text-link">
            Наши проекты <Arrow />
          </Link>
        </div>
      </div>
      <span className="hero-side">PRECISION IS A STANDARD. NOT AN OPTION.</span>
      <div className="container hero-bottom">
        <div className="hero-stats">
          <div>
            <strong>{String(servicesCount).padStart(2, "0")}</strong>
            <p className="technical">НАПРАВЛЕНИЙ</p>
          </div>
          <div>
            <strong>03</strong>
            <p className="technical">ПАКЕТА ЗАЩИТЫ</p>
          </div>
          <div>
            <strong>01</strong>
            <p className="technical">СТАНДАРТ — ТОЧНОСТЬ</p>
          </div>
        </div>
        <a href="#showreel" className="scroll-hint technical">
          <span>SCROLL TO EXPLORE</span>
          <span>
            <svg
              width="16"
              height="24"
              viewBox="0 0 16 24"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path d="M8 1v21m-5-5 5 5 5-5" />
            </svg>
          </span>
        </a>
      </div>
    </section>
  );
}
