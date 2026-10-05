import { z } from "zod";
const text = (max = 100) => z.string().trim().max(max);
export const configurationSchema = z.object({
  vehicle: text(120).min(2),
  body: z.enum(["coupe", "sedan", "suv"]),
  service: text(30).min(1),
  finish: z.enum([
    "Gloss",
    "Satin",
    "Matte",
    "Metallic",
    "Color shift",
    "Carbon",
  ]),
  color: text(60).min(1),
  extras: z.array(z.enum(["antichrome", "roof", "mirrors"])).max(3),
  ppfPackage: z.enum(["front", "track", "full"]).optional(),
});
export const leadSchema = z.object({
  name: text(100).min(2, "Укажите имя"),
  email: z.email("Укажите корректный email").max(200),
  phone: text(30).regex(/^\+?[\d\s()\-]{7,25}$/, "Укажите корректный телефон"),
  messenger: text(100).optional(),
  brand: text(40).min(1),
  model: text(80).min(1),
  year: z.coerce
    .number()
    .int()
    .min(1950)
    .max(new Date().getFullYear() + 1),
  configuration: configurationSchema,
  notes: text(2000).optional(),
  photos: z
    .array(z.string().regex(/^[a-f0-9-]{36}\.webp$/))
    .max(5)
    .default([]),
  consent: z.literal(true),
  website: text(0).optional(),
});
export const bookingSchema = leadSchema.extend({
  date: text(10),
  time: z.enum(["10:00", "12:00", "14:00", "16:00"]),
});
const safeImage = z
  .string()
  .regex(
    /^(?:\/images\/[a-zA-Z0-9_.-]+\.(?:webp|avif|png|jpg|jpeg)|\/api\/assets\/[a-f0-9-]{36}\.webp)$/,
  );
export const catalogSchema = z
  .object({
    services: z
      .array(
        z.object({
          id: text(30).regex(/^[a-z0-9-]+$/),
          name: text(60).min(1),
          title: text(100).min(1),
          description: text(1000),
          price: z.number().int().min(0).max(10000000),
          days: z.number().int().min(1).max(60),
          material: text(150),
          image: safeImage,
          features: z.array(text(200)).max(10),
        }),
      )
      .min(1)
      .max(30),
    projects: z
      .array(
        z.object({
          id: text(30).min(1),
          slug: text(100).regex(/^[a-z0-9-]+$/),
          title: text(100).min(1),
          brand: text(50),
          service: text(30),
          color: text(60),
          body: text(50),
          image: safeImage,
          gallery: z.array(safeImage).max(20),
          material: text(150),
          duration: text(50),
          story: text(5000),
          demo: z.boolean(),
        }),
      )
      .max(100),
    materials: z
      .array(
        z.object({
          id: text(30),
          name: text(80),
          category: text(80),
          description: text(1000),
        }),
      )
      .max(50),
    reviews: z
      .array(
        z.object({
          id: text(30),
          name: text(100),
          car: text(100),
          text: text(2000),
          rating: z.number().int().min(1).max(5),
        }),
      )
      .max(100),
    settings: z.object({
      name: text(50).min(1),
      phone: text(30).refine((v) => !v || /^\+?[\d\s()\-]{7,25}$/.test(v)),
      email: text(200).refine((v) => !v || z.email().safeParse(v).success),
      address: text(250),
      hours: text(150),
      telegram: text(200),
      whatsapp: text(200),
      instagram: text(200),
      youtube: text(200),
      about: text(3000),
    }),
  })
  .superRefine((catalog, ctx) => {
    for (const key of ["services", "projects", "materials", "reviews"] as const)
      if (new Set(catalog[key].map((x) => x.id)).size !== catalog[key].length)
        ctx.addIssue({
          code: "custom",
          message: "ID должны быть уникальны",
          path: [key],
        });
    if (
      new Set(catalog.projects.map((x) => x.slug)).size !==
      catalog.projects.length
    )
      ctx.addIssue({
        code: "custom",
        message: "Адреса проектов должны быть уникальны",
        path: ["projects"],
      });
    if (
      catalog.projects.some(
        (x) => !catalog.services.some((s) => s.id === x.service),
      )
    )
      ctx.addIssue({
        code: "custom",
        message: "Услуга проекта должна существовать",
        path: ["projects"],
      });
    for (const key of ["telegram", "whatsapp", "instagram", "youtube"] as const)
      if (
        catalog.settings[key] &&
        !/^https:\/\/(?:t\.me|wa\.me|(?:www\.)?instagram\.com|(?:www\.)?youtube\.com)\/[a-zA-Z0-9_\-/?=&.]+$/.test(
          catalog.settings[key],
        )
      )
        ctx.addIssue({
          code: "custom",
          message: "Используйте HTTPS-ссылку на социальную сеть",
          path: ["settings", key],
        });
  });
