import nodemailer from "nodemailer";
import { db, queueEvent } from "./db";
export async function sendConfirmation(
  email: string,
  name: string,
  reference: string,
  description: string,
) {
  const id = queueEvent("EMAIL_CONFIRMATION", {
    email,
    name,
    reference,
    description,
  });
  if (
    !process.env.STUDIO_MAIL_KEY &&
    (!process.env.SMTP_HOST || !process.env.SMTP_FROM)
  )
    return false;
  try {
    if (process.env.STUDIO_MAIL_KEY) {
      if (!process.env.STUDIO_MAIL_FROM) return false;
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.STUDIO_MAIL_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.STUDIO_MAIL_FROM,
          to: [email],
          subject: `PRECISION / ${reference}`,
          text: `${name}, заявка ${reference} сохранена.\n${description}\nСмета и начало работ согласовываются со студией.`,
        }),
        signal: AbortSignal.timeout(10000),
      });
      db()
        .prepare("UPDATE events SET status=? WHERE id=?")
        .run(response.ok ? "SENT" : "FAILED", id);
      return response.ok;
    }
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: process.env.SMTP_SECURE !== "false",
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
    });
    await transport.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: `PRECISION / ${reference}`,
      text: `${name}, заявка ${reference} сохранена.\n${description}\nСмета и начало работ согласовываются со студией.`,
    });
    db().prepare("UPDATE events SET status=? WHERE id=?").run("SENT", id);
    return true;
  } catch {
    db().prepare("UPDATE events SET status=? WHERE id=?").run("FAILED", id);
    return false;
  }
}
export async function crmEvent(payload: unknown) {
  const id = queueEvent("CRM_LEAD", payload);
  if (!process.env.CRM_WEBHOOK_URL) return;
  try {
    const url = new URL(process.env.CRM_WEBHOOK_URL);
    if (url.protocol !== "https:") return;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.CRM_WEBHOOK_TOKEN
          ? { Authorization: `Bearer ${process.env.CRM_WEBHOOK_TOKEN}` }
          : {}),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
    db()
      .prepare("UPDATE events SET status=? WHERE id=?")
      .run(response.ok ? "SENT" : "FAILED", id);
  } catch {
    db().prepare("UPDATE events SET status=? WHERE id=?").run("FAILED", id);
  }
}
