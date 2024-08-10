import { Elysia, t } from "elysia";
import { Database } from "bun:sqlite";
import { jwt } from "@elysiajs/jwt";

export const authRoutes = (db: Database, pwd: typeof import("bun").password) =>
  new Elysia()
    .use(
      jwt({
        name: "jwt",
        secret: process.env.JWT_SCRET as string,
      })
    )
    .post(
      "/login",

      async (context: any) => {
        try {
          const { username, password } = context.body;
          // console.log(context.body);

          if (!username || !password) {
            return new Response("Username and password are required", {
              status: 400,
            });
          }

          const user: any = db
            .query("SELECT * FROM users WHERE username = ?")
            .get(username);

          if (!user) {
            return new Response("Invalid username", { status: 401 });
          }

          const passwordMatch = await pwd.verify(password, user.password);
          // console.log(passwordMatch);

          if (!passwordMatch) {
            return new Response("Invalid password", { status: 401 });
          }
          context.cookie.auth.set({
            value: await context.jwt.sign({
              userId: user.id,
              role: user.role,
            }),
            httpOnly: true,
            maxAge: 7 * 86400,
            path: "/evaluasi",
          });

          const token = await context.jwt.sign({
            userId: user.id,
            role: user.role,
          });

          return new Response(JSON.stringify({ token }), {
            headers: {
              "Content-Type": "application/json",
            },
          });
        } catch (error) {
          console.error("Error during login:", error);
          return new Response("Internal Server Error", { status: 500 });
        }
      }
    );
