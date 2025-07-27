# SmedBox API Documentation

## Informasi Umum

### Base URL

```
http://163.53.195.57:5000
```

### Format Response

Semua response API menggunakan format yang konsisten:

**Success Response:**

```json
{
  "success": true,
  "message": "Pesan sukses",
  "data": {} // Opsional, data yang dikembalikan
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Pesan error"
}
```

## Autentikasi

Sebagian besar endpoint memerlukan autentikasi menggunakan Supabase JWT token. Sertakan token dalam header Authorization:

```
Authorization: Bearer <your_jwt_token>
```

## Health Check

### GET `/health`

Memeriksa status server.

**Request:**

- Method: `GET`
- URL: `/health`
- Body: Tidak ada

**Response Sukses:**

```json
{
  "success": true,
  "message": "Server is running"
}
```

## Endpoint Autentikasi

### POST `/v1/api/login`

Login user dengan email dan password.

**Request:**

- Method: `POST`
- URL: `/v1/api/login`
- Body:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response Sukses (200):**

```json
{
  "success": true,
  "message": "Login berhasil",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "Email dan password harus diisi"
}
```

**Response Error (401):**

```json
{
  "success": false,
  "message": "Email atau password salah"
}
```

**Contoh cURL:**

```bash
curl -X POST http://163.53.195.57:5000/v1/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

## Endpoint Jadwal Obat

### POST `/v1/api/jadwal/input`

Membuat jadwal obat baru.

**Request:**

- Method: `POST`
- URL: `/v1/api/jadwal/input`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
  ```
- Body:

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

**Response Sukses (201):**

```json
{
  "success": true,
  "message": "Jadwal berhasil dibuat"
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "Data yang dikirim tidak valid"
}
```

**Response Error (500):**

```json
{
  "success": false,
  "message": "Terjadi kesalahan pada server"
}
```

**Contoh cURL:**

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

Mendapatkan semua jadwal obat untuk tampilan web.

**Request:**

- Method: `GET`
- URL: `/v1/api/jadwal/get-for-web`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  ```

**Response Sukses (200):**

```json
{
  "success": true,
  "message": "Data jadwal berhasil diambil",
  "data": [
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
}
```

**Response Error (401):**

```json
{
  "success": false,
  "message": "Tidak memiliki akses"
}
```

**Contoh cURL:**

```bash
curl -X GET http://163.53.195.57:5000/v1/api/jadwal/get-for-web \
  -H "Authorization: Bearer <your_jwt_token>"
```

### GET `/v1/api/jadwal/get-for-iot`

Mendapatkan jadwal untuk perangkat IoT.

**Request:**

- Method: `GET`
- URL: `/v1/api/jadwal/get-for-iot`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  ```

**Response Sukses (200):**

```json
{
  "success": true,
  "message": "Data jadwal berhasil diambil",
  "data": [
    {
      "id": 1,
      "nama_obat": "Paracetamol",
      "slot_obat": "1",
      "jam_awal": "08:00",
      "jam_berakhir": "20:00"
    }
  ]
}
```

**Contoh cURL:**

```bash
curl -X GET http://163.53.195.57:5000/v1/api/jadwal/get-for-iot \
  -H "Authorization: Bearer <your_jwt_token>"
```

### PUT `/v1/api/jadwal/update-stock-obat-iot`

Update stok obat dari IoT device.

**Request:**

- Method: `PUT`
- URL: `/v1/api/jadwal/update-stock-obat-iot`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
  ```
- Body:

```json
{
  "id_obat": "1"
}
```

**Response Sukses (200):**

```json
{
  "success": true,
  "message": "Stock obat berhasil diperbarui",
  "data": {
    "id": 1,
    "jumlah_obat": 29
  }
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "ID obat harus diisi"
}
```

**Contoh cURL:**

```bash
curl -X PUT http://163.53.195.57:5000/v1/api/jadwal/update-stock-obat-iot \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "id_obat": "1"
  }'
```

### PUT `/v1/api/jadwal/update-stock-obat-web`

Update stok obat dari Web.

**Request:**

- Method: `PUT`
- URL: `/v1/api/jadwal/update-stock-obat-web`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
  ```
- Body:

```json
{
  "id_obat": "1",
  "newStock": 25
}
```

**Response Sukses (200):**

```json
{
  "success": true,
  "message": "Stock obat berhasil diperbarui",
  "data": {
    "id": 1,
    "jumlah_obat": 25
  }
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "ID obat dan stock baru harus diisi"
}
```

**Contoh cURL:**

```bash
curl -X PUT http://163.53.195.57:5000/v1/api/jadwal/update-stock-obat-web \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "id_obat": "1",
    "newStock": 25
  }'
```

### DELETE `/v1/api/jadwal/delete`

Hapus jadwal obat.

**Request:**

- Method: `DELETE`
- URL: `/v1/api/jadwal/delete`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
  ```
- Body:

```json
{
  "jadwal_id": "1"
}
```

**Response Sukses (200):**

```json
{
  "success": true,
  "message": "Jadwal berhasil dihapus"
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "ID jadwal harus diisi"
}
```

**Contoh cURL:**

```bash
curl -X DELETE http://163.53.195.57:5000/v1/api/jadwal/delete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "jadwal_id": "1"
  }'
```

## Endpoint History (Riwayat)

### POST `/v1/api/history/insert`

Membuat riwayat baru.

**Request:**

- Method: `POST`
- URL: `/v1/api/history/insert`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
  ```
- Body:

```json
{
  "id": "1",
  "status": "diminum"
}
```

**Response Sukses (201):**

```json
{
  "success": true,
  "message": "History berhasil dibuat"
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "ID dan status harus diisi"
}
```

**Contoh cURL:**

```bash
curl -X POST http://163.53.195.57:5000/v1/api/history/insert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "id": "1",
    "status": "diminum"
  }'
```

### GET `/v1/api/history/get-all`

Mendapatkan semua riwayat pengguna.

**Request:**

- Method: `GET`
- URL: `/v1/api/history/get-all`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  ```

**Response Sukses (200):**

```json
{
  "success": true,
  "message": "Data history berhasil diambil",
  "data": [
    {
      "id": 1,
      "user_id": "uuid-123",
      "jadwal_id": 1,
      "status": "diminum",
      "created_at": "2025-01-27T10:00:00Z"
    }
  ]
}
```

**Contoh cURL:**

```bash
curl -X GET http://163.53.195.57:5000/v1/api/history/get-all \
  -H "Authorization: Bearer <your_jwt_token>"
```

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

## Endpoint Kontrol (Medical Check-up)

### POST `/v1/api/kontrol/create`

Membuat jadwal kontrol medis baru.

**Request:**

- Method: `POST`
- URL: `/v1/api/kontrol/create`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
  ```
- Body:

```json
{
  "tanggal": "2025-08-01",
  "dokter": "Dr. John Smith",
  "waktu": "10:00",
  "nama_pasien": "Jane Doe"
}
```

**Response Sukses (201):**

```json
{
  "success": true,
  "message": "Kontrol berhasil dibuat",
  "data": {
    "id": 1,
    "user_id": "uuid-123",
    "tanggal": "2025-08-01",
    "dokter": "Dr. John Smith",
    "waktu": "10:00",
    "nama_pasien": "Jane Doe",
    "isDone": false,
    "created_at": "2025-07-27T12:00:00Z"
  }
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "Semua field harus diisi"
}
```

**Contoh cURL:**

```bash
curl -X POST http://163.53.195.57:5000/v1/api/kontrol/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "tanggal": "2025-08-01",
    "dokter": "Dr. John Smith",
    "waktu": "10:00",
    "nama_pasien": "Jane Doe"
  }'
```

### GET `/v1/api/kontrol/get`

Mendapatkan semua jadwal kontrol medis pengguna.

**Request:**

- Method: `GET`
- URL: `/v1/api/kontrol/get`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  ```

**Response Sukses (200):**

```json
{
  "success": true,
  "message": "Data kontrol berhasil diambil",
  "data": [
    {
      "id": 1,
      "user_id": "uuid-123",
      "tanggal": "2025-08-01",
      "dokter": "Dr. John Smith",
      "waktu": "10:00",
      "nama_pasien": "Jane Doe",
      "isDone": false,
      "created_at": "2025-07-27T12:00:00Z"
    }
  ]
}
```

**Contoh cURL:**

```bash
curl -X GET http://163.53.195.57:5000/v1/api/kontrol/get \
  -H "Authorization: Bearer <your_jwt_token>"
```

### PUT `/v1/api/kontrol/set-done`

Update status selesai jadwal kontrol medis.

**Request:**

- Method: `PUT`
- URL: `/v1/api/kontrol/set-done`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
  ```
- Body:

```json
{
  "id": "1",
  "isDone": true
}
```

**Response Sukses (200):**

```json
{
  "success": true,
  "message": "Status isDone berhasil diupdate"
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "ID dan status isDone harus diisi"
}
```

**Contoh cURL:**

```bash
curl -X PUT http://163.53.195.57:5000/v1/api/kontrol/set-done \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "id": "1",
    "isDone": true
  }'
```

### PUT `/v1/api/kontrol/edit/:id`

Edit jadwal kontrol medis.

**Request:**

- Method: `PUT`
- URL: `/v1/api/kontrol/edit/:id` (contoh: `/v1/api/kontrol/edit/1`)
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
  ```
- Parameters:
  - `id`: ID kontrol yang akan diedit (path parameter)
- Body:

```json
{
  "tanggal": "2025-08-05",
  "dokter": "Dr. Jane Smith",
  "waktu": "14:00",
  "nama_pasien": "John Doe"
}
```

**Response Sukses (200):**

```json
{
  "success": true,
  "message": "Kontrol berhasil diupdate",
  "data": {
    "id": 1,
    "tanggal": "2025-08-05",
    "dokter": "Dr. Jane Smith",
    "waktu": "14:00",
    "nama_pasien": "John Doe"
  }
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "ID kontrol harus diisi"
}
```

**Contoh cURL:**

```bash
curl -X PUT http://163.53.195.57:5000/v1/api/kontrol/edit/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "tanggal": "2025-08-05",
    "dokter": "Dr. Jane Smith",
    "waktu": "14:00",
    "nama_pasien": "John Doe"
  }'
```

### DELETE `/v1/api/kontrol/delete/:id`

Menghapus jadwal kontrol medis.

**Request:**

- Method: `DELETE`
- URL: `/v1/api/kontrol/delete/:id` (contoh: `/v1/api/kontrol/delete/1`)
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  ```
- Parameters:
  - `id`: ID kontrol yang akan dihapus (path parameter)

**Response:**

```json
{
  "success": true,
  "message": "Kontrol berhasil dihapus"
}
```

**Example:**

```bash
curl -X DELETE http://163.53.195.57:5000/v1/api/kontrol/delete/1 \
  -H "Authorization: Bearer <jwt_token>"
```

## Endpoint Peringatan

### POST `/v1/api/peringatan/create`

Membuat peringatan baru.

**Request:**

- Method: `POST`
- URL: `/v1/api/peringatan/create`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
  ```
- Body:

```json
{
  "id": "1",
  "pesan": "Obat hampir habis"
}
```

**Response Sukses (201):**

```json
{
  "success": true,
  "message": "Peringatan berhasil dibuat",
  "data": {
    "id": 1,
    "user_id": "uuid-123",
    "jadwal_id": "1",
    "pesan": "Obat hampir habis",
    "created_at": "2025-07-27T12:00:00Z"
  }
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "ID dan pesan harus diisi"
}
```

**Contoh cURL:**

```bash
curl -X POST http://163.53.195.57:5000/v1/api/peringatan/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "id": "1",
    "pesan": "Obat hampir habis"
  }'
```

### GET `/v1/api/peringatan/get-all`

Mendapatkan semua peringatan pengguna.

**Request:**

- Method: `GET`
- URL: `/v1/api/peringatan/get-all`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  ```

**Response Sukses (200):**

```json
{
  "success": true,
  "message": "Data peringatan berhasil diambil",
  "data": [
    {
      "id": 1,
      "user_id": "uuid-123",
      "jadwal_id": "1",
      "pesan": "Obat hampir habis",
      "created_at": "2025-07-27T12:00:00Z"
    }
  ]
}
```

**Contoh cURL:**

```bash
curl -X GET http://163.53.195.57:5000/v1/api/peringatan/get-all \
  -H "Authorization: Bearer <your_jwt_token>"
```

### GET `/v1/api/history/get-all`

Mendapatkan semua riwayat pengguna.

**Request:**

- Method: `GET`
- URL: `/v1/api/history/get-all`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  ```

**Response Sukses (200):**

```json
{
  "success": true,
  "message": "Data history berhasil diambil",
  "data": [
    {
      "id": 1,
      "user_id": "uuid-123",
      "jadwal_id": 1,
      "status": "diminum",
      "created_at": "2025-01-27T10:00:00Z"
    }
  ]
}
```

**Contoh cURL:**

```bash
curl -X GET http://163.53.195.57:5000/v1/api/history/get-all \
  -H "Authorization: Bearer <your_jwt_token>"
```

## Kode Status HTTP

| Kode | Deskripsi                                              |
| ---- | ------------------------------------------------------ |
| 200  | OK - Request berhasil                                  |
| 201  | Created - Resource berhasil dibuat                     |
| 400  | Bad Request - Parameter tidak valid atau tidak lengkap |
| 401  | Unauthorized - Token tidak valid atau tidak ada        |
| 404  | Not Found - Resource tidak ditemukan                   |
| 500  | Internal Server Error - Kesalahan pada server          |

## Penanganan Error

Semua error response menggunakan format yang konsisten:

```json
{
  "success": false,
  "message": "Pesan error yang jelas"
}
```

Untuk mode development, akan ada informasi tambahan:

```json
{
  "success": false,
  "message": "Pesan error yang jelas",
  "stack": "Stack trace error (hanya di development mode)"
}
```

## 📊 Endpoint History

### POST `/v1/api/history/insert`

Menambahkan history baru.

**Request:**

- Method: `POST`
- URL: `/v1/api/history/insert`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
  ```
- Body:

```json
{
  "id": "1",
  "status": "diminum"
}
```

**Response Sukses (201):**

```json
{
  "success": true,
  "message": "History berhasil dibuat"
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "ID dan status harus diisi"
}
```

**Contoh cURL:**

```bash
curl -X POST http://163.53.195.57:5000/v1/api/history/insert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "id": "1",
    "status": "diminum"
  }'
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

### DELETE `/v1/api/kontrol/delete/:id`

Menghapus jadwal kontrol medis.

**Request:**

- Method: `DELETE`
- URL: `/v1/api/kontrol/delete/:id` (contoh: `/v1/api/kontrol/delete/1`)
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  ```
- Parameters:
  - `id`: ID kontrol yang akan dihapus (path parameter)

**Response:**

```json
{
  "success": true,
  "message": "Kontrol berhasil dihapus"
}
```

**Example:**

```bash
curl -X DELETE http://163.53.195.57:5000/v1/api/kontrol/delete/1 \
  -H "Authorization: Bearer <jwt_token>"
```

## Endpoint Peringatan

### POST `/v1/api/peringatan/create`

Membuat peringatan baru.

**Request:**

- Method: `POST`
- URL: `/v1/api/peringatan/create`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
  ```
- Body:

```json
{
  "id": "1",
  "pesan": "Obat hampir habis"
}
```

**Response Sukses (201):**

```json
{
  "success": true,
  "message": "Peringatan berhasil dibuat",
  "data": {
    "id": 1,
    "user_id": "uuid-123",
    "jadwal_id": "1",
    "pesan": "Obat hampir habis",
    "created_at": "2025-07-27T12:00:00Z"
  }
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "ID dan pesan harus diisi"
}
```

**Contoh cURL:**

```bash
curl -X POST http://163.53.195.57:5000/v1/api/peringatan/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "id": "1",
    "pesan": "Obat hampir habis"
  }'
```

### GET `/v1/api/peringatan/get-all`

Mendapatkan semua peringatan pengguna.

**Request:**

- Method: `GET`
- URL: `/v1/api/peringatan/get-all`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  ```

**Response Sukses (200):**

```json
{
  "success": true,
  "message": "Data peringatan berhasil diambil",
  "data": [
    {
      "id": 1,
      "user_id": "uuid-123",
      "jadwal_id": "1",
      "pesan": "Obat hampir habis",
      "created_at": "2025-07-27T12:00:00Z"
    }
  ]
}
```

**Contoh cURL:**

```bash
curl -X GET http://163.53.195.57:5000/v1/api/peringatan/get-all \
  -H "Authorization: Bearer <your_jwt_token>"
```

### GET `/v1/api/history/get-all`

Mendapatkan semua riwayat pengguna.

**Request:**

- Method: `GET`
- URL: `/v1/api/history/get-all`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  ```

**Response Sukses (200):**

```json
{
  "success": true,
  "message": "Data history berhasil diambil",
  "data": [
    {
      "id": 1,
      "user_id": "uuid-123",
      "jadwal_id": 1,
      "status": "diminum",
      "created_at": "2025-01-27T10:00:00Z"
    }
  ]
}
```

**Contoh cURL:**

```bash
curl -X GET http://163.53.195.57:5000/v1/api/history/get-all \
  -H "Authorization: Bearer <your_jwt_token>"
```

## Kode Status HTTP

| Kode | Deskripsi                                              |
| ---- | ------------------------------------------------------ |
| 200  | OK - Request berhasil                                  |
| 201  | Created - Resource berhasil dibuat                     |
| 400  | Bad Request - Parameter tidak valid atau tidak lengkap |
| 401  | Unauthorized - Token tidak valid atau tidak ada        |
| 404  | Not Found - Resource tidak ditemukan                   |
| 500  | Internal Server Error - Kesalahan pada server          |

## Penanganan Error

Semua error response menggunakan format yang konsisten:

```json
{
  "success": false,
  "message": "Pesan error yang jelas"
}
```

Untuk mode development, akan ada informasi tambahan:

```json
{
  "success": false,
  "message": "Pesan error yang jelas",
  "stack": "Stack trace error (hanya di development mode)"
}
```

## 📊 Endpoint History

### POST `/v1/api/history/insert`

Menambahkan history baru.

**Request:**

- Method: `POST`
- URL: `/v1/api/history/insert`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
  ```
- Body:

```json
{
  "id": "1",
  "status": "diminum"
}
```

**Response Sukses (201):**

```json
{
  "success": true,
  "message": "History berhasil dibuat"
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "ID dan status harus diisi"
}
```

**Contoh cURL:**

```bash
curl -X POST http://163.53.195.57:5000/v1/api/history/insert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "id": "1",
    "status": "diminum"
  }'
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

### DELETE `/v1/api/kontrol/delete/:id`

Menghapus jadwal kontrol medis.

**Request:**

- Method: `DELETE`
- URL: `/v1/api/kontrol/delete/:id` (contoh: `/v1/api/kontrol/delete/1`)
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  ```
- Parameters:
  - `id`: ID kontrol yang akan dihapus (path parameter)

**Response:**

```json
{
  "success": true,
  "message": "Kontrol berhasil dihapus"
}
```

**Example:**

```bash
curl -X DELETE http://163.53.195.57:5000/v1/api/kontrol/delete/1 \
  -H "Authorization: Bearer <jwt_token>"
```

## Endpoint Peringatan

### POST `/v1/api/peringatan/create`

Membuat peringatan baru.

**Request:**

- Method: `POST`
- URL: `/v1/api/peringatan/create`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
  ```
- Body:

```json
{
  "id": "1",
  "pesan": "Obat hampir habis"
}
```

**Response Sukses (201):**

```json
{
  "success": true,
  "message": "Peringatan berhasil dibuat",
  "data": {
    "id": 1,
    "user_id": "uuid-123",
    "jadwal_id": "1",
    "pesan": "Obat hampir habis",
    "created_at": "2025-07-27T12:00:00Z"
  }
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "ID dan pesan harus diisi"
}
```

**Contoh cURL:**

```bash
curl -X POST http://163.53.195.57:5000/v1/api/peringatan/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "id": "1",
    "pesan": "Obat hampir habis"
  }'
```

### GET `/v1/api/peringatan/get-all`

Mendapatkan semua peringatan pengguna.

**Request:**

- Method: `GET`
- URL: `/v1/api/peringatan/get-all`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  ```

**Response Sukses (200):**

```json
{
  "success": true,
  "message": "Data peringatan berhasil diambil",
  "data": [
    {
      "id": 1,
      "user_id": "uuid-123",
      "jadwal_id": "1",
      "pesan": "Obat hampir habis",
      "created_at": "2025-07-27T12:00:00Z"
    }
  ]
}
```

**Contoh cURL:**

```bash
curl -X GET http://163.53.195.57:5000/v1/api/peringatan/get-all \
  -H "Authorization: Bearer <your_jwt_token>"
```

### GET `/v1/api/history/get-all`

Mendapatkan semua riwayat pengguna.

**Request:**

- Method: `GET`
- URL: `/v1/api/history/get-all`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  ```

**Response Sukses (200):**

```json
{
  "success": true,
  "message": "Data history berhasil diambil",
  "data": [
    {
      "id": 1,
      "user_id": "uuid-123",
      "jadwal_id": 1,
      "status": "diminum",
      "created_at": "2025-01-27T10:00:00Z"
    }
  ]
}
```

**Contoh cURL:**

```bash
curl -X GET http://163.53.195.57:5000/v1/api/history/get-all \
  -H "Authorization: Bearer <your_jwt_token>"
```

## Kode Status HTTP

| Kode | Deskripsi                                              |
| ---- | ------------------------------------------------------ |
| 200  | OK - Request berhasil                                  |
| 201  | Created - Resource berhasil dibuat                     |
| 400  | Bad Request - Parameter tidak valid atau tidak lengkap |
| 401  | Unauthorized - Token tidak valid atau tidak ada        |
| 404  | Not Found - Resource tidak ditemukan                   |
| 500  | Internal Server Error - Kesalahan pada server          |

## Penanganan Error

Semua error response menggunakan format yang konsisten:

```json
{
  "success": false,
  "message": "Pesan error yang jelas"
}
```

Untuk mode development, akan ada informasi tambahan:

```json
{
  "success": false,
  "message": "Pesan error yang jelas",
  "stack": "Stack trace error (hanya di development mode)"
}
```

## 📊 Endpoint History

### POST `/v1/api/history/insert`

Menambahkan history baru.

**Request:**

- Method: `POST`
- URL: `/v1/api/history/insert`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
  ```
- Body:

```json
{
  "id": "1",
  "status": "diminum"
}
```

**Response Sukses (201):**

```json
{
  "success": true,
  "message": "History berhasil dibuat"
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "ID dan status harus diisi"
}
```

**Contoh cURL:**

```bash
curl -X POST http://163.53.195.57:5000/v1/api/history/insert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "id": "1",
    "status": "diminum"
  }'
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

### DELETE `/v1/api/kontrol/delete/:id`

Menghapus jadwal kontrol medis.

**Request:**

- Method: `DELETE`
- URL: `/v1/api/kontrol/delete/:id` (contoh: `/v1/api/kontrol/delete/1`)
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  ```
- Parameters:
  - `id`: ID kontrol yang akan dihapus (path parameter)

**Response:**

```json
{
  "success": true,
  "message": "Kontrol berhasil dihapus"
}
```

**Example:**

```bash
curl -X DELETE http://163.53.195.57:5000/v1/api/kontrol/delete/1 \
  -H "Authorization: Bearer <jwt_token>"
```

## Endpoint Peringatan

### POST `/v1/api/peringatan/create`

Membuat peringatan baru.

**Request:**

- Method: `POST`
- URL: `/v1/api/peringatan/create`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
  ```
- Body:

```json
{
  "id": "1",
  "pesan": "Obat hampir habis"
}
```

**Response Sukses (201):**

```json
{
  "success": true,
  "message": "Peringatan berhasil dibuat",
  "data": {
    "id": 1,
    "user_id": "uuid-123",
    "jadwal_id": "1",
    "pesan": "Obat hampir habis",
    "created_at": "2025-07-27T12:00:00Z"
  }
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "ID dan pesan harus diisi"
}
```

**Contoh cURL:**

```bash
curl -X POST http://163.53.195.57:5000/v1/api/peringatan/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "id": "1",
    "pesan": "Obat hampir habis"
  }'
```

### GET `/v1/api/peringatan/get-all`

Mendapatkan semua peringatan pengguna.

**Request:**

- Method: `GET`
- URL: `/v1/api/peringatan/get-all`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  ```

**Response Sukses (200):**

```json
{
  "success": true,
  "message": "Data peringatan berhasil diambil",
  "data": [
    {
      "id": 1,
      "user_id": "uuid-123",
      "jadwal_id": "1",
      "pesan": "Obat hampir habis",
      "created_at": "2025-07-27T12:00:00Z"
    }
  ]
}
```

**Contoh cURL:**

```bash
curl -X GET http://163.53.195.57:5000/v1/api/peringatan/get-all \
  -H "Authorization: Bearer <your_jwt_token>"
```

### GET `/v1/api/history/get-all`

Mendapatkan semua riwayat pengguna.

**Request:**

- Method: `GET`
- URL: `/v1/api/history/get-all`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  ```

**Response Sukses (200):**

```json
{
  "success": true,
  "message": "Data history berhasil diambil",
  "data": [
    {
      "id": 1,
      "user_id": "uuid-123",
      "jadwal_id": 1,
      "status": "diminum",
      "created_at": "2025-01-27T10:00:00Z"
    }
  ]
}
```

**Contoh cURL:**

```bash
curl -X GET http://163.53.195.57:5000/v1/api/history/get-all \
  -H "Authorization: Bearer <your_jwt_token>"
```

## Kode Status HTTP

| Kode | Deskripsi                                              |
| ---- | ------------------------------------------------------ |
| 200  | OK - Request berhasil                                  |
| 201  | Created - Resource berhasil dibuat                     |
| 400  | Bad Request - Parameter tidak valid atau tidak lengkap |
| 401  | Unauthorized - Token tidak valid atau tidak ada        |
| 404  | Not Found - Resource tidak ditemukan                   |
| 500  | Internal Server Error - Kesalahan pada server          |

## Penanganan Error

Semua error response menggunakan format yang konsisten:

```json
{
  "success": false,
  "message": "Pesan error yang jelas"
}
```

Untuk mode development, akan ada informasi tambahan:

```json
{
  "success": false,
  "message": "Pesan error yang jelas",
  "stack": "Stack trace error (hanya di development mode)"
}
```

## 📊 Endpoint History

### POST `/v1/api/history/insert`

Menambahkan history baru.

**Request:**

- Method: `POST`
- URL: `/v1/api/history/insert`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
  ```
- Body:

```json
{
  "id": "1",
  "status": "diminum"
}
```

**Response Sukses (201):**

```json
{
  "success": true,
  "message": "History berhasil dibuat"
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "ID dan status harus diisi"
}
```

**Contoh cURL:**

```bash
curl -X POST http://163.53.195.57:5000/v1/api/history/insert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "id": "1",
    "status": "diminum"
  }'
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

### DELETE `/v1/api/kontrol/delete/:id`

Menghapus jadwal kontrol medis.

**Request:**

- Method: `DELETE`
- URL: `/v1/api/kontrol/delete/:id` (contoh: `/v1/api/kontrol/delete/1`)
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  ```
- Parameters:
  - `id`: ID kontrol yang akan dihapus (path parameter)

**Response:**

```json
{
  "success": true,
  "message": "Kontrol berhasil dihapus"
}
```

**Example:**

```bash
curl -X DELETE http://163.53.195.57:5000/v1/api/kontrol/delete/1 \
  -H "Authorization: Bearer <jwt_token>"
```

## Endpoint Peringatan

### POST `/v1/api/peringatan/create`

Membuat peringatan baru.

**Request:**

- Method: `POST`
- URL: `/v1/api/peringatan/create`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
  ```
- Body:

```json
{
  "id": "1",
  "pesan": "Obat hampir habis"
}
```

**Response Sukses (201):**

```json
{
  "success": true,
  "message": "Peringatan berhasil dibuat",
  "data": {
    "id": 1,
    "user_id": "uuid-123",
    "jadwal_id": "1",
    "pesan": "Obat hampir habis",
    "created_at": "2025-07-27T12:00:00Z"
  }
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "ID dan pesan harus diisi"
}
```

**Contoh cURL:**

```bash
curl -X POST http://163.53.195.57:5000/v1/api/peringatan/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "id": "1",
    "pesan": "Obat hampir habis"
  }'
```

### GET `/v1/api/peringatan/get-all`

Mendapatkan semua peringatan pengguna.

**Request:**

- Method: `GET`
- URL: `/v1/api/peringatan/get-all`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  ```

**Response Sukses (200):**

```json
{
  "success": true,
  "message": "Data peringatan berhasil diambil",
  "data": [
    {
      "id": 1,
      "user_id": "uuid-123",
      "jadwal_id": "1",
      "pesan": "Obat hampir habis",
      "created_at": "2025-07-27T12:00:00Z"
    }
  ]
}
```

**Contoh cURL:**

```bash
curl -X GET http://163.53.195.57:5000/v1/api/peringatan/get-all \
  -H "Authorization: Bearer <your_jwt_token>"
```

### GET `/v1/api/history/get-all`

Mendapatkan semua riwayat pengguna.

**Request:**

- Method: `GET`
- URL: `/v1/api/history/get-all`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  ```

**Response Sukses (200):**

```json
{
  "success": true,
  "message": "Data history berhasil diambil",
  "data": [
    {
      "id": 1,
      "user_id": "uuid-123",
      "jadwal_id": 1,
      "status": "diminum",
      "created_at": "2025-01-27T10:00:00Z"
    }
  ]
}
```

**Contoh cURL:**

```bash
curl -X GET http://163.53.195.57:5000/v1/api/history/get-all \
  -H "Authorization: Bearer <your_jwt_token>"
```

## Kode Status HTTP

| Kode | Deskripsi                                              |
| ---- | ------------------------------------------------------ |
| 200  | OK - Request berhasil                                  |
| 201  | Created - Resource berhasil dibuat                     |
| 400  | Bad Request - Parameter tidak valid atau tidak lengkap |
| 401  | Unauthorized - Token tidak valid atau tidak ada        |
| 404  | Not Found - Resource tidak ditemukan                   |
| 500  | Internal Server Error - Kesalahan pada server          |

## Penanganan Error

Semua error response menggunakan format yang konsisten:

```json
{
  "success": false,
  "message": "Pesan error yang jelas"
}
```

Untuk mode development, akan ada informasi tambahan:

```json
{
  "success": false,
  "message": "Pesan error yang jelas",
  "stack": "Stack trace error (hanya di development mode)"
}
```

## 📊 Endpoint History

### POST `/v1/api/history/insert`

Menambahkan history baru.

**Request:**

- Method: `POST`
- URL: `/v1/api/history/insert`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
  ```
- Body:

```json
{
  "id": "1",
  "status": "diminum"
}
```

**Response Sukses (201):**

```json
{
  "success": true,
  "message": "History berhasil dibuat"
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "ID dan status harus diisi"
}
```

**Contoh cURL:**

```bash
curl -X POST http://163.53.195.57:5000/v1/api/history/insert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "id": "1",
    "status": "diminum"
  }'
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

### DELETE `/v1/api/kontrol/delete/:id`

Menghapus jadwal kontrol medis.

**Request:**

- Method: `DELETE`
- URL: `/v1/api/kontrol/delete/:id` (contoh: `/v1/api/kontrol/delete/1`)
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  ```
- Parameters:
  - `id`: ID kontrol yang akan dihapus (path parameter)

**Response:**

```json
{
  "success": true,
  "message": "Kontrol berhasil dihapus"
}
```

**Example:**

```bash
curl -X DELETE http://163.53.195.57:5000/v1/api/kontrol/delete/1 \
  -H "Authorization: Bearer <jwt_token>"
```

## Endpoint Peringatan

### POST `/v1/api/peringatan/create`

Membuat peringatan baru.

**Request:**

- Method: `POST`
- URL: `/v1/api/peringatan/create`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
  ```
- Body:

```json
{
  "id": "1",
  "pesan": "Obat hampir habis"
}
```

**Response Sukses (201):**

```json
{
  "success": true,
  "message": "Peringatan berhasil dibuat",
  "data": {
    "id": 1,
    "user_id": "uuid-123",
    "jadwal_id": "1",
    "pesan": "Obat hampir habis",
    "created_at": "2025-07-27T12:00:00Z"
  }
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "ID dan pesan harus diisi"
}
```

**Contoh cURL:**

```bash
curl -X POST http://163.53.195.57:5000/v1/api/peringatan/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "id": "1",
    "pesan": "Obat hampir habis"
  }'
```

### GET `/v1/api/peringatan/get-all`

Mendapatkan semua peringatan pengguna.

**Request:**

- Method: `GET`
- URL: `/v1/api/peringatan/get-all`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  ```

**Response Sukses (200):**

```json
{
  "success": true,
  "message": "Data peringatan berhasil diambil",
  "data": [
    {
      "id": 1,
      "user_id": "uuid-123",
      "jadwal_id": "1",
      "pesan": "Obat hampir habis",
      "created_at": "2025-07-27T12:00:00Z"
    }
  ]
}
```

**Contoh cURL:**

```bash
curl -X GET http://163.53.195.57:5000/v1/api/peringatan/get-all \
  -H "Authorization: Bearer <your_jwt_token>"
```

### GET `/v1/api/history/get-all`

Mendapatkan semua riwayat pengguna.

**Request:**

- Method: `GET`
- URL: `/v1/api/history/get-all`
- Authentication: Required
- Headers:
  ```
  Authorization: Bearer <jwt_token>
  ```

**Response Sukses (200):**

```json
{
  "success": true,
  "message": "Data history berhasil diambil",
  "data": [
    {
      "id": 1,
      "user_id": "uuid-123",
      "jadwal_id": 1,
      "status": "diminum",
      "created_at": "2025-01-27T10:00:00Z"
    }
  ]
}
```

**Contoh cURL:**

```bash
curl -X GET http://163.53.195.57:5000/v1/api/history/get-all \
  -H "Authorization: Bearer <your_jwt_token>"
```

## Kode Status HTTP

| Kode | Deskripsi                                              |
| ---- | ------------------------------------------------------ |
| 200  | OK - Request berhasil                                  |
| 201  | Created - Resource berhasil dibuat                     |
| 400  | Bad Request - Parameter tidak valid atau tidak lengkap |
| 401  | Unauthorized - Token tidak valid atau tidak ada        |
| 404  | Not Found - Resource tidak ditemukan                   |
| 500  | Internal Server Error - Kesalahan pada server          |

## Penanganan Error

Semua error response menggunakan format yang konsisten:

```json
{
  "success": false,
  "message": "Pesan error yang jelas"
}
```

Untuk mode development, akan ada informasi tambahan:

```json
{
  "success": false,
  "message": "Pesan error yang jelas",
  "stack": "Stack trace error (hanya di development mode)"
}
```
