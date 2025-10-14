# Panduan Operasional: Stock Reminder & Out-of-Stock (SmedBox)

Versi: 1.0
Tanggal: Oktober 2025

Ringkasan singkat:
Dokumen ini menjelaskan bagaimana mekanisme pengingat stok menipis dan stok habis bekerja pada sistem SmedBox, cara pengujian (termasuk dry-run Wablas dan skrip k6), langkah deployment/configuration yang diperlukan untuk menjalaninya, serta prosedur perawatan dan troubleshooting untuk operator atau user teknis.

---

## 1. Behaviour singkat (apa yang terjadi di kode)

Berdasarkan kode saat ini (lihat `backend/src/services/stockCronService.js`, `jadwalService.js`, `wablasService.js`, `messageService.js`):

- Cron job `checkAllJadwalStockAndNotify()` (di-setup di `backend/src/index.js`) berjalan pada schedule yang dikonfigurasi (default: `0 7,19 * * *` → 07:00 & 19:00 WIB) jika `CRON_ENABLED=true`.
- Untuk setiap `jadwal` fungsi cron menghitung `dosesPerDay` dari `jam_awal` dan menghitung threshold low-stock = `dosesPerDay * 3` (stockCronService). Jika `jumlah_obat <= threshold` akan dikirim notifikasi "stok menipis".
- Jika `jumlah_obat <= 0` maka dianggap "stok habis":
  - Cron / service akan memanggil `pauseJadwalReminders` yang menghapus reminder Wablas (memanggil `deleteWablasReminder`) dan menghapus record reminder di DB (`waReminderService`).
  - Pengguna akan diberitahukan via WhatsApp bahwa pengingat dihentikan.
- Update stok melalui API dapat terjadi dari:
  - Web: `PUT /v1/api/jadwal/update-stock-obat-web` (body: `{ id_obat, newStock }` — digunakan oleh UI manual)
  - IoT: `PUT /v1/api/jadwal/update-stock-obat-iot` (dipanggil perangkat saat obat diambil; kode backend juga memanggil `updateObatByID(..., own='iot')` secara internal)
- Ketika stok diisi ulang (refill) dari 0 → >0, kode mencoba "recreate" reminders (`recreateWaRemindersForJadwal`) dan mengirim notifikasi bahwa pengingat diaktifkan kembali.
- Notifikasi WA dikirim menggunakan `sendWhatsAppMessage` (di `messageService.js`) yang punya mode dry-run global (`WABLAS_DRY_RUN=1`) atau per-call via `options.dryRun`.

Catatan implementasi penting:

- `stockCronService` menghitung threshold `dosesPerDay * 3`.
- `jadwalService.updateObatByID` juga mengirim notifikasi "diminum" dan membuat history. Untuk low-stock ia menggunakan threshold `<=5` (ada sedikit perbedaan antara check cron dan check saat update dari web/iot). Perbedaan ini perlu dicatat.
- Ada kemungkinan mismatch pemanggilan fungsi `recreateWaRemindersForJadwal` dari `jadwalService` (argumen berbeda) — lihat bagian troubleshooting.

---

## 2. Konfigurasi environment penting

Pastikan environment (file `.env`) berisi setidaknya variabel berikut:

- `PORT` — port server
- `CRON_ENABLED` — `true` / `false`. Jika `true` cron stock check akan dijalankan.
- `CRON_SCHEDULE` — format cron (default `0 7,19 * * *`)
- `WABLAS_TOKEN`, `WABLAS_SECRET_KEY` — kredensial Wablas
- `WABLAS_DRY_RUN` — `1` untuk mode dry-run global (tidak melakukan panggilan eksternal)
- `SERVE_FRONTEND` — `true` untuk serve static frontend
- `FRONTEND_DIST` — path ke `dist` jika serve frontend

Keamanan: jangan commit `WABLAS_TOKEN`/`WABLAS_SECRET_KEY` ke VCS. Jika kredensial pernah tertulis di repo, rotasi token segera.

---

## 3. Alur operasi & endpoint administrasi

- Manual trigger stock-check (admin):
  - `POST /v1/api/admin/cron/stock-check` — memicu logic stock check satu kali (auth admin diperlukan). Berguna untuk test/diagnosis.
- Update stock via web (manual user):
  - `PUT /v1/api/jadwal/update-stock-obat-web` — body: `{ id_obat: <uuid>, newStock: <number> }` (auth required)
- Update stock via IoT (device):
  - `PUT /v1/api/jadwal/update-stock-obat-iot` — dipanggil device saat obat diambil. (auth required, payload sesuai implementasi device)
- Kirim pesan WA (testing):
  - `POST /v1/api/message/test/send` — endpoint dry-run (tidak melakukan panggilan ke Wablas, biasanya public/no auth per API doc)
  - `POST /v1/api/message/send` — endpoint produksi (auth required)
- Cek status pesan dry-run/real:
  - `GET /v1/api/message/test/status/:id` atau `GET /v1/api/message/status/:id`

---

## 4. Cara pengujian (testing)

Tujuan pengujian: verifikasi flow notifikasi low-stock, out-of-stock (pause reminders), refill (recreate reminders), dan notifikasi "obat diminum" dari IoT.

4.1. Prasyarat

- Jalankan backend secara lokal atau staging.
- Set `WABLAS_DRY_RUN=1` untuk pengujian awal (agar tidak spam WA sesungguhnya).
- Pastikan `CRON_ENABLED=false` bila ingin menguji manual terlebih dahulu. Anda bisa memicu cron manual lewat admin endpoint.

  4.2. Pengujian manual (PowerShell examples)

- Trigger stock-check manual (admin):

```powershell
# menggantikan <ADMIN_TOKEN> dengan token admin
Invoke-RestMethod -Method Post -Uri http://localhost:5000/v1/api/admin/cron/stock-check -Headers @{ Authorization = "Bearer <ADMIN_TOKEN>" }
```

- Test kirim WA dry-run:

```powershell
# send a dry-run message (no auth endpoint exists for test send per API docs)
Invoke-RestMethod -Method Post -Uri http://localhost:5000/v1/api/message/test/send -Body (@{ phone = '6281234567890'; message = 'Test dry-run WA' } | ConvertTo-Json) -ContentType 'application/json'
```

- Simulasi IoT mengurangi stok (iot decrement):

```powershell
# contoh body; sesuaikan field sesuai implementasi device
Invoke-RestMethod -Method Put -Uri http://localhost:5000/v1/api/jadwal/update-stock-obat-iot -Headers @{ Authorization = 'Bearer <DEVICE_TOKEN>' } -Body (@{ id_obat = '<jadwal-uuid>'; source = 'iot' } | ConvertTo-Json) -ContentType 'application/json'
```

- Simulasi refill via web (set new stock):

```powershell
Invoke-RestMethod -Method Put -Uri http://localhost:5000/v1/api/jadwal/update-stock-obat-web -Headers @{ Authorization = 'Bearer <USER_TOKEN>' } -Body (@{ id_obat = '<jadwal-uuid>'; newStock = 20 } | ConvertTo-Json) -ContentType 'application/json'
```

4.3. Pengujian terotomasi & load

- k6 test scripts tersedia di `backend/k6/`:
  - `all-apis.js` — skenario CRUD & cleanup
  - `wa-latency-50.js` — pengujian latency WA (dry-run)

Jalankan contoh:

```powershell
# dari root repo
k6 run backend/k6/wa-latency-50.js
```

Catatan: jalankan k6 dari environment yang mendukungnya (Linux/WSL/Windows dengan k6 terinstal).

4.4. Verifikasi hasil

- Periksa console logs backend untuk baris terkait StockCron: `StockCron result:` atau error.
- Jika `WABLAS_DRY_RUN=1` gunakan `GET /v1/api/message/test/status/:id` untuk memeriksa status pesan dry-run (fungsi `getMessageStatus` dalam kode mendukung dry-run id yang berawalan `dry_`).
- Lihat tabel `history` pada Supabase untuk entri `cron: stock menipis`, `cron: stock habis`, `stock diisi ulang`, `obat diminum`.

---

## 5. Deployment / konfigurasi produksi

5.1. Environment & startup

- Pastikan prod .env memiliki:

  - `CRON_ENABLED=true`
  - `CRON_SCHEDULE` sesuai (mis: `0 7,19 * * *` untuk 07:00 dan 19:00 WIB)
  - `WABLAS_TOKEN` & `WABLAS_SECRET_KEY` valid
  - `WABLAS_DRY_RUN=0`
  - `SERVE_FRONTEND=true` + `FRONTEND_DIST` jika ingin serve SPA dari backend

  5.2. Process manager / container

- Rekomendasi: jalankan backend di Docker (container) atau PM2. Jika menggunakan Docker, pastikan timezone container set ke Asia/Jakarta atau cron scheduler explicit timezone sudah digunakan (kode memakai timezone di node-cron).

  5.3. Logging & monitoring

- Set up centralized logging (stdout captured by container manager); sebaiknya gunakan Pino/Winston untuk JSON structured logs (backlog di dokumen teknis).
- Pastikan log retention dan alerting: ketika `StockCron failed` atau `Wablas API Error` muncul, kirim notifikasi ke channel ops.

  5.4. Keamanan

- Pastikan file `.env` tidak tercommit. Jika kredensial pernah tercommit (kata kunci disimpan pada repo), rotasi token segera.

---

## 6. Perawatan & rutinitas operasional

6.1. Harian / Mingguan

- Monitor server logs untuk `StockCron result` dan `DoseLog mark missed` messages.
- Cek anomali notifikasi WA (banyak 401 dari Wablas → kemungkinan token expired).

  6.2. Bulanan

- Periksa tabel `history` dan rekap entry stok habis/diisi ulang untuk analisa penggunaan.
- Update dependensi Node.js & library serta patch keamanan.

  6.3. Jika mengganti Wablas provider atau token

- Update `WABLAS_TOKEN` & `WABLAS_SECRET_KEY` di env; restart service.
- Jalankan sekali `POST /v1/api/admin/cron/stock-check` untuk memastikan pengingat yang aktif masih valid dan re-create bila perlu.

---

## 7. Troubleshooting (kasus umum & langkah perbaikan cepat)

7.1. Cron tidak jalan / StockCron disabled

- Periksa env `CRON_ENABLED`. Jika `false`, aktifkan dengan `CRON_ENABLED=true` dan restart service.
- Periksa log startup, ada pesan `StockCron enabled with schedule:`.

  7.2. Tidak ada notifikasi WA meskipun stok menipis

- Periksa `WABLAS_DRY_RUN` apakah masih `1` (dry-run) — pada dry-run tidak akan mengirim WA.
- Periksa apakah `profile.no_hp` terisi di DB (`profile` table). Jika kosong, WA tidak akan dikirim.
- Periksa format nomor telepon; fungsi `formatPhoneNumber` akan mengkonversi 08xx ke 62xx. Jika nomor sangat bermasalah, perbaiki data user.

  7.3. Wablas API mengembalikan 401 / auth error

- Pastikan `WABLAS_TOKEN` & `WABLAS_SECRET_KEY` benar.
- Jika token ter-commit/public, lakukan rotasi kredensial.
- Cek log error: `Wablas API Error:` akan menampilkan response body.

  7.4. Reminders tidak dihapus setelah stok habis

- `pauseJadwalReminders` memanggil `deleteWablasReminder` per reminder id. Jika Wablas delete gagal karena auth atau 404, fungsi akan melanjutkan (peredaan error). Cek log `StockCron: delete Wablas reminder failed`.
- Jika DB masih mengandung `wablas_reminder_ids`, jalankan manual cleanup: hapus record dari tabel `jadwal_wa_reminders` untuk jadwal tersebut atau panggil admin route/skrip yang membersihkan.

  7.5. Reminders tidak di-recreate setelah refill

- Kode mencoba `recreateWaRemindersForJadwal`. Namun ada indikasi nama argumen/parameter mismatch: `recreateWaRemindersForJadwal` di `stockCronService` menerima objek `jadwal` sementara di `jadwalService.updateObatByID` dipanggil dengan `(id_jadwal, result.user_id)` — ini dapat menyebabkan error pada runtime.

  - Periksa log error pada saat refill: cari `Refill handling failed:` atau `recreateWaRemindersForJadwal` di log.
  - Temporary fix: jalankan manual script/endpoint untuk membuat reminders kembali atau perbaiki fungsi supaya menerima `(jadwal_id)` dan melakukan fetch jadwal internal sebelum membuat reminders.

  7.6. Duplicate reminders atau banyak WA duplikat

- Bisa terjadi jika reminders dibuat berulang tanpa membersihkan `wablas_reminder_ids` lama. Solusi:

  - Hapus `wablas_reminder_ids` lama lalu buat kembali (gunakan admin script yang menghapus reminder Wablas berdasarkan ID dan melakukan update DB).
  - Tambahkan idempotency (cek di DB apakah reminder untuk a jam sudah ada sebelum create).

  7.7. How-to: Dapatkan status pesan dry-run

- Jika `WABLAS_DRY_RUN=1` atau `messageId` dimulai dengan `dry_`, gunakan `GET /v1/api/message/test/status/:messageId` (atau fungsi internal `getMessageStatus`) untuk melihat status progression (queued → sent → delivered → read).

---

## 8. Checklist cepat saat menangani insiden notifikasi

1. Cek logs backend (stderr/stdout). Cari `StockCron failed`, `Wablas API Error`, `Out-of-stock handling failed`.
2. Periksa `CRON_ENABLED` & current `CRON_SCHEDULE` di env.
3. Pastikan `WABLAS_TOKEN`/`WABLAS_SECRET_KEY` valid.
4. Pastikan `profile.no_hp` terisi & terformat benar untuk user yang dimaksud.
5. Jika perlu memaksa pengecekan stok sekarang, panggil admin endpoint: `POST /v1/api/admin/cron/stock-check`.
6. Untuk debug, set `WABLAS_DRY_RUN=1` agar sistem tidak mengirim pesan sebenarnya.

---

## 9. Catatan developer / perbaikan yang direkomendasikan

- Konsolidasi threshold stock check: gunakan satu tempat penghitungan threshold (cron vs updateObatByID) agar konsisten.
- Perbaiki potensi bug argumen `recreateWaRemindersForJadwal` (satu bentuk signature dan panggilan konsisten).
- Tambahkan idempotency dan deduplikasi untuk pembuatan reminders.
- Integrasikan structured logging (pino/winston) agar alert dapat di-set berdasarkan kata kunci/field (mis. `error`, `Wablas API Error`).
- Tambahkan monitoring metric untuk `wa_send_latency_ms`, `wa_delivery_latency_ms`, dan `stock_cron_runs`.

---

## 10. Referensi kode

- `backend/src/services/stockCronService.js` — Cron dan logic pengingat stok
- `backend/src/services/jadwalService.js` — update stock, refill handling, create jadwal + WA reminders
- `backend/src/services/wablasService.js` — wrapper API Wablas (create/delete reminder)
- `backend/src/services/messageService.js` — sendWhatsAppMessage & dry-run store
- `backend/k6/` — skrip pengujian (all-apis.js, wa-latency-50.js)

---

Jika Anda mau, saya juga bisa:

- Buatkan skrip admin kecil (`scripts/repair-recreate-reminders.js`) untuk mem-backfill reminders setelah refill.
- Menambahkan checklist runbook singkat dalam format Playbook ops (1-pager) untuk tim support.

Sampaikan mana yang ingin Anda tambahkan atau jika mau saya buka dan perbaiki file yang diduga bug (`recreateWaRemindersForJadwal` mismatch) langsung.
