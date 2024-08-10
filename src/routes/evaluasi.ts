import { Elysia, t } from "elysia";
import { Database } from "bun:sqlite";
import { jwt } from "@elysiajs/jwt";
export const evaluasiRoutes = (db: Database) =>
  new Elysia()
    .use(
      jwt({
        name: "jwt",
        secret: process.env.JWT_SCRET as string,
      })
    )
    .get("/evaluasi", async (context) => {
      try {
        // 1. Verifikasi token JWT (opsional, tergantung kebutuhan)
        const payload = await context.jwt.verify(context.cookie.auth?.value);

        if (!payload || payload.role !== "pegawai") {
          // Atau sesuaikan dengan peran yang diizinkan
          return new Response("Forbidden", { status: 403 });
        }
        const userId = payload.userId;
        // 2. Ambil data dari database
        const evaluasiData = db
          .query("SELECT * FROM evaluasi WHERE user_id = ?")
          .all(userId);

        // 3. Kembalikan data sebagai respons JSON
        return new Response(JSON.stringify(evaluasiData), {
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.error("Error fetching evaluasi data:", error);
        return new Response("Internal Server Error", { status: 500 });
      }
    })
    .post("/evaluasi", async (context) => {
      try {
        console.log(context.cookie.auth?.value);
        const payload = await context.jwt.verify(context.cookie.auth?.value); // Handle potential null value from verify
        console.log(payload);
        if (!payload || payload.role !== "pegawai") {
          return new Response("Forbidden", { status: 403 });
        }
        const userId = payload.userId;

        const {
          tanggal,
          kegiatan,
          kuantitas,
          jam_mulai,
          jam_selesai,
          verifikasi,
        } = context.body as {
          tanggal: string;
          kegiatan: string;
          kuantitas: number;
          jam_mulai: string;
          jam_selesai: string;
          verifikasi: string;
        };

        // db.run(
        //   "INSERT INTO evaluasi (tanggal, kegiatan, kuantitas, jam_mulai, jam_selesai, verifikasi) VALUES (?, ?, ?, ?, ?, ?)",
        //   [tanggal, kegiatan, kuantitas, jam_mulai, jam_selesai, verifikasi]
        // );

        db.run(
          "INSERT INTO evaluasi (tanggal, kegiatan, kuantitas, jam_mulai, jam_selesai, verifikasi, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)", // Tambahkan user_id
          [
            tanggal,
            kegiatan,
            kuantitas,
            jam_mulai,
            jam_selesai,
            verifikasi,
            userId,
          ]
        );

        return { message: "Evaluasi created successfully" };
      } catch (error) {
        return new Response("Unauthorized", { status: 401 });
      }
    })
    .put(
      "/evaluasi/:id",

      async (context: any) => {
        try {
          const payload = await context.jwt.verify(context.cookie.auth?.value);
          const userId = payload.userId;
          if (!payload || payload.role !== "pegawai") {
            return new Response("Forbidden", { status: 403 });
          }

          const { id } = context.params;
          const {
            tanggal,
            kegiatan,
            kuantitas,
            jam_mulai,
            jam_selesai,
            verifikasi,
          } = context.body;

          const result = db.run(
            `UPDATE evaluasi 
            SET tanggal = ?, kegiatan = ?, kuantitas = ?, jam_mulai = ?, jam_selesai = ?, verifikasi = ?
            WHERE id = ? AND user_id = ?`, // Tambahkan kondisi user_id
            [
              tanggal,
              kegiatan,
              kuantitas,
              jam_mulai,
              jam_selesai,
              verifikasi,
              id,
              userId,
            ]
          );

          if (result.changes === 0) {
            return new Response("Evaluasi not found", { status: 404 });
          }

          return { message: "Evaluasi updated successfully" };
        } catch (error) {
          console.error("Error updating evaluasi:", error);
          return new Response("Internal Server Error", { status: 500 });
        }
      }
    )
    .delete(
      "/evaluasi/:id",

      async (context: any) => {
        try {
          const payload = await context.jwt.verify(context.cookie.auth?.value);
          const userId = payload.userId;
          if (!payload || payload.role !== "pegawai") {
            return new Response("Forbidden", { status: 403 });
          }

          const { id } = context.params;

          const result = db.run(
            "DELETE FROM evaluasi WHERE id = ? AND user_id = ?", // Tambahkan kondisi user_id
            [id, userId]
          );

          if (result.changes === 0) {
            return new Response("Evaluasi not found", { status: 404 });
          }

          return { message: "Evaluasi deleted successfully" };
        } catch (error) {
          console.error("Error deleting evaluasi:", error);
          return new Response("Internal Server Error", { status: 500 });
        }
      }
    );
