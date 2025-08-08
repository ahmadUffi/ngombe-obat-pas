# WhatsApp Message API Documentation

## Overview

API untuk mengirim pesan WhatsApp menggunakan Wablas service. Mendukung single message dan bulk message.

## Base URL

```
http://localhost:5000/v1/api/message
```

## Authentication

Menggunakan Supabase JWT token dalam header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Send Single Message

**POST** `/send`

Mengirim pesan WhatsApp ke satu nomor tujuan.

#### Request Body

```json
{
  "phone": "+6281234567890",
  "message": "Hello, this is a test message",
  "type": "text"
}
```

#### Parameters

- `phone` (string, required): Nomor telepon tujuan (format: +62xxx atau 08xxx)
- `message` (string, required): Isi pesan yang akan dikirim
- `type` (string, optional): Tipe pesan ("text", "image", "document"). Default: "text"

#### Response Success

```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messageId": "msg_12345",
    "phone": "6281234567890",
    "sentAt": "2025-08-07T10:30:00.000Z",
    "type": "text"
  }
}
```

#### Response Error

```json
{
  "success": false,
  "message": "Failed to send message",
  "error": "Invalid phone number format"
}
```

### 2. Send Bulk Message

**POST** `/send-bulk`

Mengirim pesan WhatsApp ke multiple nomor tujuan sekaligus.

#### Request Body

```json
{
  "recipients": [
    "+6281234567890",
    "+6289876543210",
    {
      "phone": "+6285555555555",
      "message": "Custom message for this recipient"
    }
  ],
  "message": "Default message for all recipients",
  "type": "text"
}
```

#### Parameters

- `recipients` (array, required): Array nomor telepon atau objek dengan phone dan custom message
- `message` (string, required): Pesan default untuk semua penerima
- `type` (string, optional): Tipe pesan ("text", "image", "document"). Default: "text"

#### Response Success

```json
{
  "success": true,
  "message": "Bulk message completed. Sent: 2, Failed: 1",
  "data": {
    "sent": [
      {
        "phone": "6281234567890",
        "messageId": "msg_12345",
        "status": "sent"
      }
    ],
    "failed": [
      {
        "phone": "6289876543210",
        "error": "Invalid phone number",
        "status": "failed"
      }
    ],
    "summary": {
      "total": 3,
      "successful": 2,
      "failed": 1
    }
  }
}
```

## Error Codes

| Code | Message                               | Description                               |
| ---- | ------------------------------------- | ----------------------------------------- |
| 400  | Phone number and message are required | Missing required parameters               |
| 400  | Invalid phone number format           | Nomor telepon tidak valid                 |
| 400  | Recipients array is required          | Array recipients kosong atau tidak ada    |
| 400  | Maximum 100 recipients allowed        | Terlalu banyak recipients dalam bulk send |
| 401  | Token tidak valid                     | JWT token tidak valid atau expired        |
| 500  | Internal server error                 | Server error                              |

## Phone Number Format

API mendukung berbagai format nomor telepon:

- `+6281234567890` (international format)
- `6281234567890` (without +)
- `081234567890` (local format, akan dikonversi ke 62xxx)

## Rate Limiting

- Single message: No limit
- Bulk message: 1 detik delay antar pesan untuk menghindari rate limiting Wablas

## Examples

### Curl Example - Single Message

```bash
curl -X POST "http://localhost:5000/v1/api/message/send" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "phone": "+6281234567890",
    "message": "Hello from SmedBox API!",
    "type": "text"
  }'
```

### Curl Example - Bulk Message

```bash
curl -X POST "http://localhost:5000/v1/api/message/send-bulk" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "recipients": [
      "+6281234567890",
      "+6289876543210"
    ],
    "message": "Bulk message from SmedBox API!",
    "type": "text"
  }'
```

## Environment Variables Required

```env
WABLAS_TOKEN=your_wablas_token
WABLAS_SECRET_KEY=your_wablas_secret_key
```
