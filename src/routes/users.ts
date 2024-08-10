import { Elysia, t } from "elysia";
import { Database } from "bun:sqlite";

export function usersRoutes(
  db: Database,
  pwd: typeof import("bun").password
): Elysia {
  return new Elysia()
    .get("/users", () => {
      const users = db.query("SELECT id, username, name FROM users").all();
      return users;
    })
    .post("/users", async ({ body }) => {
      const { username, password, name, role } = body as {
        username: string;
        password: string;
        name: string;
        role: string;
      };

      // TODO: Hash password dengan aman sebelum menyimpannya ke database
      const hashedPassword = await pwd.hash(password);
      db.run(
        "INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)",
        [
          username,
          hashedPassword, // Ganti dengan password yang sudah di-hash
          name,
          role,
        ]
      );
      return { message: "User created successfully" };
    })
    .put("/users/:id", async ({ params, body }) => {
      const { id } = params as { id: string };
      const { username, password, name, role } = body as {
        username?: string;
        password?: string;
        name?: string;
        role?: string;
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
      if (role) {
        updates.push("role = ?");
        values.push(role);
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
    });
}
