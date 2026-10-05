import { defineConfig } from "@playwright/test";
import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const directory =
  process.env.STUDIO_BROWSER_DATA ||
  mkdtempSync(join(tmpdir(), "precision-browser-"));
process.env.STUDIO_BROWSER_DATA = directory;
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  outputDir: "playwright-results",
  use: {
    baseURL: "http://127.0.0.1:3101",
    viewport: { width: 1440, height: 1000 },
    headless: true,
    trace: "retain-on-failure",
    launchOptions: {
      ...(existsSync("/usr/bin/chromium")
        ? { executablePath: "/usr/bin/chromium" }
        : {}),
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    },
  },
  webServer: {
    command:
      "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3101",
    url: "http://127.0.0.1:3101/api/health",
    reuseExistingServer: false,
    timeout: 30000,
    env: {
      STUDIO_DATA_DIR: directory,
      STUDIO_COOKIE_SECURE: "false",
      STUDIO_URL: "http://127.0.0.1:3101",
      SMTP_HOST: "",
      STUDIO_MAIL_KEY: "",
      CRM_WEBHOOK_URL: "",
      STUDIO_AI_KEY: "",
    },
  },
});
