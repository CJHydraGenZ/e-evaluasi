import { Elysia } from "elysia";
import { Database } from "bun:sqlite";
import { password as pwd } from "bun";

import { jwt } from "@elysiajs/jwt";
import { authRoutes } from "./routes/auth";
import { usersRoutes } from "./routes/users";
import { evaluasiRoutes } from "./routes/evaluasi";
const db = new Database("db.sqlite");

// Membuat tabel jika belu

// ... (kode endpoint lainnya tetap sama)
db.run(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )
`);

// Membuat tabel users jika belum ada
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL
  )
`);

// ... (kode lainnya tetap sama)

// Membuat tabel 'evaluasi' jika belum ada
db.run(`
  CREATE TABLE IF NOT EXISTS evaluasi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tanggal DATE NOT NULL,
    kegiatan TEXT NOT NULL,
    kuantitas INTEGER NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    verifikasi TEXT NOT NULL
  )
`);
const app = new Elysia()

  .get("/", () => "Hallo bun")
  .use(authRoutes(db, pwd))
  .use(usersRoutes(db, pwd))
  .use(evaluasiRoutes(db))
  .listen(3000);

console.log("Server listening on port 3000");
