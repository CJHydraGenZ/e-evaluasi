# Gunakan image dasar Bun resmi
FROM oven/bun

# Set direktori kerja di dalam container
WORKDIR /app

# Salin semua file dari proyek Anda ke dalam container
COPY . .

# Instal dependensi menggunakan Bun
RUN bun install

# Perintah untuk menjalankan aplikasi saat container dimulai
CMD ["bun", "run", "start"] 
