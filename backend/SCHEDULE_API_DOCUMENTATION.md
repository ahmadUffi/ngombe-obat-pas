# 📅 WhatsApp Schedule API Documentation

## 🎯 Overview

API untuk membuat jadwal pengingat WhatsApp menggunakan Wablas Schedule endpoint. Terinspirasi dari contoh PHP yang diberikan dan mengikuti response format yang sama.

## 🔧 Wablas Schedule Endpoint

**Base Endpoint**: `https://sby.wablas.com/api/schedule`

**PHP Example Response**:

```json
{
  "status": true,
  "category": "text",
  "message": "Scheduled Messages is succesfully saved and waiting to be processed",
  "phones list": ["0876564546565"],
  "messages": [
    {
      "id": "8d554adc-7279-4864-adbd-7407e47e6b9d",
      "phone": "62876564546565",
      "message": "text",
      "status": true,
      "timezone": "Asia/Jakarta",
      "schedule_at": "2022-05-20 13:20:00"
    }
  ]
}
```

## 📋 API Endpoints

### 1. Create Control with Schedule (Enhanced)

**Endpoint**: `POST /v1/api/kontrol/create-kontrol`

**Description**: Membuat appointment kontrol dokter dengan otomatis membuat WhatsApp schedule reminder 1 hari sebelumnya jam 09:00.

**Headers**:

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "tanggal": "2025-08-10",
  "dokter": "Dr. Ahmad Fauzi, Sp.PD",
  "waktu": "14:00",
  "nama_pasien": "John Doe",
  "enableReminder": true
}
```

**Response**:

```json
{
  "success": true,
  "message": "Kontrol berhasil dibuat",
  "data": {
    "id": "uuid-here",
    "tanggal": "2025-08-10",
    "dokter": "Dr. Ahmad Fauzi, Sp.PD",
    "waktu": "14:00",
    "nama_pasien": "John Doe",
    "isDone": false,
    "created_at": "2025-08-07T10:30:00.000Z"
  }
}
```

**WhatsApp Reminder**:

- **Scheduled Date**: 2025-08-09 (1 day before control date)
- **Scheduled Time**: 09:00:00
- **Timezone**: Asia/Jakarta

---

### 2. Create Manual Schedule Reminder

**Endpoint**: `POST /v1/api/schedule/create-control-reminder`

**Description**: Membuat WhatsApp schedule reminder secara manual dengan kontrol penuh atas date, time, dan message.

**Headers**:

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "control_id": "uuid-optional",
  "phone": "081234567890",
  "date": "2025-08-08",
  "time": "09:00:00",
  "timezone": "Asia/Jakarta",
  "message": "Custom reminder message",
  "custom_message": "Alternative message field"
}
```

**Response**:

```json
{
  "success": true,
  "message": "WhatsApp schedule reminder created successfully",
  "data": {
    "wablas_response": {
      "status": true,
      "category": "text",
      "message": "Scheduled Messages is succesfully saved and waiting to be processed",
      "phones list": ["62812345678"],
      "messages": [
        {
          "id": "8d554adc-7279-4864-adbd-7407e47e6b9d",
          "phone": "62812345678",
          "message": "Custom reminder message",
          "status": true,
          "timezone": "Asia/Jakarta",
          "schedule_at": "2025-08-08 09:00:00"
        }
      ]
    },
    "schedule_id": "8d554adc-7279-4864-adbd-7407e47e6b9d",
    "scheduled_for": "2025-08-08 09:00:00",
    "phone": "62812345678",
    "database_record": {
      "id": "uuid",
      "control_id": "uuid-optional",
      "scheduled_date": "2025-08-08",
      "scheduled_time": "09:00:00",
      "wablas_schedule_id": "8d554adc-7279-4864-adbd-7407e47e6b9d"
    }
  }
}
```

---

### 3. Get User Schedule Reminders

**Endpoint**: `GET /v1/api/schedule/get-user-reminders`

**Description**: Mengambil semua schedule reminder aktif untuk user.

**Headers**:

```
Authorization: Bearer <jwt_token>
```

**Response**:

```json
{
  "success": true,
  "message": "Schedule reminders retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "control_id": "uuid",
      "scheduled_date": "2025-08-08",
      "scheduled_time": "09:00:00",
      "wablas_schedule_id": "8d554adc-7279-4864-adbd-7407e47e6b9d",
      "message_content": "🩺 *Pengingat Kontrol Dokter*...",
      "is_active": true,
      "created_at": "2025-08-07T10:30:00.000Z",
      "control": {
        "tanggal": "2025-08-09",
        "dokter": "Dr. Ahmad Fauzi, Sp.PD",
        "waktu": "14:00",
        "nama_pasien": "John Doe"
      }
    }
  ],
  "count": 1
}
```

---

### 4. Test Wablas Schedule API

**Endpoint**: `POST /v1/api/schedule/test-wablas-schedule`

**Description**: Test endpoint untuk memverifikasi integrasi Wablas Schedule API. Schedule untuk 1 menit ke depan.

**Headers**:

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "phone": "081234567890",
  "message": "Test message from SmedBox"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Test schedule created successfully",
  "data": {
    "status": true,
    "category": "text",
    "message": "Scheduled Messages is succesfully saved and waiting to be processed",
    "phones list": ["62812345678"],
    "messages": [
      {
        "id": "test-uuid",
        "phone": "62812345678",
        "message": "Test message from SmedBox",
        "status": true,
        "timezone": "Asia/Jakarta",
        "schedule_at": "2025-08-07 10:31:00"
      }
    ]
  },
  "scheduled_for": "2025-08-07 10:31:00",
  "phone": "62812345678"
}
```

---

## 🔧 Implementation Details

### Database Schema

**Simplified Approach**: Add column directly to existing `kontrol` table

```sql
-- Add wablas_schedule_id column to kontrol table
ALTER TABLE public.kontrol
ADD COLUMN wablas_schedule_id text;

-- Add index for better performance
CREATE INDEX idx_kontrol_wablas_schedule_id ON public.kontrol(wablas_schedule_id);
```

**Column Details**:

- `wablas_schedule_id text` - Stores the ID returned by Wablas schedule API
- `NULL` value means no WhatsApp reminder scheduled
- Non-null value indicates active WhatsApp schedule### Environment Variables

```bash
# .env
WABLAS_TOKEN=your_wablas_token_here
WABLAS_SECRET_KEY=your_wablas_secret_key_here
```

### Phone Number Formatting

Input formats yang didukung:

- `08123456789` → `628123456789`
- `8123456789` → `628123456789`
- `628123456789` → `628123456789`
- `+628123456789` → `628123456789`

### Default Message Format

```
🩺 *Pengingat Kontrol Dokter*

📅 Tanggal: 2025-08-10
⏰ Waktu: 14:00
👨‍⚕️ Dokter: Dr. Ahmad Fauzi, Sp.PD
👤 Pasien: John Doe

Jangan lupa untuk datang tepat waktu ya! 😊

_Pesan otomatis dari SmedBox_
```

---

## 🧪 Testing

**File**: `test-schedule-api.js`

```bash
# Update token dan phone number di file test
node test-schedule-api.js
```

**Test Coverage**:

- ✅ Phone number formatting
- ✅ Create control with automatic schedule
- ✅ Manual schedule creation
- ✅ Get user reminders
- ✅ Wablas API integration test

---

## ⚠️ Error Handling

### Common Errors:

**1. Missing Phone Number**:

```json
{
  "success": false,
  "message": "Nomor HP tidak ditemukan. Mohon lengkapi profile terlebih dahulu."
}
```

**2. Invalid Phone Format**:

```json
{
  "success": false,
  "message": "Invalid phone number format"
}
```

**3. Wablas API Error**:

```json
{
  "success": false,
  "message": "Failed to create Wablas schedule",
  "error": "token invalid"
}
```

**4. Missing Required Fields**:

```json
{
  "success": false,
  "message": "Phone, date, and time are required fields"
}
```

---

## 🔮 Features

### ✅ Implemented

- [x] Automatic schedule creation saat membuat control
- [x] Manual schedule creation dengan custom parameters
- [x] Database integration untuk tracking
- [x] Phone number auto-formatting
- [x] Error handling yang robust
- [x] Test endpoints
- [x] CASCADE delete saat control dihapus

### 🚧 Future Enhancements

- [ ] Batch schedule creation
- [ ] Custom reminder time preferences
- [ ] Schedule cancellation via Wablas API
- [ ] Schedule status tracking (sent/delivered)
- [ ] Multiple reminder times per control
- [ ] WhatsApp template messages

---

_Created: August 7, 2025_
_Based on PHP example with Wablas schedule endpoint_
