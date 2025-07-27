# SmedBox Backend API

Backend API untuk aplikasi SmedBox (Smart Medicine Box) yang dibangun dengan Node.js dan Express.js.

## 📋 Fitur

- **Jadwal Obat**: Manajemen jadwal minum obat
- **History**: Riwayat konsumsi obat
- **Kontrol**: Jadwal kontrol ke dokter
- **Peringatan**: Sistem notifikasi dan peringatan
- **Autentikasi**: Login dengan Supabase JWT

## 🚀 Cara Menjalankan

### Prerequisites

- Node.js (v18 atau lebih baru)
- npm atau yarn
- Database Supabase

### Instalasi

1. Clone repository dan masuk ke folder backend

```bash
cd backend
```

2. Install dependencies

```bash
npm install
```

3. Setup environment variables

```bash
cp .env.example .env
```

Edit file `.env` dan isi dengan konfigurasi Supabase Anda.

4. Jalankan server

```bash
# Dari folder backend/src
cd src
node index.js
```

Server akan berjalan di `http://localhost:5000`

## 📁 Struktur Folder

```
backend/
├── src/
│   ├── controllers/     # Logic controller untuk setiap endpoint
│   ├── services/        # Business logic dan database operations
│   ├── routes/          # Route definitions
│   ├── middleware/      # Middleware (auth, error handling)
│   └── index.js         # Entry point server
├── package.json
└── README.md
```

## 🔗 API Documentation

### Base URL

```
http://localhost:5000
```

### Health Check

#### GET /health

Cek status server

**Response:**

```json
{
  "success": true,
  "message": "Server is running"
}
```

---

### Authentication

#### POST /v1/api/login

Login dengan email dan password

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login berhasil",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Jadwal Obat

#### POST /v1/api/jadwal

Buat jadwal obat baru

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "nama_obat": "Paracetamol",
  "dosis": "500mg",
  "waktu": "08:00",
  "frekuensi": "3x sehari",
  "stock": 30,
  "tanggal_mulai": "2024-01-01",
  "tanggal_selesai": "2024-01-31"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Jadwal berhasil dibuat"
}
```

#### GET /v1/api/jadwal/web

Ambil semua jadwal obat untuk web interface

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Data jadwal berhasil diambil",
  "data": [
    {
      "id": 1,
      "nama_obat": "Paracetamol",
      "dosis": "500mg",
      "waktu": "08:00",
      "frekuensi": "3x sehari",
      "stock": 28,
      "tanggal_mulai": "2024-01-01",
      "tanggal_selesai": "2024-01-31",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### GET /v1/api/jadwal/iot

Ambil jadwal obat untuk IoT device (format khusus)

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Data jadwal berhasil diambil",
  "data": [
    {
      "id": 1,
      "nama_obat": "Paracetamol",
      "waktu": "08:00",
      "stock": 28
    }
  ]
}
```

#### PUT /v1/api/jadwal/stock/iot

Update stock obat dari IoT device (otomatis kurangi 1)

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "id_obat": 1
}
```

**Response:**

```json
{
  "success": true,
  "message": "Stock obat berhasil diperbarui",
  "data": {
    "id": 1,
    "stock_baru": 27
  }
}
```

#### PUT /v1/api/jadwal/stock/web

Update stock obat dari web interface (manual)

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "id_obat": 1,
  "newStock": 25
}
```

**Response:**

```json
{
  "success": true,
  "message": "Stock obat berhasil diperbarui",
  "data": {
    "id": 1,
    "stock_baru": 25
  }
}
```

#### DELETE /v1/api/jadwal

Hapus jadwal obat

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "jadwal_id": 1
}
```

**Response:**

```json
{
  "success": true,
  "message": "Jadwal berhasil dihapus"
}
```

---

### History

#### POST /v1/api/history

Tambah history konsumsi obat

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "id": 1,
  "status": "diminum"
}
```

**Response:**

```json
{
  "success": true,
  "message": "History berhasil dibuat"
}
```

#### GET /v1/api/history

Ambil history konsumsi obat

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Data history berhasil diambil",
  "data": [
    {
      "id": 1,
      "jadwal_id": 1,
      "nama_obat": "Paracetamol",
      "status": "diminum",
      "waktu_konsumsi": "2024-01-01T08:00:00Z"
    }
  ]
}
```

---

### Kontrol Dokter

#### POST /v1/api/kontrol

Buat jadwal kontrol ke dokter

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "tanggal": "2024-01-15",
  "dokter": "Dr. Budi Santoso",
  "waktu": "10:00",
  "nama_pasien": "John Doe"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Kontrol berhasil dibuat",
  "data": {
    "id": 1,
    "tanggal": "2024-01-15",
    "dokter": "Dr. Budi Santoso",
    "waktu": "10:00",
    "nama_pasien": "John Doe",
    "isDone": false
  }
}
```

#### GET /v1/api/kontrol

Ambil semua jadwal kontrol

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Data kontrol berhasil diambil",
  "data": [
    {
      "id": 1,
      "tanggal": "2024-01-15",
      "dokter": "Dr. Budi Santoso",
      "waktu": "10:00",
      "nama_pasien": "John Doe",
      "isDone": false,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### PUT /v1/api/kontrol/done

Update status kontrol selesai

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "id": 1,
  "isDone": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Status isDone berhasil diupdate"
}
```

#### PUT /v1/api/kontrol/:id

Update data kontrol

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "tanggal": "2024-01-16",
  "dokter": "Dr. Siti Nurhaliza",
  "waktu": "14:00",
  "nama_pasien": "Jane Doe"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Kontrol berhasil diupdate",
  "data": {
    "id": 1,
    "tanggal": "2024-01-16",
    "dokter": "Dr. Siti Nurhaliza",
    "waktu": "14:00",
    "nama_pasien": "Jane Doe"
  }
}
```

---

### Peringatan

#### POST /v1/api/peringatan

Buat peringatan baru

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "id": 1,
  "pesan": "Waktunya minum obat Paracetamol"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Peringatan berhasil dibuat",
  "data": {
    "id": 1,
    "pesan": "Waktunya minum obat Paracetamol",
    "created_at": "2024-01-01T08:00:00Z"
  }
}
```

#### GET /v1/api/peringatan

Ambil semua peringatan

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Data peringatan berhasil diambil",
  "data": [
    {
      "id": 1,
      "pesan": "Waktunya minum obat Paracetamol",
      "isRead": false,
      "created_at": "2024-01-01T08:00:00Z"
    }
  ]
}
```

---

## 🔐 Authentication

Semua endpoint (kecuali `/health` dan `/v1/api/login`) memerlukan Bearer token dari Supabase.

**Header yang diperlukan:**

```
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json
```

### Cara mendapatkan token:

1. Login melalui endpoint `/v1/api/login`
2. Gunakan `access_token` yang diterima
3. Sertakan dalam header setiap request

---

## 📤 Format Response

Semua response menggunakan format JSON yang konsisten:

### Success Response

```json
{
  "success": true,
  "message": "Pesan sukses",
  "data": {
    /* data yang diminta */
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Pesan error yang jelas"
}
```

### Status Codes

- `200 OK` - Request berhasil
- `201 Created` - Data berhasil dibuat
- `400 Bad Request` - Data input tidak valid
- `401 Unauthorized` - Token tidak valid atau expired
- `404 Not Found` - Resource tidak ditemukan
- `500 Internal Server Error` - Error server

---

## 🧪 Testing API

### Menggunakan cURL

**Test Health Check:**

```bash
curl http://localhost:5000/health
```

**Test Login:**

```bash
curl -X POST http://localhost:5000/v1/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Test dengan Token:**

```bash
curl -X GET http://localhost:5000/v1/api/jadwal/web \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### Menggunakan JavaScript (Fetch)

```javascript
// Login
const loginResponse = await fetch("http://localhost:5000/v1/api/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "user@example.com",
    password: "password123",
  }),
});

const loginData = await loginResponse.json();
const token = loginData.access_token;

// Menggunakan token untuk request lain
const jadwalResponse = await fetch("http://localhost:5000/v1/api/jadwal/web", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

const jadwalData = await jadwalResponse.json();
```

### Menggunakan Postman

1. Import collection atau buat request manual
2. Set base URL: `http://localhost:5000`
3. Untuk endpoints yang memerlukan auth:
   - Pilih Authorization tab
   - Type: Bearer Token
   - Token: masukkan access_token dari login

---

## 🚨 Error Messages

Backend memberikan pesan error yang jelas dalam bahasa Indonesia:

### Authentication Errors

```json
{
  "success": false,
  "message": "Token tidak ditemukan atau format salah"
}

{
  "success": false,
  "message": "Token tidak valid"
}

{
  "success": false,
  "message": "Gagal memverifikasi token"
}
```

### Validation Errors

```json
{
  "success": false,
  "message": "Email dan password harus diisi"
}

{
  "success": false,
  "message": "ID obat harus diisi"
}

{
  "success": false,
  "message": "Semua field harus diisi"
}
```

### Not Found Errors

```json
{
  "success": false,
  "message": "Route /v1/api/invalid-endpoint tidak ditemukan"
}
```

## 🛠 Error Handling

Backend menggunakan sistem error handling yang konsisten:

- **400 Bad Request**: Data input tidak valid
- **401 Unauthorized**: Token tidak valid atau expired
- **404 Not Found**: Resource tidak ditemukan
- **500 Internal Server Error**: Error server

## 🔧 Environment Variables

Buat file `.env` dengan konfigurasi berikut:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Server Configuration
PORT=5000
NODE_ENV=development
```

## 📝 Development Notes

### Code Style

- Menggunakan ES6 modules (`import/export`)
- Async/await untuk handling asynchronous operations
- Consistent error handling dengan middleware
- Clean code practices

### Middleware

- `verifySupabaseJWT`: Verifikasi token Supabase
- `errorHandler`: Global error handling
- `asyncHandler`: Wrapper untuk async functions

### Database

- Menggunakan Supabase sebagai database
- Semua operasi database ada di folder `services/`

## 🐛 Troubleshooting

### Server tidak bisa start

1. Pastikan berada di folder `backend/src`
2. Jalankan `node index.js`
3. Cek apakah port 5000 sudah digunakan

### Error "MODULE_NOT_FOUND"

1. Pastikan sudah `npm install`
2. Cek file package.json memiliki `"type": "module"`

### Error Database Connection

1. Cek konfigurasi `.env`
2. Pastikan Supabase credentials benar

## 🧪 Testing

Test server dengan:

```bash
curl http://localhost:5000/health
```

Response yang diharapkan:

```json
{
  "success": true,
  "message": "Server is running"
}
```

## 📞 Support

Jika mengalami masalah, pastikan:

1. Node.js version compatible
2. Environment variables sudah di-set
3. Dependencies sudah ter-install
4. Database connection berjalan dengan baik
