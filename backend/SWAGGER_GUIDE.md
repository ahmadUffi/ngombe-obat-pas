# SmedBox API Documentation (Swagger)

## 📚 Akses Dokumentasi

Dokumentasi API SmedBox tersedia dalam format **Swagger/OpenAPI 3.0** dengan UI interaktif.

### Development Server

```
http://localhost:5000/api-docs
```

### Production Server

```
http://163.53.195.57:5000/api-docs
```

---

## 🚀 Cara Menggunakan Swagger UI

### 1. **Buka Swagger UI**

Akses URL dokumentasi di browser:

```
http://localhost:5000/api-docs
```

### 2. **Eksplorasi Endpoints**

- Semua endpoints dikelompokkan berdasarkan **tags** (Authentication, Profile, Jadwal, dll)
- Klik pada endpoint untuk melihat detail:
  - Request parameters
  - Request body schema
  - Response examples
  - Error responses

### 3. **Testing Endpoints**

#### **Public Endpoints (Tanpa Auth)**

1. Klik endpoint yang ingin dicoba (mis: `POST /login`)
2. Klik tombol **"Try it out"**
3. Isi request body di editor JSON
4. Klik **"Execute"**
5. Lihat response di bagian bawah

**Contoh Login:**

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

#### **Protected Endpoints (Dengan Auth)**

1. Login terlebih dahulu menggunakan endpoint `POST /login`
2. Copy **access_token** dari response
3. Klik tombol **"Authorize"** 🔓 di pojok kanan atas
4. Paste token dengan format: `Bearer YOUR_TOKEN_HERE`
5. Klik **"Authorize"**
6. Sekarang semua protected endpoints bisa dicoba

**Format Authorization:**

```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. **Filter Endpoints**

Gunakan search box di atas untuk mencari endpoint spesifik:

```
Ketik: "jadwal" → akan filter semua endpoint jadwal
Ketik: "profile" → akan filter endpoint profile
```

---

## 📋 API Endpoints Summary

### Authentication (2 endpoints)

- `POST /login` - Login user
- `POST /forgot-password` - Reset password

### Profile (2 endpoints)

- `GET /profile/me` - Get profile (auth required)
- `PUT /profile/update` - Update profile (auth required)

### Jadwal (6 endpoints)

- `POST /jadwal/input` - Create jadwal (auth required)
- `GET /jadwal/get-for-web` - Get all jadwal for web (auth required)
- `GET /jadwal/get-for-iot` - Get jadwal for IoT (auth required)
- `PUT /jadwal/update-stock-obat-iot` - Update stock from IoT
- `PUT /jadwal/update-stock-obat-web` - Update stock from web
- `DELETE /jadwal/delete/{jadwal_id}` - Delete jadwal (auth required)

### Dose Log (1 endpoint)

- `GET /dose-log/status-today` - Get today's dose status (auth required)

### History (2 endpoints)

- `POST /history/input-history` - Create history (auth required)
- `GET /history/get-all-history` - Get all history (auth required)

### Kontrol (5 endpoints)

- `POST /kontrol/create-kontrol` - Create appointment (auth required)
- `GET /kontrol/get-all-kontrol` - Get all appointments (auth required)
- `PUT /kontrol/edit/{id}` - Update appointment (auth required)
- `PATCH /kontrol/done` - Mark as done (auth required)
- `DELETE /kontrol/delete/{id}` - Delete appointment (auth required)

### Peringatan (2 endpoints)

- `POST /peringatan/create-peringatan` - Create alert (auth required)
- `GET /peringatan/get-all-peringatan` - Get all alerts (auth required)

### Notes (7 endpoints)

- `GET /notes` - Get all notes with pagination (auth required)
- `GET /notes/{noteId}` - Get note by ID (auth required)
- `GET /notes/search` - Search notes (auth required)
- `GET /notes/stats` - Get notes statistics (auth required)
- `POST /notes` - Create note (auth required)
- `PUT /notes/{noteId}` - Update note (auth required)
- `DELETE /notes/{noteId}` - Delete note (auth required)

### WhatsApp (5 endpoints)

- `POST /message/send` - Send message (auth required)
- `POST /message/test/send` - Send test message (dry-run)
- `POST /message/send-bulk` - Send bulk messages (auth required)
- `GET /message/status/{messageId}` - Get message status (auth required)
- `GET /message/test/status/{messageId}` - Get test message status

### Admin (1 endpoint)

- `POST /admin/cron/stock-check` - Manual stock check (admin only)

**Total: 33 Endpoints**

---

## 🔐 Authentication

### Bearer Token

Sebagian besar endpoint memerlukan autentikasi dengan **JWT Bearer Token**.

**Header Format:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Cara Mendapatkan Token:**

1. Login menggunakan `POST /login`
2. Ambil `access_token` dari response
3. Gunakan token untuk request selanjutnya

**Token Expiration:**

- Access token berlaku selama **1 jam**
- Setelah expire, perlu login ulang atau refresh token

---

## 📝 Request/Response Format

### Request Body

Semua request body menggunakan **JSON format**:

```json
{
  "field1": "value1",
  "field2": "value2"
}
```

**Content-Type Header:**

```
Content-Type: application/json
```

**Exception:** Upload file menggunakan `multipart/form-data`

```
Content-Type: multipart/form-data
```

### Response Format

Semua response menggunakan format standar:

**Success Response:**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error info"
}
```

---

## 🔢 HTTP Status Codes

| Code | Meaning               | Description                 |
| ---- | --------------------- | --------------------------- |
| 200  | OK                    | Request berhasil            |
| 201  | Created               | Resource berhasil dibuat    |
| 400  | Bad Request           | Request tidak valid         |
| 401  | Unauthorized          | Token tidak ada/tidak valid |
| 403  | Forbidden             | User tidak memiliki akses   |
| 404  | Not Found             | Resource tidak ditemukan    |
| 422  | Unprocessable Entity  | Data tidak bisa diproses    |
| 500  | Internal Server Error | Error di server             |

---

## 💡 Tips & Best Practices

### 1. **Gunakan Dry-Run Mode untuk Testing WA**

```json
{
  "phone": "628123456789",
  "message": "Test message",
  "dryRun": 1
}
```

Set `dryRun: 1` untuk menghindari biaya pengiriman WA saat testing.

### 2. **Phone Number Format**

Nomor HP harus format Indonesia:

- ✅ Valid: `628123456789`, `08123456789`, `+628123456789`
- ❌ Invalid: `123456`, `8123456789`

### 3. **UUID Format**

Semua ID menggunakan UUID v4:

```
550e8400-e29b-41d4-a716-446655440000
```

### 4. **Date Format**

- Date: `YYYY-MM-DD` (ISO 8601)
- DateTime: `YYYY-MM-DDTHH:mm:ss.sssZ` (ISO 8601)
- Time: `HH:mm` (24-hour format)

### 5. **Array Fields**

Beberapa field menggunakan array:

```json
{
  "jam_awal": ["07:00", "19:00"],
  "jam_berakhir": ["07:30", "19:30"]
}
```

---

## 🧪 Testing dengan Postman/Insomnia

### Import Swagger JSON

1. Download: `http://localhost:5000/api-docs.json`
2. Import ke Postman/Insomnia
3. Semua endpoints akan ter-generate otomatis

### Environment Variables

Buat environment dengan variabel:

```
BASE_URL = http://localhost:5000/v1/api
TOKEN = (kosong, akan diisi setelah login)
```

### Collection Setup

1. Login request → Save `access_token` to environment
2. Set Authorization header di collection level:
   ```
   Authorization: Bearer {{TOKEN}}
   ```

---

## 📊 Monitoring & Logging

### Request Logs

Server akan log setiap request ke console:

```
[2025-10-16 10:30:00] POST /v1/api/login - 200 (125ms)
[2025-10-16 10:30:15] GET /v1/api/profile/me - 200 (45ms)
```

### Error Tracking

Error akan di-log dengan detail:

```
[ERROR] StockCron failed: Connection timeout
[ERROR] DoseLog mark missed failed: Database error
```

---

## 🔄 API Versioning

Saat ini menggunakan **v1** di base URL:

```
/v1/api/...
```

Jika ada breaking changes di masa depan, akan dibuat versi baru:

```
/v2/api/...
```

Version lama akan tetap didukung selama 6 bulan setelah versi baru dirilis.

---

## 🛠️ Development

### Generate Swagger JSON

Swagger JSON di-generate otomatis dari `src/config/swagger.js`.

### Update Documentation

1. Edit file `src/config/swagger.js`
2. Tambah/update endpoint di `paths` object
3. Restart server
4. Refresh browser untuk melihat perubahan

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Access Swagger UI
# http://localhost:5000/api-docs
```

---

## 📞 Support

**Butuh bantuan?**

- Email: support@smedbox.com
- Documentation: https://docs.smedbox.com
- GitHub Issues: https://github.com/ahmadUffi/ngombe-obat-pas/issues

---

## 📄 License

ISC License - Copyright (c) 2025 SmedBox Team

---

**Happy API Testing! 🚀**
