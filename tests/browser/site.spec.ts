import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { randomBytes, randomUUID, scryptSync } from "node:crypto";
import { join } from "node:path";
import { studioDate, validBookingDate } from "../../src/lib/calculator";
const artifacts = "/workspace/precision-preview";
test.beforeEach(async ({ page }, testInfo) => {
  if (testInfo.title.startsWith("cookie")) return;
  await page.addInitScript(() => {
    localStorage.setItem(
      "precision-consent",
      JSON.stringify({ necessary: true, analytics: false }),
    );
  });
});
test("home, imagery, comparison, keyboard focus and screenshot", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "PERFORMANCEIN EVERYDETAIL.",
  );
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".hero-media img")).toBeVisible();
  await page
    .locator(".hero-media img")
    .evaluate((image) => (image as HTMLImageElement).decode());
  await page.keyboard.press("Tab");
  await expect(page.getByText("Перейти к содержимому")).toBeFocused();
  await page.keyboard.press("Enter");
  await page.evaluate(() => window.scrollTo(0, 0));
  mkdirSync(artifacts, { recursive: true });
  await page.screenshot({
    path: artifacts + "/desktop.png",
    animations: "disabled",
  });
  await page
    .getByRole("button", { name: "Смотреть автомобильный шоу-рил" })
    .click();
  await expect(page.locator(".video-dialog")).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator(".video-dialog video")
        .evaluate((video) => (video as HTMLVideoElement).currentTime),
    )
    .toBeGreaterThan(0);
  await page.keyboard.press("Escape");
  await expect(page.locator(".video-dialog")).not.toBeVisible();
  const slider = page.getByRole("slider", {
    name: "Сравнить покрытие до и после",
  });
  await slider.focus();
  await slider.press("Home");
  await slider.press("ArrowRight");
  await expect(slider).toHaveValue("3");
  await expect(page.locator(".comparison-before")).toHaveAttribute(
    "style",
    /97%/,
  );
  await expect(page.locator("img").filter({ visible: true })).not.toHaveCount(
    0,
  );
  expect(errors).toEqual([]);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});
test("portfolio filters and project route", async ({ page }) => {
  await page.goto("/projects");
  await expect(page.locator(".portfolio-grid .project-card")).toHaveCount(4);
  await page.getByRole("button", { name: "WRAP", exact: true }).click();
  await expect(page.locator(".portfolio-grid .project-card")).toHaveCount(1);
  await page.getByRole("button", { name: /ФИЛЬТРЫ/ }).click();
  await page.getByLabel("Кузов").selectOption("Купе");
  await expect(page.getByText("ПРОЕКТЫ НЕ НАЙДЕНЫ")).toBeVisible();
  await page.getByRole("button", { name: /Сбросить фильтры/ }).click();
  await page.locator(".project-card").first().click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "PORSCHE 911 TURBO S",
  );
  await page.getByRole("button", { name: "Открыть фото 1" }).click();
  await expect(page.locator(".gallery-dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".gallery-dialog")).not.toBeVisible();
});
test("configurator price, real body color and quote prefill", async ({
  page,
}) => {
  await page.goto("/configurator");
  await expect(page.locator(".configurator .estimate-row strong")).toHaveText(
    "180 000 ₽",
  );
  const paint = page.locator(".configurator .car-model linearGradient").first();
  const before = await paint.locator("stop").first().getAttribute("stop-color");
  await page.getByRole("button", { name: "Racing Red", exact: true }).click();
  expect(
    await paint.locator("stop").first().getAttribute("stop-color"),
  ).not.toBe(before);
  await page.getByRole("checkbox", { name: /Антихром/ }).check();
  await expect(page.locator(".configurator .estimate-row strong")).toHaveText(
    "215 000 ₽",
  );
  await page.getByRole("link", { name: /Получить точный расчёт/ }).click();
  await expect(page.getByLabel("Марка")).toHaveValue("BMW");
  await expect(page.getByLabel("Модель")).toHaveValue("M4 Competition");
  await expect(page.locator(".quote-summary .estimate-row strong")).toHaveText(
    "215 000 ₽",
  );
});
test("PPF map responds to package and zone selection", async ({ page }) => {
  await page.goto("/services/ppf");
  await page.getByRole("button", { name: /FRONT PACKAGE/ }).click();
  await expect(page.locator(".ppf-selector .estimate-row strong")).toHaveText(
    "85 000 ₽",
  );
  await page
    .locator(".coverage-list")
    .getByRole("button", { name: /Крыша/ })
    .click();
  await expect(page.locator(".zone-caption")).toContainText("ВНЕ ПАКЕТА");
  await page.getByRole("button", { name: /FULL BODY/ }).click();
  await expect(page.locator(".zone-caption")).toContainText("ВКЛЮЧЕНО");
});
test("five-step quote, validation and server confirmation", async ({
  page,
}) => {
  await page.goto("/quote");
  await page.getByLabel("Марка").fill("BMW");
  await page.getByLabel("Модель").fill("M4");
  await page.getByRole("button", { name: "Далее" }).click();
  await page.getByRole("button", { name: "Оклейка винилом" }).click();
  await page.getByRole("button", { name: "Далее" }).click();
  await page.getByLabel("Пожелания").fill("Browser test project");
  await page.getByRole("button", { name: "Далее" }).click();
  await page
    .locator("input[type=file]")
    .setInputFiles("public/images/hero.webp");
  await expect(page.locator(".photo-previews img")).toHaveCount(1);
  await page.getByRole("button", { name: "Продолжить" }).click();
  await page.getByLabel("Имя", { exact: false }).fill("Browser customer");
  await page.getByLabel("Телефон").fill("invalid");
  await page.getByLabel("Email").fill("browser-test@example.invalid");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /Получить расчёт/ }).click();
  await expect(page.locator(".quote-card").getByRole("alert")).toContainText(
    "телефон",
  );
  await page.getByLabel("Телефон").fill("+79991112233");
  await page.getByRole("button", { name: /Получить расчёт/ }).click();
  await expect(page.getByText("YOUR PROJECTSTARTS HERE.")).toBeVisible();
  await expect(
    page.getByText(/Email-подтверждение пока недоступно/),
  ).toBeVisible();
});
test("online booking confirmation", async ({ page }) => {
  await page.goto("/booking");
  await page.getByLabel("Марка").fill("Porsche");
  await page.getByLabel("Модель").fill("911");
  let date = "";
  for (let i = 1; i <= 10; i++) {
    const candidate = studioDate(new Date(Date.now() + i * 86400000));
    if (validBookingDate(candidate)) {
      date = candidate;
      break;
    }
  }
  await page.getByLabel("Дата визита").fill(date);
  await page.getByRole("button", { name: "12:00", exact: true }).click();
  await page.getByLabel("Имя").fill("Booking browser");
  await page.getByLabel("Телефон").fill("+79992223344");
  await page.getByLabel("Email").fill("booking-browser@example.invalid");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /Записаться/, exact: false }).click();
  await expect(page.getByText("SEE YOUAT THE STUDIO.")).toBeVisible();
});
test("customer registration, empty cabinet and sign-out", async ({ page }) => {
  await page.goto("/account");
  await page.getByRole("button", { name: "Регистрация" }).click();
  await page.getByLabel("Имя").fill("Garage customer");
  await page.getByLabel("Email").fill("garage-browser@example.invalid");
  await page.getByLabel("Пароль").fill("Browser-Only-Test-Password-2026");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /Создать кабинет/ }).click();
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByText("Активных проектов пока нет.")).toBeVisible();
  await page.getByRole("button", { name: /Выйти/ }).click();
  await expect(page).toHaveURL(/account/);
});
test("cookie rejection persists and preferences reopen", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.removeItem("precision-consent");
  });
  await page.reload();
  await expect(
    page.getByRole("complementary", { name: "Настройки файлов cookie" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Отклонить" }).click();
  await expect(
    page.getByRole("complementary", { name: "Настройки файлов cookie" }),
  ).not.toBeVisible();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("precision-consent")!).analytics,
    ),
  ).toBe(false);
  await page
    .locator(".footer-bottom")
    .getByRole("button", { name: "Cookies" })
    .click();
  await expect(page.getByText("Необходимые", { exact: false })).toBeVisible();
});
test.describe("Mobile", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  test("mobile menu, sticky CTA, touch comparison and no horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: artifacts + "/mobile.png",
      animations: "disabled",
    });
    await expect(page.locator(".mobile-sticky-cta")).toBeVisible();
    const slider = page.getByRole("slider", {
      name: "Сравнить покрытие до и после",
    });
    await slider.scrollIntoViewIfNeeded();
    const box = await slider.boundingBox();
    await page.touchscreen.tap(
      box!.x + box!.width * 0.75,
      box!.y + box!.height / 2,
    );
    await expect(slider).not.toHaveValue("50");
    await page.getByRole("button", { name: "Открыть меню" }).click();
    await expect(page.locator(".mobile-menu")).toBeVisible();
    await page
      .locator(".mobile-menu")
      .getByRole("link", { name: /Услуги/ })
      .click();
    await expect(page).toHaveURL(/services$/);
    await expect(page.locator(".mobile-menu")).not.toBeVisible();
    for (const route of ["/configurator", "/quote", "/projects", "/booking"]) {
      await page.goto(route);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth,
        ),
        route,
      ).toBe(false);
    }
    await page.locator(".mobile-sticky-cta").click();
    await expect(page).toHaveURL(/quote/);
  });
});

test("admin edits project progress, documents and catalog prices", async ({
  page,
}) => {
  const database = new DatabaseSync(
    join(process.env.STUDIO_BROWSER_DATA!, "studio.sqlite"),
  );
  const password = randomBytes(24).toString("hex");
  const salt = randomBytes(16).toString("hex");
  database
    .prepare(
      "INSERT INTO users(id,email,name,password,role,created_at) VALUES(?,?,?,?,'admin',?)",
    )
    .run(
      randomUUID(),
      "admin-browser@example.invalid",
      "Browser admin",
      salt + ":" + scryptSync(password, salt, 64).toString("hex"),
      new Date().toISOString(),
    );
  database.close();
  await page.goto("/account");
  await page.getByLabel("Email").fill("admin-browser@example.invalid");
  await page.getByLabel("Пароль").fill(password);
  await page.getByRole("button", { name: "Войти", exact: false }).click();
  await expect(page).toHaveURL(/admin$/);
  await page
    .locator(".admin-table tr")
    .filter({ hasText: "Browser customer" })
    .getByRole("button", { name: /Управлять/ })
    .click();
  await page.getByLabel("CRM-статус").selectOption("IN PROGRESS");
  await page.getByLabel("Этап работ").selectOption("INSTALLATION");
  await page.getByLabel("Согласованная стоимость").fill("198000");
  await page.getByLabel("Гарантия", { exact: true }).fill("Warranty recorded");
  await page.getByRole("button", { name: /Добавить документ/ }).click();
  await page.getByLabel("Название документа").fill("Согласованная смета");
  await page
    .getByLabel("Текст документа")
    .fill("Материал и стоимость согласованы.");
  await page.getByRole("button", { name: /Сохранить проект/ }).click();
  await expect(page.getByText("Изменения сохранены.")).toBeVisible();
  await expect(
    page.locator(".admin-table tr").filter({ hasText: "Browser customer" }),
  ).toContainText("INSTALLATION");
  await page.screenshot({ path: artifacts + "/admin.png", fullPage: true });
  await page
    .getByRole("button", { name: "Услуги / цены", exact: true })
    .click();
  await page
    .locator(".admin-table tr")
    .filter({ hasText: "Антигравийная защита" })
    .getByRole("button", { name: "Изменить" })
    .click();
  await page.getByLabel("Стоимость, ₽").fill("252000");
  await page
    .locator(".admin-editor")
    .getByRole("button", { name: /Сохранить/ })
    .click();
  await expect(page.getByText("Изменения сохранены.")).toBeVisible();
  await page.goto("/services/ppf");
  await expect(page.locator(".detail-summary .estimate-row strong")).toHaveText(
    "252 000 ₽",
  );
  const state = await (await page.request.get("/api/admin")).json();
  state.catalog.projects = state.catalog.projects.filter(
    (p: { service: string }) => !["ppf", "wrap"].includes(p.service),
  );
  state.catalog.services = state.catalog.services.filter(
    (s: { id: string }) => !["ppf", "wrap"].includes(s.id),
  );
  const updated = await page.request.patch("/api/admin", {
    data: { action: "catalog", catalog: state.catalog },
  });
  expect(updated.status()).toBe(200);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(".ppf-selector")).toHaveCount(0);
  await page.goto("/configurator");
  await expect(page.locator(".configurator .estimate-row strong")).toHaveText(
    "35 000 ₽",
  );
  await page.goto("/quote");
  await expect(page.locator(".quote-summary .estimate-row strong")).toHaveText(
    "35 000 ₽",
  );
});
