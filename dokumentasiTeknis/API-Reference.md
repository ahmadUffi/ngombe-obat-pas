# SmedBox API Reference

**Base URL:** `http://localhost:5000/v1/api`  
**Version:** 1.0  
**Last Updated:** Oktober 2025

---

## 📑 Daftar Isi

1. [Authentication](#authentication)
2. [Profile](#profile)
3. [Jadwal (Schedule)](#jadwal)
4. [Dose Log](#dose-log)
5. [History](#history)
6. [Kontrol (Appointment)](#kontrol)
7. [Peringatan (Alert)](#peringatan)
8. [Notes](#notes)
9. [WhatsApp Message](#whatsapp-message)
10. [Admin](#admin)
11. [Error Codes](#error-codes)

---

## Authentication

### 1. Login

**Endpoint:** `POST /v1/api/login`

**Description:** Login user dengan email dan password

**Authorization:** ❌ Tidak perlu Bearer token

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com"
    },
    "session": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 3600,
      "token_type": "bearer"
    }
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Email atau password salah"
}
```

**Error Response (422):**

```json
{
  "success": false,
  "message": "Email dan password harus diisi"
}
```

---

### 2. Forgot Password

**Endpoint:** `POST /v1/api/forgot-password`

**Description:** Kirim email reset password

**Authorization:** ❌ Tidak perlu Bearer token

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Email reset password telah dikirim"
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Email tidak ditemukan"
}
```

---

## Profile

### 3. Get My Profile

**Endpoint:** `GET /v1/api/profile/me`

**Description:** Mendapatkan data profile user yang sedang login

**Authorization:** ✅ Bearer token required

**Request Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Success Response (200):**

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

**Error Response (401):**

```json
{
  "success": false,
  "message": "Unauthorized - Token tidak valid"
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Profile tidak ditemukan"
}
```

---

### 4. Update Profile

**Endpoint:** `PUT /v1/api/profile/update`

**Description:** Update username dan nomor HP user

**Authorization:** ✅ Bearer token required

**Content-Type:** `multipart/form-data` (jika ada upload gambar)

**Request Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

```
username: "John Doe Updated"
no_hp: "628123456789"
image: [file] (optional, max 5MB)
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Profile berhasil diupdate",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "John Doe Updated",
    "email": "user@example.com",
    "no_hp": "628123456789",
    "img_profile": "https://storage.url/profiles/user-123/image.jpg"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Username minimal 3 karakter"
}
```

```json
{
  "success": false,
  "message": "Format nomor HP tidak valid"
}
```

```json
{
  "success": false,
  "message": "Ukuran gambar maksimal 5MB"
}
```

---

## Jadwal

### 5. Create Jadwal

**Endpoint:** `POST /v1/api/jadwal/input`

**Description:** Membuat jadwal minum obat baru

**Authorization:** ✅ Bearer token required

**Request Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Request Body:**

```json
{
  "nama_pasien": "John Doe",
  "nama_obat": "Paracetamol",
  "dosis_obat": 2,
  "jumlah_obat": 30,
  "jam_awal": ["07:00", "19:00"],
  "jam_berakhir": ["07:30", "19:30"],
  "catatan": "Sesudah makan",
  "kategori": "Analgesik",
  "slot_obat": "A"
}
```

**Success Response (201):**

```json
{
  "message": "Jadwal berhasil dibuat"
}
```

**Error Response (400):**

```json
{
  "error": "Slot obat sudah terisi"
}
```

```json
{
  "error": "Nomor HP tidak ditemukan. Mohon lengkapi profile terlebih dahulu."
}
```

**Error Response (500):**

```json
{
  "error": "Gagal membuat jadwal: [error message]"
}
```

---

### 6. Get Jadwal for Web

**Endpoint:** `GET /v1/api/jadwal/get-for-web`

**Description:** Mendapatkan semua jadwal untuk tampilan web (data lengkap)

**Authorization:** ✅ Bearer token required

**Request Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Success Response (200):**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "profile_id": "660e8400-e29b-41d4-a716-446655440001",
    "nama_pasien": "John Doe",
    "nama_obat": "Paracetamol",
    "dosis_obat": 2,
    "jumlah_obat": 30,
    "catatan": "Sesudah makan",
    "kategori": "Analgesik",
    "slot_obat": "A",
    "jam_awal": ["07:00", "19:00"],
    "jam_berakhir": ["07:30", "19:30"],
    "created_at": "2025-10-16T03:00:00.000Z",
    "updated_at": "2025-10-16T03:00:00.000Z"
  }
]
```

**Error Response (500):**

```json
{
  "error": "Gagal mengambil data jadwal: [error message]"
}
```

---

### 7. Get Jadwal for IoT

**Endpoint:** `GET /v1/api/jadwal/get-for-iot`

**Description:** Mendapatkan jadwal untuk perangkat IoT (data minimal + nomor HP)

**Authorization:** ✅ Bearer token required

**Request Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Success Response (200):**

```json
{
  "no_hp": "628123456789",
  "jadwalMinum": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nama_pasien": "John Doe",
      "nama_obat": "Paracetamol",
      "dosis_obat": 2,
      "jumlah_obat": 30,
      "kategori": "Analgesik",
      "slot_obat": "A",
      "catatan": "Sesudah makan",
      "jam_awal": ["07:00", "19:00"],
      "jam_berakhir": ["07:30", "19:30"]
    }
  ]
}
```

**Error Response (500):**

```json
{
  "error": "Gagal mengambil data profile: [error message]"
}
```

---

### 8. Update Stock (IoT)

**Endpoint:** `PUT /v1/api/jadwal/update-stock-obat-iot`

**Description:** Mengurangi stok obat ketika diambil dari perangkat IoT

**Authorization:** ❌ Tidak perlu Bearer token (untuk IoT)

**Request Body:**

```json
{
  "id_obat": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Stock obat berhasil dikurangi",
  "id_jadwal": "550e8400-e29b-41d4-a716-446655440000",
  "currentStock": 29
}
```

**Error Response (200 - Stock Habis):**

```json
{
  "success": false,
  "message": "Stock obat sudah 0. Tidak bisa dikurangi lagi.",
  "id_jadwal": "550e8400-e29b-41d4-a716-446655440000",
  "currentStock": 0
}
```

**Error Response (500):**

```json
{
  "error": "Gagal mengupdate data obat: [error message]"
}
```

---

### 9. Update Stock (Web)

**Endpoint:** `PUT /v1/api/jadwal/update-stock-obat-web`

**Description:** Update stok obat dari web (bisa tambah atau kurang)

**Authorization:** ❌ Tidak perlu Bearer token

**Request Body:**

```json
{
  "id_obat": "550e8400-e29b-41d4-a716-446655440000",
  "newStock": 50
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Stock obat berhasil diupdate",
  "id_jadwal": "550e8400-e29b-41d4-a716-446655440000",
  "currentStock": 50
}
```

**Error Response (500):**

```json
{
  "error": "Gagal mengupdate data obat: [error message]"
}
```

---

### 10. Delete Jadwal

**Endpoint:** `DELETE /v1/api/jadwal/delete/:jadwal_id`

**Description:** Menghapus jadwal berdasarkan ID

**Authorization:** ✅ Bearer token required

**Request Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**URL Parameters:**
- `jadwal_id`: UUID jadwal yang akan dihapus

**Success Response (200):**

```json
{
  "success": true,
  "message": "Jadwal berhasil dihapus"
}
```

**Error Response (500):**

```json
{
  "success": false,
  "message": "Gagal menghapus jadwal: [error message]"
}
```

---

## Dose Log

### 11. Get Dose Log Status Today

**Endpoint:** `GET /v1/api/dose-log/status-today`

**Description:** Mendapatkan status dosis hari ini (pending, taken, missed)

**Authorization:** ✅ Bearer token required

**Request Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Success Response (200):**

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
      "status": "taken",
      "taken_at": "2025-10-16T00:05:30.000Z"
    },
    {
      "jadwal_id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "nama_obat": "Paracetamol",
      "nama_pasien": "John Doe",
      "dose_time": "19:00",
      "status": "pending",
      "taken_at": null
    }
  ]
}
```

**Error Response (500):**

```json
{
  "ok": false,
  "message": "Gagal mengambil status dosis: [error message]"
}
```

---

## History

### 12. Create History

**Endpoint:** `POST /v1/api/history/input-history`

**Description:** Membuat entri history manual

**Authorization:** ✅ Bearer token required

**Request Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Request Body:**

```json
{
  "jadwal_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "diminum"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "History berhasil dibuat"
}
```

**Error Response (500):**

```json
{
  "error": "Gagal membuat history: [error message]"
}
```

---

### 13. Get All History

**Endpoint:** `GET /v1/api/history/get-all-history`

**Description:** Mendapatkan semua history user

**Authorization:** ✅ Bearer token required

**Request Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Success Response (200):**

```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "profile_id": "660e8400-e29b-41d4-a716-446655440001",
    "nama_obat": "Paracetamol",
    "dosis_obat": "2 tablet",
    "sisa_obat": "28",
    "status": "diminum",
    "waktu_minum": ["07:00", "19:00"],
    "created_at": "2025-10-16T00:05:30.000Z",
    "updated_at": "2025-10-16T00:05:30.000Z"
  }
]
```

**Error Response (500):**

```json
{
  "error": "Gagal mengambil history: [error message]"
}
```

---

## Kontrol

### 14. Create Kontrol

**Endpoint:** `POST /v1/api/kontrol/create-kontrol`

**Description:** Membuat jadwal kontrol/appointment dokter

**Authorization:** ✅ Bearer token required

**Request Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Request Body:**

```json
{
  "nama_pasien": "John Doe",
  "tanggal": "2025-10-20",
  "waktu": "10:00",
  "dokter": "Dr. Smith"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Kontrol berhasil dibuat",
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "profile_id": "660e8400-e29b-41d4-a716-446655440001",
    "nama_pasien": "John Doe",
    "tanggal": "2025-10-20",
    "waktu": "10:00",
    "dokter": "Dr. Smith",
    "isDone": false
  }
}
```

**Error Response (500):**

```json
{
  "error": "Gagal membuat kontrol: [error message]"
}
```

---

### 15. Get All Kontrol

**Endpoint:** `GET /v1/api/kontrol/get-all-kontrol`

**Description:** Mendapatkan semua jadwal kontrol user

**Authorization:** ✅ Bearer token required

**Request Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Success Response (200):**

```json
[
  {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "profile_id": "660e8400-e29b-41d4-a716-446655440001",
    "nama_pasien": "John Doe",
    "tanggal": "2025-10-20",
    "waktu": "10:00",
    "dokter": "Dr. Smith",
    "isDone": false,
    "wablas_schedule_id": ["schedule-123", "schedule-124"],
    "created_at": "2025-10-16T03:00:00.000Z",
    "updated_at": "2025-10-16T03:00:00.000Z"
  }
]
```

**Error Response (500):**

```json
{
  "error": "Gagal mengambil data kontrol: [error message]"
}
```

---

### 16. Update Kontrol

**Endpoint:** `PUT /v1/api/kontrol/edit/:id`

**Description:** Mengupdate jadwal kontrol

**Authorization:** ✅ Bearer token required

**Request Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**URL Parameters:**
- `id`: UUID kontrol yang akan diupdate

**Request Body:**

```json
{
  "tanggal": "2025-10-21",
  "waktu": "14:00",
  "dokter": "Dr. Johnson"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Kontrol berhasil diupdate"
}
```

**Error Response (500):**

```json
{
  "error": "Gagal mengupdate kontrol: [error message]"
}
```

---

### 17. Mark Kontrol as Done

**Endpoint:** `PATCH /v1/api/kontrol/done`

**Description:** Menandai kontrol sudah selesai

**Authorization:** ✅ Bearer token required

**Request Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Request Body:**

```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Status kontrol berhasil diupdate"
}
```

**Error Response (500):**

```json
{
  "error": "Gagal update status: [error message]"
}
```

---

### 18. Delete Kontrol

**Endpoint:** `DELETE /v1/api/kontrol/delete/:id`

**Description:** Menghapus jadwal kontrol

**Authorization:** ✅ Bearer token required

**Request Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**URL Parameters:**
- `id`: UUID kontrol yang akan dihapus

**Success Response (200):**

```json
{
  "success": true,
  "message": "Kontrol berhasil dihapus"
}
```

**Error Response (500):**

```json
{
  "error": "Gagal menghapus kontrol: [error message]"
}
```

---

## Peringatan

### 19. Create Peringatan

**Endpoint:** `POST /v1/api/peringatan/create-peringatan`

**Description:** Membuat peringatan (biasanya dari IoT saat akses tidak sah)

**Authorization:** ✅ Bearer token required

**Request Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Request Body:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "pesan": "Akses tidak sah terdeteksi pada Slot C pada 16/10/2025 10:30"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Peringatan berhasil dibuat",
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440004",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "profile_id": "660e8400-e29b-41d4-a716-446655440001",
    "nama_obat": "Paracetamol",
    "slot_obat": "C",
    "pesan": "Akses tidak sah terdeteksi pada Slot C pada 16/10/2025 10:30",
    "created_at": "2025-10-16T03:30:00.000Z",
    "updated_at": "2025-10-16T03:30:00.000Z"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "ID dan pesan harus diisi"
}
```

**Error Response (500):**

```json
{
  "error": "Gagal membuat peringatan: [error message]"
}
```

---

### 20. Get All Peringatan

**Endpoint:** `GET /v1/api/peringatan/get-all-peringatan`

**Description:** Mendapatkan semua peringatan user

**Authorization:** ✅ Bearer token required

**Request Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Data peringatan berhasil diambil",
  "data": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "profile_id": "660e8400-e29b-41d4-a716-446655440001",
      "nama_obat": "Paracetamol",
      "slot_obat": "C",
      "pesan": "Akses tidak sah terdeteksi pada Slot C",
      "created_at": "2025-10-16T03:30:00.000Z",
      "updated_at": "2025-10-16T03:30:00.000Z"
    }
  ]
}
```

**Error Response (500):**

```json
{
  "error": "Gagal mengambil peringatan: [error message]"
}
```

---

## Notes

### 21. Get All Notes

**Endpoint:** `GET /v1/api/notes`

**Description:** Mendapatkan semua notes user (dengan pagination & filter)

**Authorization:** ✅ Bearer token required

**Request Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Query Parameters (Optional):**
- `page`: Halaman (default: 1)
- `limit`: Jumlah per halaman (default: 10)
- `category`: Filter berdasarkan kategori
- `sortBy`: Kolom untuk sort (created_at, updated_at)
- `sortOrder`: asc atau desc

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "note_id": "aa0e8400-e29b-41d4-a716-446655440005",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "profile_id": "660e8400-e29b-41d4-a716-446655440001",
      "category": "Kesehatan",
      "message": "Ingat untuk cek tekanan darah",
      "created_at": "2025-10-16T03:00:00.000Z",
      "updated_at": "2025-10-16T03:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalNotes": 45,
    "notesPerPage": 10
  }
}
```

**Error Response (500):**

```json
{
  "success": false,
  "message": "Gagal mengambil notes: [error message]"
}
```

---

### 22. Get Note by ID

**Endpoint:** `GET /v1/api/notes/:noteId`

**Description:** Mendapatkan detail note berdasarkan ID

**Authorization:** ✅ Bearer token required

**Request Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**URL Parameters:**
- `noteId`: UUID note

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "note_id": "aa0e8400-e29b-41d4-a716-446655440005",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "profile_id": "660e8400-e29b-41d4-a716-446655440001",
    "category": "Kesehatan",
    "message": "Ingat untuk cek tekanan darah",
    "created_at": "2025-10-16T03:00:00.000Z",
    "updated_at": "2025-10-16T03:00:00.000Z"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Note tidak ditemukan"
}
```

---

### 23. Search Notes

**Endpoint:** `GET /v1/api/notes/search`

**Description:** Mencari notes berdasarkan keyword

**Authorization:** ✅ Bearer token required

**Request Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Query Parameters:**
- `q`: Keyword pencarian (required)
- `category`: Filter kategori (optional)

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "note_id": "aa0e8400-e29b-41d4-a716-446655440005",
      "category": "Kesehatan",
      "message": "Ingat untuk cek tekanan darah",
      "created_at": "2025-10-16T03:00:00.000Z"
    }
  ]
}
```

---

### 24. Get Notes Stats

**Endpoint:** `GET /v1/api/notes/stats`

**Description:** Mendapatkan statistik notes (jumlah per kategori)

**Authorization:** ✅ Bearer token required

**Request Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "totalNotes": 45,
    "byCategory": {
      "Kesehatan": 20,
      "Obat": 15,
      "Lainnya": 10
    }
  }
}
```

---

### 25. Create Note

**Endpoint:** `POST /v1/api/notes`

**Description:** Membuat note baru

**Authorization:** ✅ Bearer token required

**Request Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Request Body:**

```json
{
  "category": "Kesehatan",
  "message": "Ingat untuk cek tekanan darah"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Note berhasil dibuat",
  "data": {
    "note_id": "aa0e8400-e29b-41d4-a716-446655440005",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "profile_id": "660e8400-e29b-41d4-a716-446655440001",
    "category": "Kesehatan",
    "message": "Ingat untuk cek tekanan darah",
    "created_at": "2025-10-16T03:00:00.000Z"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Category dan message harus diisi"
}
```

---

### 26. Update Note

**Endpoint:** `PUT /v1/api/notes/:noteId`

**Description:** Mengupdate note

**Authorization:** ✅ Bearer token required

**Request Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**URL Parameters:**
- `noteId`: UUID note

**Request Body:**

```json
{
  "category": "Kesehatan",
  "message": "Cek tekanan darah dan gula darah"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Note berhasil diupdate"
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Note tidak ditemukan"
}
```

---

### 27. Delete Note

**Endpoint:** `DELETE /v1/api/notes/:noteId`

**Description:** Menghapus note

**Authorization:** ✅ Bearer token required

**Request Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**URL Parameters:**
- `noteId`: UUID note

**Success Response (200):**

```json
{
  "success": true,
  "message": "Note berhasil dihapus"
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Note tidak ditemukan"
}
```

---

## WhatsApp Message

### 28. Send WhatsApp Message (Production)

**Endpoint:** `POST /v1/api/message/send`

**Description:** Mengirim pesan WhatsApp (production - dengan biaya)

**Authorization:** ✅ Bearer token required

**Request Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Request Body:**

```json
{
  "phone": "628123456789",
  "message": "Reminder: Waktunya minum obat Paracetamol 2 tablet",
  "type": "text",
  "dryRun": 0
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messageId": "msg-1729075200000",
    "phone": "628123456789",
    "sentAt": "2025-10-16T10:30:00.000Z",
    "type": "text"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Phone number and message are required"
}
```

```json
{
  "success": false,
  "message": "Invalid Indonesian phone number format. Use format: +62xxx, 62xxx, 08xxx, or 8xxx",
  "details": {
    "provided": "123456",
    "reason": "Invalid phone number format"
  }
}
```

**Error Response (500):**

```json
{
  "success": false,
  "message": "Failed to send message",
  "error": "Wablas API error message"
}
```

---

### 29. Send WhatsApp Message (Test/Dry-Run)

**Endpoint:** `POST /v1/api/message/test/send`

**Description:** Test kirim pesan WhatsApp (dry-run mode - tidak ada biaya)

**Authorization:** ❌ Tidak perlu Bearer token

**Request Body:**

```json
{
  "phone": "628123456789",
  "message": "Test pesan reminder minum obat",
  "type": "text",
  "dryRun": 1
}
```

**Success Response (200):**

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

---

### 30. Send Bulk WhatsApp Messages

**Endpoint:** `POST /v1/api/message/send-bulk`

**Description:** Mengirim pesan ke multiple nomor sekaligus

**Authorization:** ✅ Bearer token required

**Request Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Request Body:**

```json
{
  "messages": [
    {
      "phone": "628123456789",
      "message": "Reminder obat untuk John"
    },
    {
      "phone": "628987654321",
      "message": "Reminder obat untuk Jane"
    }
  ],
  "type": "text",
  "dryRun": 0
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Bulk messages processed",
  "data": {
    "total": 2,
    "successful": 2,
    "failed": 0,
    "results": [
      {
        "phone": "628123456789",
        "messageId": "msg-1729075200001",
        "status": "sent"
      },
      {
        "phone": "628987654321",
        "messageId": "msg-1729075200002",
        "status": "sent"
      }
    ]
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Messages array is required and must not be empty"
}
```

---

### 31. Get Message Status

**Endpoint:** `GET /v1/api/message/status/:messageId`

**Description:** Cek status pengiriman pesan WhatsApp

**Authorization:** ✅ Bearer token required

**Request Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**URL Parameters:**
- `messageId`: ID pesan dari response send message

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "messageId": "msg-1729075200000",
    "status": "delivered",
    "statusMessage": "Message delivered to recipient",
    "phone": "628123456789",
    "createdAt": "2025-10-16T10:30:00.000Z",
    "deliveredAt": "2025-10-16T10:30:15.000Z"
  }
}
```

**Status Values:**
- `queued`: Pesan dalam antrian
- `sent`: Pesan terkirim ke gateway
- `delivered`: Pesan sampai ke penerima
- `read`: Pesan sudah dibaca
- `failed`: Gagal terkirim

---

### 32. Get Message Status (Test)

**Endpoint:** `GET /v1/api/message/test/status/:messageId`

**Description:** Cek status pesan dalam dry-run mode

**Authorization:** ❌ Tidak perlu Bearer token

**URL Parameters:**
- `messageId`: ID pesan dry-run

**Success Response (200):**

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

---

## Admin

### 33. Manual Stock Check Cron

**Endpoint:** `POST /v1/api/admin/cron/stock-check`

**Description:** Trigger manual cron job untuk cek stok obat dan kirim notifikasi

**Authorization:** ✅ Bearer token required (Admin only)

**Request Headers:**

```
Authorization: Bearer ADMIN_TOKEN_HERE
```

**Success Response (200):**

```json
{
  "success": true,
  "result": {
    "processedJadwal": 10,
    "lowStockCount": 2,
    "outOfStockCount": 1,
    "notificationsSent": 3,
    "errors": []
  }
}
```

**Error Response (403):**

```json
{
  "success": false,
  "message": "Forbidden - Admin access required"
}
```

**Error Response (500):**

```json
{
  "success": false,
  "message": "Stock check failed: [error message]"
}
```

---

## Error Codes

### HTTP Status Codes

| Status Code | Meaning | Description |
|------------|---------|-------------|
| 200 | OK | Request berhasil |
| 201 | Created | Resource berhasil dibuat |
| 400 | Bad Request | Request tidak valid (validasi gagal) |
| 401 | Unauthorized | Token tidak ada atau tidak valid |
| 403 | Forbidden | User tidak memiliki akses |
| 404 | Not Found | Resource tidak ditemukan |
| 422 | Unprocessable Entity | Data tidak bisa diproses |
| 500 | Internal Server Error | Error di server |

### Common Error Response Format

```json
{
  "success": false,
  "message": "Deskripsi error",
  "error": "Detail teknis error (optional)"
}
```

### Authentication Errors

```json
{
  "success": false,
  "message": "Unauthorized - Token tidak valid"
}
```

```json
{
  "success": false,
  "message": "Token expired. Please login again"
}
```

```json
{
  "success": false,
  "message": "No authorization token provided"
}
```

### Validation Errors

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email tidak valid"
    },
    {
      "field": "password",
      "message": "Password minimal 8 karakter"
    }
  ]
}
```

---

## Rate Limiting

- **WhatsApp API**: Max 100 requests per minute
- **General API**: Max 1000 requests per minute per user
- Exceeded: HTTP 429 Too Many Requests

---

## Testing Tips

### Using Postman/Insomnia

1. **Set Environment Variables:**
   ```
   BASE_URL = http://localhost:5000/v1/api
   TOKEN = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Authorization Header:**
   ```
   Authorization: Bearer {{TOKEN}}
   ```

3. **Test Sequence:**
   - Login → Get token
   - Set token ke environment
   - Test authenticated endpoints

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:5000/v1/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123!"}'
```

**Get Profile:**
```bash
curl -X GET http://localhost:5000/v1/api/profile/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Changelog

**v1.0 - Oktober 2025**
- Initial API documentation
- All major endpoints documented
- Error codes standardized
- Authentication flow documented

---

**Need Help?**  
Contact: support@smedbox.com  
Documentation: https://docs.smedbox.com
