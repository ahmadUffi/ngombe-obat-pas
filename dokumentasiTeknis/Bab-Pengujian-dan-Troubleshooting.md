# Panduan Pengujian, Troubleshooting, dan Konfigurasi Environment SmedBox

**Versi:** 2.0  
**Tanggal:** Oktober 2025  
**Status:** Enhanced Documentation

## Daftar Isi

1. [Pendahuluan](#pendahuluan)
2. [Bagian A - Website (Frontend + Backend)](#bagian-a-website)
3. [Bagian B - IoT (Firmware Perangkat)](#bagian-b-iot)
4. [Lampiran](#lampiran)

---

## Pendahuluan

Dokumen ini menyediakan panduan lengkap untuk pengujian, troubleshooting, dan konfigurasi environment sistem SmedBox yang terdiri dari dua komponen utama:

- **Bagian A** — Website (Frontend React + Backend Express)
- **Bagian B** — IoT (Firmware ESP32)

Setiap bagian dilengkapi dengan:

- ✅ Contoh konfigurasi environment
- 🧪 Prosedur pengujian terstruktur
- 🔧 Panduan troubleshooting
- 📊 Indikator keberhasilan yang jelas

---

## Bagian A - Website (Frontend + Backend) {#bagian-a-website}

### A.1. Konfigurasi Environment

#### A.1.1. Backend Environment (.env)

Buat file `.env` di root folder backend dengan konfigurasi berikut:

```ini
# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=5000
NODE_ENV=development

# ============================================
# CRON JOBS (Stock Check & Dose Logging)
# ============================================
CRON_ENABLED=true
CRON_SCHEDULE=0 7,19 * * *
# Format: minute hour day month dayOfWeek
# Default: 07:00 dan 19:00 WIB setiap hari
CRON_TIMEZONE=Asia/Jakarta

# ============================================
# WABLAS (WhatsApp Gateway)
# ============================================
WABLAS_TOKEN=your_wablas_token_here
WABLAS_SECRET_KEY=your_wablas_secret_key_here
WABLAS_DRY_RUN=1
# 1 = Testing mode (tidak mengirim WA sebenarnya)
# 0 = Production mode (mengirim WA sungguhan)

# ============================================
# FRONTEND SERVING (Optional)
# ============================================
SERVE_FRONTEND=true
FRONTEND_DIST=../../frontend/dist

# ============================================
# SUPABASE CONFIGURATION
# ============================================
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# ============================================
# LOGGING & MONITORING
# ============================================
LOG_LEVEL=info
# Options: error, warn, info, debug
```

**Catatan Keamanan:**

- ⚠️ Jangan commit file `.env` ke repository
- ✅ Gunakan `.env.example` sebagai template
- 🔒 Simpan kredensial production di secret manager

#### A.1.2. Frontend Environment (.env)

Buat file `.env` di root folder frontend (Vite):

```ini
# ============================================
# API CONFIGURATION
# ============================================
VITE_API_BASE_URL=http://localhost:5000/v1/api

# ============================================
# SUPABASE CONFIGURATION
# ============================================
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# ============================================
# FEATURE FLAGS (Optional)
# ============================================
VITE_ENABLE_DEBUG=true
VITE_ENABLE_ANALYTICS=false
```

**Tips:**

- Semua environment variable Vite harus diawali dengan `VITE_`
- Restart dev server setelah mengubah `.env`
- Untuk production, gunakan `.env.production`

---

### A.2. Prosedur Pengujian Website

#### A.2.1. Pengujian Backend API

##### 📋 Persiapan

```bash
# Install dependencies
npm install

# Jalankan backend
npm run dev
```

##### 🧪 Test Cases

**Test 1: Health Check**

```http
GET http://localhost:5000/health
```

Expected Response:

```json
{
  "status": "ok",
  "timestamp": "2025-10-16T10:30:00.000Z"
}
```

**Test 2: Authentication**

```http
GET http://localhost:5000/v1/api/profile/me
Authorization: Bearer YOUR_TOKEN_HERE
```

Expected Response:

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "John Doe",
    "email": "user@example.com",
    "no_hp": "628123456789"
  }
}
```

**Test 3: Get Jadwal untuk IoT**

```http
GET http://localhost:5000/v1/api/jadwal/get-for-iot
Authorization: Bearer YOUR_TOKEN_HERE
```

Expected Response:

```json
{
  "no_hp": "628123456789",
  "jadwalMinum": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nama_pasien": "John Doe",
      "nama_obat": "Paracetamol",
      "dosis_obat": 2,
      "jumlah_obat": 10,
      "kategori": "Analgesik",
      "slot_obat": "A",
      "catatan": "Sesudah makan",
      "jam_awal": ["07:00", "19:00"],
      "jam_berakhir": ["07:30", "19:30"]
    }
  ]
}
```

**Test 4: Dose Log Status Today**

```http
GET http://localhost:5000/v1/api/dose-log/status-today
Authorization: Bearer YOUR_TOKEN_HERE
```

Expected Response:

```json
{
  "ok": true,
  "data": [
    {
      "jadwal_id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "nama_obat": "Paracetamol",
      "nama_pasien": "John Doe",
      "dose_time": "07:00",
      "status": "pending",
      "taken_at": null
    },
    {
      "jadwal_id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "nama_obat": "Paracetamol",
      "nama_pasien": "John Doe",
      "dose_time": "19:00",
      "status": "taken",
      "taken_at": "2025-10-16T12:05:30.000Z"
    }
  ]
}
```

##### ✅ Kriteria Keberhasilan

- [ ] Semua endpoint merespons dengan status code 200
- [ ] Response body sesuai dengan spesifikasi API
- [ ] Waktu response < 1000ms
- [ ] Tidak ada error di console

---

#### A.2.2. Pengujian WhatsApp Integration

##### 🧪 Skenario Pengujian

**Pengujian 1: Dry-Run Mode**

```bash
# Pastikan WABLAS_DRY_RUN=1 di .env
```

```http
POST http://localhost:5000/v1/api/message/test/send
Content-Type: application/json

{
  "phone": "628123456789",
  "message": "Test pesan reminder minum obat",
  "type": "text",
  "dryRun": 1
}
```

Expected Response:

```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messageId": "dry-run-1729075200000",
    "phone": "628123456789",
    "sentAt": "2025-10-16T10:30:00.000Z",
    "type": "text"
  }
}
```

**Pengujian 2: Status Tracking**

```http
GET http://localhost:5000/v1/api/message/test/status/dry-run-1729075200000
```

Expected Response (Dry-Run):

```json
{
  "success": true,
  "data": {
    "messageId": "dry-run-1729075200000",
    "status": "sent",
    "statusMessage": "Message sent (dry-run mode)",
    "phone": "628123456789",
    "createdAt": "2025-10-16T10:30:00.000Z"
  }
}
```

**Catatan:** Dalam dry-run mode, status tidak berubah seperti production (queued → sent → delivered → read). Status akan langsung "sent" dengan flag dry-run.

##### ✅ Kriteria Keberhasilan

- [ ] Pesan tidak terkirim sebenarnya (dry-run mode)
- [ ] Status berubah sesuai flow yang diharapkan
- [ ] Log tercatat di database
- [ ] Tidak ada error di console backend

---

#### A.2.3. Pengujian Stock Reminder (Cron Jobs)

##### 🧪 Manual Trigger Test

**Persiapan Data:**

```sql
-- Pastikan ada jadwal dengan stok menipis
-- Struktur tabel jadwal:
UPDATE jadwal
SET jumlah_obat = 2  -- Stok rendah (< threshold biasanya 5)
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
  AND slot_obat = 'A';
```

**Trigger Cron Manually:**

```http
POST http://localhost:5000/v1/api/admin/cron/stock-check
Authorization: Bearer ADMIN_TOKEN_HERE
```

Expected Response:

```json
{
  "success": true,
  "message": "Stock check completed",
  "result": {
    "processedJadwal": 5,
    "lowStockCount": 1,
    "outOfStockCount": 0,
    "notificationsSent": 1
  }
}
```

##### 📊 Verifikasi

**Check Logs:**

```bash
# Terminal output should show:
[INFO] StockCron: Starting stock check...
[INFO] StockCron: Found 1 low stock items
[INFO] StockCron: Notification sent for jadwal-123
[INFO] StockCron: Complete. Results: {...}
```

**Check Database:**

```sql
-- Cek history stock
SELECT * FROM history
WHERE status IN ('stock menipis', 'stock habis')
ORDER BY created_at DESC LIMIT 5;

-- Cek WA reminders yang aktif
SELECT j.nama_obat, j.slot_obat, j.jumlah_obat,
       jwr.wablas_reminder_ids, jwr.is_active
FROM jadwal j
LEFT JOIN jadwal_wa_reminders jwr ON j.id = jwr.jadwal_id
WHERE j.jumlah_obat <= 5
ORDER BY j.jumlah_obat ASC;
```

##### ✅ Kriteria Keberhasilan

- [ ] Cron job berjalan tanpa error
- [ ] Notifikasi low-stock terkirim (dry-run)
- [ ] History tercatat di database
- [ ] Log menunjukkan detail yang benar

---

#### A.2.4. Load Testing dengan k6 (Optional)

> Catatan: Untuk panduan ringkas k6 yang berfokus pada berkas-berkas penting dan cara cepat menjalankannya, lihat dokumen: [Pengujian k6 (Ringkas)](./Pengujian-k6.md).

##### 📋 Setup k6

**Install k6:**

```bash
# Windows (Chocolatey)
choco install k6

# macOS
brew install k6

# Linux
sudo apt-get install k6
```

##### 🧪 Run Load Test

**Test 1: WhatsApp Latency (50 VUs)**

```bash
cd backend
k6 run k6/wa-latency-50.js
```

Expected Output:

```
scenarios: (100.00%) 1 scenario, 50 max VUs
✓ status is 200
✓ response time < 1000ms

checks.........................: 100.00% ✓ 5000  ✗ 0
http_req_duration..............: avg=245ms min=120ms med=230ms max=890ms p(95)=450ms p(99)=650ms
http_reqs......................: 5000    50/s
```

**Test 2: API Stress Test**

```bash
k6 run k6/api-stress.js
```

##### ✅ Kriteria Keberhasilan

- [ ] Success rate > 99%
- [ ] P95 latency < 500ms
- [ ] P99 latency < 1000ms
- [ ] No error responses

---

### A.3. Troubleshooting Website

#### 🔧 Issue: Cron Job Tidak Berjalan

**Gejala:**

- Log tidak menunjukkan `StockCron enabled`
- Notifikasi tidak terkirim di waktu yang dijadwalkan

**Diagnosis:**

```bash
# Check environment variable
echo $CRON_ENABLED

# Check cron schedule format
node -e "const cron = require('node-cron'); console.log(cron.validate('0 7,19 * * *'));"
```

**Solusi:**

1. ✅ Pastikan `CRON_ENABLED=true` di `.env`
2. ✅ Validasi format `CRON_SCHEDULE` (gunakan crontab.guru)
3. ✅ Verifikasi timezone: `CRON_TIMEZONE=Asia/Jakarta`
4. ✅ Restart server setelah perubahan
5. ✅ Check log startup untuk konfirmasi

---

#### 🔧 Issue: WhatsApp Tidak Terkirim

**Gejala:**

- Response API sukses tapi pesan tidak sampai
- Error: "Invalid credentials" atau "Unauthorized"

**Diagnosis:**

```http
POST http://localhost:5000/v1/api/message/test/verify-credentials
Authorization: Bearer YOUR_TOKEN_HERE
```

**Solusi:**

1. ✅ Verifikasi `WABLAS_TOKEN` dan `WABLAS_SECRET_KEY`
2. ✅ Pastikan `WABLAS_DRY_RUN=0` untuk production
3. ✅ Format nomor harus diawali 62 (bukan 08)
   ```javascript
   // Correct: 628123456789
   // Wrong: 08123456789
   ```
4. ✅ Check saldo/quota Wablas account
5. ✅ Test dengan nomor yang sudah verified

**Format Nomor Helper Function:**

```javascript
function formatPhoneNumber(phone) {
  // Remove leading 0 and add 62
  return phone.startsWith("0") ? "62" + phone.substring(1) : phone;
}
```

---

#### 🔧 Issue: Reminder Tidak Dihapus Saat Stok Habis

**Gejala:**

- Stok sudah 0 tapi reminder masih terkirim
- Database `wablas_reminder_ids` tidak ter-clear

**Diagnosis:**

```sql
-- Check reminder yang masih aktif (untuk jadwal stok habis)
SELECT j.id, j.nama_obat, j.slot_obat, j.jumlah_obat,
       jwr.wablas_reminder_ids, jwr.is_active
FROM jadwal j
LEFT JOIN jadwal_wa_reminders jwr ON j.id = jwr.jadwal_id
WHERE j.jumlah_obat = 0
  AND jwr.wablas_reminder_ids IS NOT NULL
  AND jwr.is_active = true;
```

**Solusi:**

1. ✅ Verifikasi log deletion: `Deleted Wablas reminder: xxx`
2. ✅ Manual cleanup jika diperlukan:
   ```sql
   -- Set reminder menjadi inactive (tabel terpisah)
   UPDATE jadwal_wa_reminders
   SET is_active = false
   WHERE jadwal_id IN (
     SELECT id FROM jadwal WHERE jumlah_obat = 0
   );
   ```
3. ✅ Pastikan error handling di `deleteWaReminder()`:
   ```javascript
   try {
     await deleteWaReminder(reminderId);
   } catch (error) {
     console.error("Failed to delete reminder:", error);
     // Still update database
   }
   ```

---

#### 🔧 Issue: Reminder Tidak Kembali Setelah Refill

**Gejala:**

- Stok sudah di-refill tapi reminder tidak dibuat ulang
- `wablas_reminder_ids` tetap NULL

**Diagnosis:**

```javascript
// Check function call di update-stock endpoint
console.log("Calling recreateWaRemindersForJadwal with:", {
  jadwalId,
  jamMinum,
  namaObat,
});
```

**Solusi:**

1. ✅ Pastikan `recreateWaRemindersForJadwal()` dipanggil setelah refill
2. ✅ Verifikasi parameter yang dikirim lengkap
3. ✅ Check response dari Wablas API
4. ✅ Manual recreation jika perlu:

   ```http
   POST http://localhost:5000/v1/api/admin/reminder/recreate
   Content-Type: application/json

   {
     "jadwalId": "jadwal-123"
   }
   ```

---

#### 🔧 Issue: Duplikasi WhatsApp/Reminder

**Gejala:**

- User menerima pesan ganda
- Database memiliki reminder ID duplikat

**Diagnosis:**

```sql
-- Check for duplicates (reminder ada di tabel terpisah)
SELECT jadwal_id, wablas_reminder_ids, COUNT(*) as count
FROM jadwal_wa_reminders
WHERE is_active = true
GROUP BY jadwal_id, wablas_reminder_ids
HAVING count > 1;
```

**Solusi:**

1. ✅ Implementasi idempotency key:
   ```javascript
   const reminderKey = `${jadwalId}-${jamMinum}`;
   ```
2. ✅ Check sebelum membuat reminder baru:
   ```javascript
   // Hapus reminder lama sebelum buat baru
   const oldReminders = await getWaRemindersByJadwal(jadwal_id);
   if (oldReminders && oldReminders.length > 0) {
     await deleteWaRemindersByJadwal(jadwal_id);
   }
   ```
3. ✅ Cleanup duplikat:
   ```sql
   -- Nonaktifkan reminder duplikat (keep yang terbaru)
   WITH ranked AS (
     SELECT id,
            ROW_NUMBER() OVER (PARTITION BY jadwal_id ORDER BY created_at DESC) as rn
     FROM jadwal_wa_reminders
     WHERE is_active = true
   )
   UPDATE jadwal_wa_reminders
   SET is_active = false
   WHERE id IN (SELECT id FROM ranked WHERE rn > 1);
   ```

---

## Bagian B - IoT (Firmware Perangkat) {#bagian-b-iot}

### B.1. Konfigurasi Firmware

#### B.1.1. Build-Time Configuration

Edit file `IoT/ngompas.ino`:

```cpp
// ============================================
// API CONFIGURATION
// ============================================
const char* API_HOST = "163.53.195.57";
const int   API_PORT = 5000;
const char* API_BASE_URL = "http://163.53.195.57:5000/v1/api";

// ============================================
// HARDWARE PIN CONFIGURATION
// ============================================
// Audio & Alerts
#define BUZZER_PIN 19
#define LED_STATUS 2

// DFPlayer (Audio Module)
#define DFPLAYER_RX 16
#define DFPLAYER_TX 17

// IR Sensors (Slot Detection)
#define IR_SLOT_A 32
#define IR_SLOT_B 33
#define IR_SLOT_C 25
#define IR_SLOT_D 26
#define IR_SLOT_E 27
#define IR_SLOT_F 14

// I2C (RTC & PCF8575)
#define I2C_SDA 21
#define I2C_SCL 22
#define RTC_ADDRESS 0x68    // DS3231 RTC
#define PCF8575_ADDRESS 0x20 // PCF8575 I/O Expander

// GSM Module (SIM800L - Optional)
#define GSM_RX_PIN 4
#define GSM_TX_PIN 2
#define GSM_BAUD 9600

// ============================================
// TIMING CONFIGURATION
// ============================================
#define FETCH_INTERVAL 300000      // 5 minutes
#define NOTIFICATION_INTERVAL 300000  // 5 minutes
#define BUZZER_DURATION 30000       // 30 seconds
#define BUZZER_PATTERN_ON 150       // ms
#define BUZZER_PATTERN_OFF 350      // ms
#define AUDIO_INTERVAL 10000        // 10 seconds

// ============================================
// BEHAVIOR CONFIGURATION
// ============================================
#define ENABLE_DEBUG_LOGS true
#define AUTO_SYNC_RTC true
#define UNAUTHORIZED_ALERT true
```

#### B.1.2. Web GUI Access

Setelah perangkat terhubung ke WiFi (STA mode), akses Web GUI di:

```
http://<DEVICE_IP>/ui
```

**Fitur Web GUI:**

- 📊 **Status Dashboard**: Koneksi, IP, SSID, baterai, RTC, jadwal aktif
- 🎛️ **Control Panel**:
  - Test buzzer
  - Force LED off
  - Start/Stop notifications
  - Fetch schedules now
  - Sync RTC
  - Reset to setup mode
  - Reboot device

---

### B.2. Prosedur Pengujian IoT

#### B.2.1. Initial Setup & Connectivity

##### 📋 Persiapan Perangkat

**Hardware Checklist:**

- [ ] ESP32 terpasang dengan power supply stabil
- [ ] Semua sensor IR terhubung dan berfungsi
- [ ] DFPlayer terkoneksi dengan SD card berisi audio files
- [ ] PCF8575 terpasang untuk kontrol LED
- [ ] RTC (DS3231) terpasang dengan baterai
- [ ] (Opsional) SIM card terpasang untuk GSM

##### 🧪 Test Sequence

**Step 1: Enter Setup Mode**

```
1. Tahan tombol reset WiFi 3 detik (jika tersedia)
   ATAU
2. Perangkat otomatis masuk setup jika belum ada konfigurasi
3. LED status berkedip cepat = Setup mode aktif
```

**Step 2: Connect to Captive Portal**

```
1. Scan WiFi networks
2. Connect to SSID: "ngompas"
3. Password: (jika ada) "smedbox123"
4. Browser otomatis membuka halaman setup
5. Jika tidak otomatis, buka: http://192.168.4.1
```

**Step 3: Configure Connection**

**Opsi A: WiFi Mode**

```
1. Pilih "WiFi Connection"
2. Scan dan pilih SSID
3. Masukkan password
4. Input email & password akun SmedBox
5. Klik "Connect"
```

**Opsi B: GSM Mode**

```
1. Pilih "GSM Connection"
2. Masukkan APN (default: "internet")
3. Input email & password akun SmedBox
4. Klik "Connect"
```

**Step 4: Verify Connection**

```
1. Device akan restart
2. LED status menyala solid = Connected
3. Serial monitor menunjukkan:
   - WiFi connected to: [SSID]
   - IP address: [IP]
   - Auth token obtained
   - RTC synced
4. Buka Web GUI: http://[IP]/ui
```

##### ✅ Kriteria Keberhasilan

**Status di Web GUI harus menunjukkan:**

```json
{
  "wifi": {
    "status": "connected",
    "ssid": "YourWiFi",
    "rssi": -45,
    "ip": "192.168.1.100"
  },
  "auth": {
    "status": "authenticated",
    "tokenValid": true
  },
  "rtc": {
    "synced": true,
    "time": "2025-10-16 10:30:00"
  },
  "schedules": {
    "active": 3,
    "nextDose": "2025-10-16 19:00:00"
  }
}
```

---

#### B.2.2. Pengujian Pengambilan Obat (IR Detection)

##### 🧪 Skenario Normal (Authorized Access)

**Persiapan:**

```
1. Pastikan ada jadwal aktif (dalam window waktu)
2. Verifikasi LED slot menyala sesuai jadwal
3. Check Web GUI menunjukkan jadwal aktif
```

**Test Procedure:**

```
Step 1: Buka tutup slot yang sesuai (misal: Slot A)
Step 2: IR sensor mendeteksi LOW (tutup terbuka)
Step 3: Firmware memproses:
        - Hentikan fetch jika sedang berjalan
        - Panggil API: PUT /jadwal/update-stock-obat-iot
        - Update stok: stok_obat -= 1
        - Hapus jadwal dari active list
        - Matikan LED slot
        - Tampilkan UI success
        - Play success audio
Step 4: Tutup kembali slot
```

**Expected API Call:**

```http
PUT http://163.53.195.57:5000/v1/api/jadwal/update-stock-obat-iot
Content-Type: application/json

{
  "id_obat": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Expected Response (Success):**

```json
{
  "success": true,
  "message": "Stock obat berhasil dikurangi",
  "id_jadwal": "550e8400-e29b-41d4-a716-446655440000",
  "currentStock": 9
}
```

**Response jika stok sudah 0:**

```json
{
  "success": false,
  "message": "Stock obat sudah 0. Tidak bisa dikurangi lagi.",
  "id_jadwal": "550e8400-e29b-41d4-a716-446655440000",
  "currentStock": 0
}
```

##### ✅ Kriteria Keberhasilan

- [ ] Stok terupdate di backend (-1)
- [ ] LED slot padam setelah pengambilan
- [ ] UI menampilkan pesan sukses
- [ ] Audio success dimainkan
- [ ] Jadwal dihapus dari daftar aktif
- [ ] Log serial menunjukkan proses lengkap

---

#### B.2.3. Pengujian Akses Tidak Sah

##### 🧪 Skenario Unauthorized Access

**Setup:**

```
1. Pastikan tidak ada jadwal aktif untuk slot tertentu
   ATAU
2. Waktu saat ini di luar window jadwal
3. Semua LED slot seharusnya mati
```

**Test Procedure:**

```
Step 1: Buka tutup slot mana saja (misal: Slot C)
Step 2: Firmware mendeteksi akses tidak sah:
        - Check: Tidak ada jadwal aktif untuk slot ini
        - Trigger alarm:
          * Buzzer aktif 3 detik
          * Audio peringatan diputar
        - Tampilkan UI warning
        - Kirim alert ke backend
Step 3: Verifikasi notifikasi diterima di backend
```

**Expected API Call:**

```http
POST http://163.53.195.57:5000/v1/api/peringatan/create-peringatan
Content-Type: application/json
Authorization: Bearer [DEVICE_TOKEN]

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "pesan": "Akses tidak sah terdeteksi pada Slot C pada 16/10/2025 10:30"
}
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Peringatan berhasil dibuat",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "profile_id": "770e8400-e29b-41d4-a716-446655440002",
    "nama_obat": "Paracetamol",
    "slot_obat": "C",
    "pesan": "Akses tidak sah terdeteksi pada Slot C pada 16/10/2025 10:30",
    "created_at": "2025-10-16T10:30:00.000Z"
  }
}
```

**Expected UI Display:**

```
╔════════════════════════════╗
║  ⚠️  PERINGATAN  ⚠️        ║
║                            ║
║  Akses Tidak Diizinkan!    ║
║  Slot: C                   ║
║  Waktu: 10:30              ║
║                            ║
║  Hubungi pengawas          ║
╚════════════════════════════╝
```

##### ✅ Kriteria Keberhasilan

- [ ] Buzzer berbunyi 3 detik
- [ ] Audio peringatan diputar
- [ ] UI menampilkan warning
- [ ] Alert terkirim ke backend
- [ ] Log backend mencatat peringatan
- [ ] Notifikasi diterima pengawas (jika dikonfigurasi)

---

#### B.2.4. Pengujian Sistem Notifikasi

##### 🧪 Test Buzzer & Audio Notifications

**Test 1: Manual Trigger via Web GUI**

```
1. Buka Web GUI: http://[IP]/ui
2. Pastikan ada ≥1 jadwal aktif
3. Klik tombol "Start Notifications"
4. Observasi:
   - Buzzer pattern: 150ms ON / 350ms OFF
   - Durasi total: 30 detik
   - Audio per slot: Setiap 10 detik
5. Klik "Stop Notifications" untuk menghentikan
```

**Test 2: Automatic Trigger (Periodic)**

```
1. Tunggu interval notifikasi (5 menit default)
2. Saat ada jadwal aktif:
   - Notifikasi otomatis dimulai
   - Buzzer pattern sama seperti manual
   - Audio loop per slot aktif
3. Notifikasi berhenti otomatis setelah 30 detik
```

**Test 3: Audio File Verification**

```
Verifikasi file audio di SD card DFPlayer:
- 0001.mp3: Audio notifikasi untuk Slot A
- 0002.mp3: Audio notifikasi untuk Slot B
- 0003.mp3: Audio notifikasi untuk Slot C
- 0004.mp3: Audio notifikasi untuk Slot D
- 0005.mp3: Audio notifikasi untuk Slot E
- 0006.mp3: Audio notifikasi untuk Slot F
- 0007.mp3: Audio konfirmasi "Obat berhasil diambil"
- 0008.mp3: Audio peringatan "Akses tidak diizinkan"
- 0009.mp3: Audio alarm peringatan umum

Catatan: Format file harus 0001.mp3 (dengan leading zeros),
bukan 1.mp3 atau 001.mp3
```

##### 📊 Buzzer Pattern Diagram

```
Buzzer Pattern (30 seconds total):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ON:  ████   ████   ████   ████   ████
OFF:     ████    ████    ████    ████
     150ms 350ms (repeat)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Audio Timeline (per active slot):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Slot A: 🔊 ............... (10s) ...
Slot B: ......... 🔊 .......... (10s)
Slot C: .................. 🔊 ... (10s)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

##### ✅ Kriteria Keberhasilan

- [ ] Buzzer pattern konsisten (150/350ms)
- [ ] Audio jelas dan sinkron per slot
- [ ] Durasi tepat 30 detik
- [ ] Stop button berfungsi langsung
- [ ] Tidak ada distorsi audio
- [ ] Volume sesuai setting (default: 20/30)

---

### B.3. Troubleshooting IoT

#### 🔧 Issue: Tidak Bisa Connect WiFi

**Gejala:**

- LED berkedip cepat terus-menerus
- Tidak bisa scan network
- Timeout saat connecting
- Web GUI tidak accessible

**Diagnosis:**

```cpp
// Check serial monitor output:
WiFi connection failed
Failed to connect to WiFi
Connection timeout
WiFi disconnected
```

**Solusi:**

**1. Verifikasi Kredensial**

```
✅ SSID benar (case-sensitive)
✅ Password benar
✅ WiFi 2.4GHz (ESP32 tidak support 5GHz)
✅ No special characters in password
```

**2. Check Signal Strength**

```cpp
// Add to code for debugging:
int networks = WiFi.scanNetworks();
for(int i=0; i<networks; i++) {
  Serial.printf("%s (RSSI: %d)\n",
    WiFi.SSID(i).c_str(),
    WiFi.RSSI(i));
}
// RSSI > -70 dBm = Good
// RSSI < -80 dBm = Weak (may fail)
```

**3. Reset Configuration**

```
1. Tahan reset button 5 detik
2. atau via Web GUI: "Reset to Setup"
3. atau via serial: Kirim command "RESET_WIFI"
4. Re-enter credentials
```

**4. Check Router Settings**

```
✅ SSID broadcast enabled
✅ No MAC filtering (or add ESP32 MAC)
✅ DHCP enabled
✅ Channel 1-11 (avoid 12-14)
✅ No isolation mode
```

---

#### 🔧 Issue: GSM Tidak Tersambung

**Gejala:**

- "GSM init failed" di serial
- Tidak bisa connect ke network
- Data connection timeout

**Diagnosis:**

```cpp
// Serial output yang mungkin:
Initializing modem...
Waiting for network...
Network registration failed
GPRS connection failed
SIM not ready
```

**Solusi:**

**1. Verifikasi SIM Card**

```
✅ SIM card terpasang dengan benar (chip menghadap bawah)
✅ SIM tidak terkunci PIN (disable PIN di handphone dulu)
✅ SIM memiliki pulsa/paket data aktif
✅ Kartu sudah diaktivasi operator
```

**2. Check Power Supply**

```
✅ SIM800L membutuhkan power stabil 3.8-4.2V, 2A
✅ Jangan power dari ESP32 (tidak cukup arus)
✅ Gunakan power supply terpisah atau modul step-down
✅ Pasang capacitor 100uF-1000uF untuk stabilisasi
```

**3. Verifikasi Koneksi Serial**

```cpp
// Test komunikasi GSM
void testGSM() {
  Serial2.begin(9600, SERIAL_8N1, GSM_RX_PIN, GSM_TX_PIN);
  delay(3000);

  // Test AT command
  Serial2.println("AT");
  delay(1000);
  if (Serial2.available()) {
    String response = Serial2.readString();
    Serial.println("GSM Response: " + response);
    // Expected: "OK"
  }
}
```

**4. Set APN yang Benar**

```cpp
// APN untuk operator Indonesia:
// Telkomsel: "internet"
// Indosat: "indosatgprs"
// XL: "www.xlgprs.net"
// Tri: "3gprs"
// Smartfren: "smart"
```

---

#### 🔧 Issue: DFPlayer Tidak Bunyi

**Gejala:**

- Audio tidak terdengar
- Serial monitor menunjukkan "DFPlayer not online"
- Volume 0 atau audio file tidak ditemukan

**Diagnosis:**

```cpp
// Check DFPlayer status di serial monitor:
DFPlayer Mini online
Ready
// atau error:
Unable to begin DFPlayer
DFPlayer not responding
```

**Solusi:**

**1. Verifikasi Koneksi Hardware**

```
✅ RX DFPlayer → TX ESP32 (pin 17)
✅ TX DFPlayer → RX ESP32 (pin 16)
✅ VCC DFPlayer → 5V (tidak 3.3V!)
✅ GND DFPlayer → GND
✅ SPK+ dan SPK- ke speaker 3W 4-8 Ohm
```

**2. Format SD Card dengan Benar**

```
✅ Format: FAT32 (bukan exFAT atau NTFS)
✅ Cluster size: 4KB atau 8KB
✅ Kapasitas maksimal: 32GB
✅ File audio: Format MP3, bitrate 128kbps
✅ Nama file: 0001.mp3, 0002.mp3, ..., 0009.mp3
✅ Simpan di folder root (tidak dalam subfolder)
```

**3. Set Volume di Kode**

```cpp
// Di setup(), setelah DFPlayer.begin()
DFPlayer.volume(20);  // Volume 0-30, default 20
delay(100);
DFPlayer.EQ(DFPLAYER_EQ_NORMAL);  // Equalizer
```

**4. Test Audio Manual**

```cpp
// Test play file tertentu
void testAudio() {
  DFPlayer.play(1);  // Play 0001.mp3
  delay(3000);
  DFPlayer.play(7);  // Play 0007.mp3 (success sound)
}
```

---

#### 🔧 Issue: RTC Tidak Sinkron

**Gejala:**

- Waktu tidak akurat
- Fetch schedule di waktu yang salah
- Serial menunjukkan epoch 0 atau waktu 1970

**Diagnosis:**

```cpp
// Check RTC time di serial:
RTC Time: 2025-10-16 10:30:45
Epoch: 1729075845
// atau error:
RTC read failed
Epoch: 0
Time: 1970-01-01 00:00:00
```

**Solusi:**

**1. Verifikasi Hardware RTC**

```
✅ DS3231 terpasang I2C: SDA=21, SCL=22
✅ Battery CR2032 terpasang (3V)
✅ Battery tidak lemah (cek voltage > 2.5V)
✅ I2C address: 0x68
```

**2. Scan I2C untuk Deteksi RTC**

```cpp
#include <Wire.h>

void scanI2C() {
  Wire.begin(21, 22);
  Serial.println("Scanning I2C...");

  for(byte addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    if (Wire.endTransmission() == 0) {
      Serial.printf("Device found at 0x%02X\n", addr);
      // Expected: 0x68 (RTC) dan 0x20 (PCF8575)
    }
  }
}
```

**3. Manual Sync via Web GUI**

```
1. Buka Web GUI: http://[IP]/ui
2. Check "RTC Time" di dashboard
3. Klik tombol "Sync RTC"
4. Verifikasi waktu terupdate (WIB/GMT+7)
```

**4. Auto-Sync di Kode (WiFi Mode)**

```cpp
// RTC auto-sync saat WiFi connect
void syncRTCTime() {
  if (WiFi.status() == WL_CONNECTED) {
    configTime(25200, 0, "pool.ntp.org", "time.nist.gov");
    // GMT+7 = 25200 seconds offset

    struct tm timeinfo;
    if (getLocalTime(&timeinfo)) {
      // Set RTC from NTP
      rtc.adjust(DateTime(
        timeinfo.tm_year + 1900,
        timeinfo.tm_mon + 1,
        timeinfo.tm_mday,
        timeinfo.tm_hour,
        timeinfo.tm_min,
        timeinfo.tm_sec
      ));
      Serial.println("RTC synced with NTP");
    }
  }
}
```

**Catatan:** Sinkronisasi NTP hanya tersedia di mode WiFi. Mode GSM harus set waktu manual atau via API.

---

#### 🔧 Issue: Sensor IR Terbalik/Tidak Detect

**Gejala:**

- Slot terbuka tidak terdeteksi
- Atau sebaliknya: selalu detect meski tertutup
- LED tidak menyala sesuai jadwal

**Diagnosis:**

```cpp
// Test IR sensor di serial monitor:
// Tutup tertutup (normal):
IR Slot A: HIGH (1)
IR Slot B: HIGH (1)

// Tutup terbuka:
IR Slot A: LOW (0)  ← Terdeteksi
IR Slot B: HIGH (1)
```

**Solusi:**

**1. Pahami Logika IR Sensor**

```
IR Obstacle Avoidance Sensor:
- OUTPUT HIGH (1) = Tidak ada obstacle (tutup tertutup, IR terhalang)
- OUTPUT LOW (0)  = Ada obstacle (tutup terbuka, IR tidak terhalang)

Dalam kode:
if (digitalRead(IR_SLOT_A) == LOW) {
  // Tutup terbuka, user mengambil obat
}
```

**2. Test Masing-masing Sensor**

```cpp
void testIRSensors() {
  Serial.println("=== IR Sensor Test ===");
  Serial.printf("Slot A (Pin %d): %d\n", IR_SLOT_A, digitalRead(IR_SLOT_A));
  Serial.printf("Slot B (Pin %d): %d\n", IR_SLOT_B, digitalRead(IR_SLOT_B));
  Serial.printf("Slot C (Pin %d): %d\n", IR_SLOT_C, digitalRead(IR_SLOT_C));
  Serial.printf("Slot D (Pin %d): %d\n", IR_SLOT_D, digitalRead(IR_SLOT_D));
  Serial.printf("Slot E (Pin %d): %d\n", IR_SLOT_E, digitalRead(IR_SLOT_E));
  Serial.printf("Slot F (Pin %d): %d\n", IR_SLOT_F, digitalRead(IR_SLOT_F));
  Serial.println("Buka salah satu tutup dan lihat perubahan nilai");
  delay(2000);
}
```

**3. Kalibrasi Jarak IR**

```
✅ Jarak optimal IR: 2-10cm
✅ Adjust potensiometer di sensor untuk sensitivitas
✅ LED indikator di sensor harus menyala saat detect
✅ Test dengan tutup berbeda warna (hitam lebih baik)
```

---

#### 🔧 Issue: LED Slot Tidak Menyala

**Gejala:**

- LED tidak menyala sesuai jadwal aktif
- Semua LED mati atau semua menyala
- PCF8575 tidak merespons

**Diagnosis:**

```cpp
// Check I2C communication
Wire.beginTransmission(PCF8575_ADDRESS);
byte error = Wire.endTransmission();
if (error == 0) {
  Serial.println("PCF8575 detected at 0x20");
} else {
  Serial.println("PCF8575 not found!");
}
```

**Solusi:**

**1. Pahami Logika PCF8575**

```
PCF8575 untuk LED Common Cathode:
- Pin LOW (0)  = LED ON  ← Karena common cathode
- Pin HIGH (1) = LED OFF

Bit mapping (P0-P5 untuk Slot A-F):
P0 = Slot A LED
P1 = Slot B LED
P2 = Slot C LED
P3 = Slot D LED
P4 = Slot E LED
P5 = Slot F LED
```

**2. Test Manual Control**

```cpp
void testLEDs() {
  // Nyalakan semua LED (set all LOW)
  pcf8575.write(0x0000);  // Binary: 00000000 00000000
  delay(2000);

  // Matikan semua LED (set all HIGH)
  pcf8575.write(0xFFFF);  // Binary: 11111111 11111111
  delay(2000);

  // Nyalakan LED Slot A saja (P0 = LOW)
  pcf8575.write(0xFFFE);  // Binary: 11111111 11111110
  delay(2000);
}
```

**3. Update LED Status Sesuai Active Schedule**

```cpp
void updateLEDStatus() {
  uint16_t ledState = 0xFFFF;  // Start: all OFF (all HIGH)

  // Loop active schedules dan set bit LOW untuk slot aktif
  for (int i = 0; i < activeCount; i++) {
    char slot = activeSchedules[i].slot;
    int pin = slot - 'A';  // A=0, B=1, ..., F=5

    if (pin >= 0 && pin < 6) {
      ledState &= ~(1 << pin);  // Set bit to LOW (LED ON)
    }
  }

  pcf8575.write(ledState);
}
```

**4. Verifikasi Wiring PCF8575**

```
✅ SDA PCF8575 → Pin 21 ESP32
✅ SCL PCF8575 → Pin 22 ESP32
✅ VCC PCF8575 → 5V
✅ GND PCF8575 → GND
✅ A0, A1, A2 → GND (address 0x20)
✅ Pull-up resistor 4.7kΩ di SDA & SCL (jika perlu)
```

---

#### 🔧 Issue: Web GUI Tidak Muncul

**Gejala:**

- Tidak bisa akses `http://[IP]/ui`
- Browser timeout atau connection refused
- Hanya bisa akses di mode AP, tidak di STA

**Diagnosis:**

```cpp
// Check server status di serial:
Web server started
Listening on port 80
// atau
Server not initialized
```

**Solusi:**

**1. Verifikasi Device dalam Mode STA**

```cpp
// Check WiFi status
if (WiFi.status() == WL_CONNECTED) {
  Serial.print("Connected! IP: ");
  Serial.println(WiFi.localIP());
  // Buka: http://[IP_INI]/ui
} else {
  Serial.println("Not connected to WiFi");
}
```

**2. Pastikan Web Server Running**

```cpp
// Di loop(), harus ada:
if (webServerStarted) {
  server.handleClient();  // Handle HTTP requests
}
```

**3. Test Akses Root Endpoint**

```
1. Coba akses: http://[IP]/
   → Harus redirect ke /ui

2. Coba akses: http://[IP]/api/status
   → Harus return JSON status

3. Jika kedua berhasil tapi /ui gagal,
   check HTML rendering di browser console
```

**4. Firewall / Network Issues**

```
✅ Device dan PC dalam subnet yang sama
✅ No firewall blocking port 80
✅ Ping device IP untuk test connectivity:
   ping [IP]
✅ Coba dari browser lain atau device lain
```

**5. Restart Web Server**

```
Via Web GUI (jika accessible):
- Klik "Reboot Device"

Via Serial Monitor:
- Kirim command untuk restart server
- Atau reset device secara fisik
```
