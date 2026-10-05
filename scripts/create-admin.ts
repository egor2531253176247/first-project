import { createInterface } from "node:readline/promises";
import { randomBytes, randomUUID, scryptSync } from "node:crypto";
import { stdin, stdout } from "node:process";
import { db } from "../src/lib/db.ts";
async function hiddenPassword(): Promise<string> {
  if (!stdin.isTTY)
    throw new Error("Запустите команду в интерактивном терминале.");
  stdout.write("Пароль (минимум 12 символов, ввод скрыт): ");
  stdin.setRawMode(true);
  stdin.resume();
  return new Promise((resolve, reject) => {
    let value = "";
    function done() {
      stdin.setRawMode(false);
      stdin.off("data", input);
      stdin.pause();
      stdout.write("\n");
    }
    function input(chunk: Buffer) {
      for (const char of chunk.toString()) {
        if (char === "\u0003") {
          done();
          reject(new Error("Отменено"));
          return;
        }
        if (char === "\r" || char === "\n") {
          done();
          resolve(value);
          return;
        }
        if (char === "\u007f" || char === "\b") value = value.slice(0, -1);
        else if (char >= " ") value += char;
      }
    }
    stdin.on("data", input);
  });
}
try {
  const rl = createInterface({ input: stdin, output: stdout });
  const email = (await rl.question("Email администратора: "))
    .trim()
    .toLowerCase();
  const name = (await rl.question("Имя: ")).trim();
  rl.close();
  const password = await hiddenPassword();
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    name.length < 2 ||
    password.length < 12
  )
    throw new Error("Проверьте email, имя и длину пароля.");
  if (db().prepare("SELECT id FROM users WHERE email=?").get(email))
    throw new Error("Аккаунт уже существует. Используйте новый email.");
  const salt = randomBytes(16).toString("hex");
  const hash = salt + ":" + scryptSync(password, salt, 64).toString("hex");
  db()
    .prepare(
      "INSERT INTO users(id,email,name,password,role,created_at) VALUES(?,?,?,?,'admin',?)",
    )
    .run(randomUUID(), email, name, hash, new Date().toISOString());
  stdout.write("Администратор создан. Войдите через /account.\n");
} catch (error) {
  process.stderr.write(
    (error instanceof Error
      ? error.message
      : "Ошибка создания администратора") + "\n",
  );
  process.exitCode = 1;
}
