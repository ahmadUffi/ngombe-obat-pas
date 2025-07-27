# API Documentation - Ngompas Backend

## Base URL

```
http://163.53.195.57:5000
```

## Authentication

Most endpoints require authentication using Supabase JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 📋 **Authentication Endpoints**

### POST `/v1/api/login`

Login user dengan email dan password.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response Success (200):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Error (401):**

```json
{
  "message": "Gagal login",
  "error": "Invalid credentials"
}
```

**Example cURL:**

```bash
curl -X POST http://163.53.195.57:5000/v1/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

---

## 💊 **Jadwal (Schedule) Endpoints**

### POST `/v1/api/jadwal/input`

Membuat jadwal obat baru. **Requires Authentication**

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "nama_pasien": "John Doe",
  "nama_obat": "Paracetamol",
  "dosis_obat": "500mg",
  "jumlah_obat": 30,
  "jam_awal": "08:00",
  "jam_berakhir": "20:00",
  "catatan": "Diminum setelah makan",
  "kategori": "Analgesik",
  "slot_obat": "1"
}
```

**Response Success (201):**

```json
{
  "message": "Jadwal berhasil dibuat"
}
```

**Response Error (500):**

```json
{
  "error": "Slot obat sudah terisi"
}
```

**Example cURL:**

```bash
curl -X POST http://163.53.195.57:5000/v1/api/jadwal/input \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "nama_pasien": "John Doe",
    "nama_obat": "Paracetamol",
    "dosis_obat": "500mg",
    "jumlah_obat": 30,
    "jam_awal": "08:00",
    "jam_berakhir": "20:00",
    "catatan": "Diminum setelah makan",
    "kategori": "Analgesik",
    "slot_obat": "1"
  }'
```

### GET `/v1/api/jadwal/get-for-web`

Mendapatkan semua jadwal user untuk web interface. **Requires Authentication**

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response Success (200):**

```json
[
  {
    "id": 1,
    "user_id": "uuid-123",
    "profile_id": 1,
    "nama_pasien": "John Doe",
    "nama_obat": "Paracetamol",
    "dosis_obat": "500mg",
    "jumlah_obat": 30,
    "jam_awal": "08:00",
    "jam_berakhir": "20:00",
    "catatan": "Diminum setelah makan",
    "kategori": "Analgesik",
    "slot_obat": "1",
    "created_at": "2025-01-27T10:00:00Z"
  }
]
```

**Example cURL:**

```bash
curl -X GET http://163.53.195.57:5000/v1/api/jadwal/get-for-web \
  -H "Authorization: Bearer <your_jwt_token>"
```

### GET `/v1/api/jadwal/get-for-iot`

Mendapatkan jadwal user untuk IoT device. **Requires Authentication**

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response Success (200):**

```json
[
  {
    "id": 1,
    "nama_obat": "Paracetamol",
    "slot_obat": "1",
    "jam_awal": "08:00",
    "jam_berakhir": "20:00"
  }
]
```

**Example cURL:**

```bash
curl -X GET http://163.53.195.57:5000/v1/api/jadwal/get-for-iot \
  -H "Authorization: Bearer <your_jwt_token>"
```

### PUT `/v1/api/jadwal/update-stock-obat-iot`

Update stok obat dari IoT device. **No Authentication Required**

**Request Body:**

```json
{
  "id_obat": 1
}
```

**Response Success (200):**

```json
{
  "message": "Stock obat berhasil diupdate"
}
```

**Example cURL:**

```bash
curl -X PUT http://163.53.195.57:5000/v1/api/jadwal/update-stock-obat-iot \
  -H "Content-Type: application/json" \
  -d '{
    "id_obat": 1
  }'
```

### PUT `/v1/api/jadwal/update-stock-obat-web`

Update stok obat dari web interface. **No Authentication Required**

**Request Body:**

```json
{
  "id_obat": 1,
  "newStock": 25
}
```

**Response Success (200):**

```json
{
  "message": "Stock obat berhasil diupdate"
}
```

**Example cURL:**

```bash
curl -X PUT http://163.53.195.57:5000/v1/api/jadwal/update-stock-obat-web \
  -H "Content-Type: application/json" \
  -d '{
    "id_obat": 1,
    "newStock": 25
  }'
```

### PUT `/v1/api/jadwal/delete`

Menghapus jadwal berdasarkan ID. **No Authentication Required**

**Request Body:**

```json
{
  "jadwal_id": 1
}
```

**Response Success (200):**

```json
{
  "message": "Jadwal berhasil dihapus"
}
```

**Example cURL:**

```bash
curl -X PUT http://163.53.195.57:5000/v1/api/jadwal/delete \
  -H "Content-Type: application/json" \
  -d '{
    "jadwal_id": 1
  }'
```

---

## 📊 **History Endpoints**

### POST `/v1/api/history/input-history`

Menambahkan history baru. **Requires Authentication**

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "activity": "Obat diminum",
  "timestamp": "2025-01-27T10:00:00Z",
  "jadwal_id": 1
}
```

**Response Success (201):**

```json
{
  "message": "History berhasil ditambahkan"
}
```

**Example cURL:**

```bash
curl -X POST http://163.53.195.57:5000/v1/api/history/input-history \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "activity": "Obat diminum",
    "timestamp": "2025-01-27T10:00:00Z",
    "jadwal_id": 1
  }'
```

### GET `/v1/api/history/get-all-history`

Mendapatkan semua history user. **Requires Authentication**

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response Success (200):**

```json
[
  {
    "id": 1,
    "user_id": "uuid-123",
    "activity": "Obat diminum",
    "timestamp": "2025-01-27T10:00:00Z",
    "jadwal_id": 1,
    "created_at": "2025-01-27T10:00:00Z"
  }
]
```

**Example cURL:**

```bash
curl -X GET http://163.53.195.57:5000/v1/api/history/get-all-history \
  -H "Authorization: Bearer <your_jwt_token>"
```

---

## 🎛️ **Control Endpoints**

All control endpoints require authentication.

### POST `/v1/api/kontrol/create-kontrol`

Membuat kontrol baru. **Requires Authentication**

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "title": "Kontrol Tekanan Darah",
  "description": "Cek tekanan darah rutin",
  "scheduled_date": "2025-01-28",
  "type": "medical_checkup"
}
```

**Response Success (201):**

```json
{
  "message": "Kontrol berhasil dibuat"
}
```

**Example cURL:**

```bash
curl -X POST http://163.53.195.57:5000/v1/api/kontrol/create-kontrol \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "title": "Kontrol Tekanan Darah",
    "description": "Cek tekanan darah rutin",
    "scheduled_date": "2025-01-28",
    "type": "medical_checkup"
  }'
```

### GET `/v1/api/kontrol/get-all-kontrol`

Mendapatkan semua kontrol user. **Requires Authentication**

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response Success (200):**

```json
[
  {
    "id": 1,
    "user_id": "uuid-123",
    "title": "Kontrol Tekanan Darah",
    "description": "Cek tekanan darah rutin",
    "scheduled_date": "2025-01-28",
    "type": "medical_checkup",
    "is_done": false,
    "created_at": "2025-01-27T10:00:00Z"
  }
]
```

**Example cURL:**

```bash
curl -X GET http://163.53.195.57:5000/v1/api/kontrol/get-all-kontrol \
  -H "Authorization: Bearer <your_jwt_token>"
```

### PATCH `/v1/api/kontrol/done`

Menandai kontrol sebagai selesai. **Requires Authentication**

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "id": 1
}
```

**Response Success (200):**

```json
{
  "message": "Kontrol berhasil ditandai selesai"
}
```

**Example cURL:**

```bash
curl -X PATCH http://163.53.195.57:5000/v1/api/kontrol/done \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "id": 1
  }'
```

### PUT `/v1/api/kontrol/edit/:id`

Mengedit kontrol berdasarkan ID. **Requires Authentication**

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "title": "Kontrol Tekanan Darah Updated",
  "description": "Cek tekanan darah rutin - updated",
  "scheduled_date": "2025-01-29",
  "type": "medical_checkup"
}
```

**Response Success (200):**

```json
{
  "message": "Kontrol berhasil diupdate"
}
```

**Example cURL:**

```bash
curl -X PUT http://163.53.195.57:5000/v1/api/kontrol/edit/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "title": "Kontrol Tekanan Darah Updated",
    "description": "Cek tekanan darah rutin - updated",
    "scheduled_date": "2025-01-29",
    "type": "medical_checkup"
  }'
```

---

## ⚠️ **Peringatan (Warning) Endpoints**

All peringatan endpoints require authentication.

### POST `/v1/api/peringatan/create-peringatan`

Membuat peringatan baru. **Requires Authentication**

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "title": "Stok Obat Habis",
  "message": "Stok Paracetamol hampir habis",
  "type": "stock_warning",
  "priority": "high"
}
```

**Response Success (201):**

```json
{
  "message": "Peringatan berhasil dibuat"
}
```

**Example cURL:**

```bash
curl -X POST http://163.53.195.57:5000/v1/api/peringatan/create-peringatan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "title": "Stok Obat Habis",
    "message": "Stok Paracetamol hampir habis",
    "type": "stock_warning",
    "priority": "high"
  }'
```

### GET `/v1/api/peringatan/get-all-peringatan`

Mendapatkan semua peringatan user. **Requires Authentication**

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response Success (200):**

```json
[
  {
    "id": 1,
    "user_id": "uuid-123",
    "title": "Stok Obat Habis",
    "message": "Stok Paracetamol hampir habis",
    "type": "stock_warning",
    "priority": "high",
    "is_read": false,
    "created_at": "2025-01-27T10:00:00Z"
  }
]
```

**Example cURL:**

```bash
curl -X GET http://163.53.195.57:5000/v1/api/peringatan/get-all-peringatan \
  -H "Authorization: Bearer <your_jwt_token>"
```

---

## 🔒 **Authentication Flow**

1. **Login**: POST ke `/v1/api/login` dengan email dan password
2. **Dapatkan Token**: Ambil `access_token` dari response
3. **Gunakan Token**: Sertakan token di header `Authorization: Bearer <token>` untuk endpoint yang memerlukan autentikasi

## 📝 **Error Handling**

Semua endpoint menggunakan HTTP status codes standar:

- **200**: OK - Request berhasil
- **201**: Created - Resource berhasil dibuat
- **400**: Bad Request - Request tidak valid
- **401**: Unauthorized - Token tidak valid atau tidak ada
- **404**: Not Found - Resource tidak ditemukan
- **500**: Internal Server Error - Error server

Format error response:

```json
{
  "error": "Error message description",
  "message": "User-friendly error message"
}
```

## 🚀 **Development Notes**

- Server berjalan di port 5000
- Menggunakan Supabase untuk database dan authentication
- CORS enabled untuk semua origins
- Request body harus dalam format JSON dengan header `Content-Type: application/json`

## 📱 **Postman Collection**

Untuk memudahkan testing, import collection berikut ke Postman:

**Base URL Variable**: `http://163.53.195.57:5000`

**Environment Variables:**

- `base_url`: `http://163.53.195.57:5000`
- `jwt_token`: `<your_jwt_token_here>`

Setelah login, set variable `jwt_token` dengan access_token yang didapat dari response login.
