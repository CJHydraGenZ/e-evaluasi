import { Elysia } from "elysia";
import { Database } from "bun:sqlite";
import { password as pwd } from "bun";
const db = new Database("db.sqlite");

// Membuat tabel jika belu
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
    name TEXT NOT NULL
  )
`);
const app = new Elysia()
  .get("/items", () => {
    const items = db.query("SELECT * FROM items").all();
    return items;
  })
  .post("/items", ({ body }) => {
    const { name } = body as { name: string };
    db.run("INSERT INTO items (name) VALUES (?)", [name]);
    return { message: "Item created successfully" };
  })
  .get("/users", () => {
    const users = db.query("SELECT id, username, name FROM users").all();
    return users;
  })
  .post("/users", async ({ body }) => {
    const { username, password, name } = body as {
      username: string;
      password: string;
      name: string;
    };

    // TODO: Hash password dengan aman sebelum menyimpannya ke database
    const hashedPassword = await pwd.hash(password);
    db.run("INSERT INTO users (username, password, name) VALUES (?, ?, ?)", [
      username,
      hashedPassword, // Ganti dengan password yang sudah di-hash
      name,
    ]);
    return { message: "User created successfully" };
  })
  .put("/users/:id", async ({ params, body }) => {
    const { id } = params as { id: string };
    const { username, password, name } = body as {
      username?: string;
      password?: string;
      name?: string;
    };

    const updates = [];
    const values = [];

    if (username) {
      updates.push("username = ?");
      values.push(username);
    }

    if (password) {
      const hashedPassword = await pwd.hash(password);
      updates.push("password = ?");
      values.push(hashedPassword);
    }

    if (name) {
      updates.push("name = ?");
      values.push(name);
    }

    if (updates.length === 0) {
      return { message: "No fields to update" };
    }

    const query = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
    values.push(parseInt(id));

    db.run(query, values);
    return { message: "User updated successfully" };
  })

  .delete("/users/:id", ({ params }) => {
    const { id } = params as { id: string };
    db.run("DELETE FROM users WHERE id = ?", [parseInt(id)]);
    return { message: "User deleted successfully" };
  })
  .get("/users/:id", ({ params }) => {
    const { id } = params as { id: string };
    const user = db
      .query("SELECT id, username, name FROM users WHERE id = ?")
      .get(parseInt(id));
    if (!user) {
      return new Response("User not found", { status: 404 });
    }
    return user;
  })
  .get("/", () => "Hallo bun")
  .listen(3000);

console.log("Server listening on port 3000");
