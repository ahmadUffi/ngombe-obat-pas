# SmedBox Backend API Documentation

Base URL: http://163.53.195.57:5000
All routes are prefixed with /v1/api

Auth: Most routes require a Supabase JWT in the Authorization header.

- Authorization: Bearer <access_token>
- Content-Type: application/json unless otherwise noted

Note: Database timestamps created_at and updated_at are managed automatically by Supabase.

## Auth

POST /v1/api/login

- Body: { email: string, password: string }
- Response: { access_token: string, ... }

Example (PowerShell):

# Login

curl -Method Post -Uri "http://163.53.195.57:5000/v1/api/login" -ContentType 'application/json' -Body '{"email":"user@example.com","password":"secret"}'

## Forgot Password

POST /v1/api/forgot-password

- Body: { email: string }
- Response: Always returns success message if format is valid; actual email delivery depends on registration status.

## Jadwal (Medication Schedules)

POST /v1/api/jadwal/input (auth)

- Create a new jadwal (medication schedule) for the authenticated user.
- Body: see frontend forms; includes fields such as nama_obat, kategori, slot_obat (A-F), dosis_obat, jumlah_obat, jam_awal[], jam_berakhir[], catatan.
- Response: { message: "Jadwal berhasil dibuat" }

GET /v1/api/jadwal/get-for-web (auth)

- Get all schedules for the authenticated user (web-oriented shape).
- Response: JSON list of schedules.

GET /v1/api/jadwal/get-for-iot (auth)

- Get schedules for IoT consumption (flattened per time window).
- Response: { jadwalMinum: Array<...> } where each entry includes id, nama_pasien, nama_obat, dosis_obat, jumlah_obat, kategori, slot_obat, catatan, jam_awal[], jam_berakhir[].

PUT /v1/api/jadwal/update-stock-obat-iot

- Decrement stock for a given jadwal (1 dose per call). Used by device when slot opened.
- Body: { id_obat: string }
- Response: includes new stock value and status messaging.
- Note: This endpoint currently does not enforce JWT in code; the device may still send Authorization.

PUT /v1/api/jadwal/update-stock-obat-web

- Update stock to an explicit value (web UI).
- Body: { id_obat: string, newStock: number }

DELETE /v1/api/jadwal/delete/:jadwal_id (auth)

- Delete a jadwal owned by the authenticated user.

## History

POST /v1/api/history/input-history (auth)

- Insert a history entry for a jadwal.
- Body: { id: string, status: string }
  - Examples: "stock habis", "stock menipis", "stock diisi ulang", "obat diminum", "obat terlewat".
- Response: { success: true, message: "History berhasil dibuat" }

GET /v1/api/history/get-all-history (auth)

- List all history rows for the authenticated user.

## Peringatan (Warnings)

POST /v1/api/peringatan/create-peringatan (auth)

- Create a warning entry for the authenticated user.
- Body: { id: string, pesan: string }
  - id is the jadwal id.
  - pesan is a short message. Suggested default for slot opens: "peringatan pasien mencoba membuka obat ${nama_obat} pada slot${slot_obat}" (device may construct the message; DB will store it).
- Response: { success: true, message: "Peringatan berhasil dibuat", data }

GET /v1/api/peringatan/get-all-peringatan (auth)

- Get all peringatan for the authenticated user.

## Profile

PUT /v1/api/profile/update (auth, multipart/form-data)

- Update profile fields and optional profile image.
- Form fields:
  - username: string (optional)
  - no_hp: string (optional)
  - image: file (optional, field name: image, max 5MB)
- Behavior:
  - Phone number changes trigger recreation of jadwal WhatsApp reminders and active control schedules.
- Responses:
  - 200 on success; 400 if image too large or invalid.

GET /v1/api/profile/me (auth)

- Returns the authenticated user's profile.
- Response: { success: true, data: { id, user_id, username, email, no_hp } }

## Control (Kontrol)

All routes require auth.

POST /v1/api/kontrol/create-kontrol
GET /v1/api/kontrol/get-all-kontrol
PATCH /v1/api/kontrol/done
PUT /v1/api/kontrol/edit/:id
DELETE /v1/api/kontrol/delete/:id

## Notes

All routes require auth.

GET /v1/api/notes

- Optional query: ?category=kontrol|pengingat|lainnya|obat|dokter
  GET /v1/api/notes/search
- Query: ?q=search_text
  GET /v1/api/notes/stats
  GET /v1/api/notes/:noteId
  POST /v1/api/notes
- Body: { category, message }
  PUT /v1/api/notes/:noteId
  DELETE /v1/api/notes/:noteId

## Messages (WhatsApp)

POST /v1/api/message/send (auth)

- Body: { phone: string, message: string, type?: 'text' }
- Normalizes Indonesian phone numbers to 62 format; returns sent status.

POST /v1/api/message/send-bulk (auth)

- Body: { recipients: Array<string|{phone,message}>, message: string, type?: 'text' }

Development-only (no auth):

- POST /v1/api/message/test/send
- POST /v1/api/message/test/send-bulk

## Admin

POST /v1/api/admin/cron/stock-check (auth + admin)

- Triggers the stock check cron logic once immediately.
- Response: { success: true, result: { total, lowCount, emptyCount } }

## Common error shapes

- 400 Bad Request: { success: false, message: string, ... }
- 401 Unauthorized: missing/invalid token.
- 403 Forbidden: not admin (for admin endpoints).
- 500 Internal Server Error: { error: string } or { success: false, message: string }

## IoT quick flow

1. Login to obtain token
2. GET /v1/api/jadwal/get-for-iot with Bearer token
3. When user opens the correct slot inside the time window:
   - PUT /v1/api/jadwal/update-stock-obat-iot { id_obat }
   - Optional: POST /v1/api/history/input-history { id: id_obat, status: "obat diminum" }
   - Optional: POST /v1/api/peringatan/create-peringatan { id: id_obat, pesan: "peringatan pasien mencoba membuka obat ..." }
4. Refresh schedule data periodically or after updates.

## Notes on behavior

- Stock cron (if enabled via env) will send WhatsApp alerts for low stock and out-of-stock on each run and write history rows. Out-of-stock pauses/removes WhatsApp reminders; refills recreate them.
- Phone number changes (profile update) will rebuild relevant WhatsApp reminders/schedules automatically.
