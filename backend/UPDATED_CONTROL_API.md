# ✅ Updated: Control API with Dual WhatsApp Reminders

## 🎯 Status: **UPDATED & READY**

Sistem kontrol dengan dual WhatsApp reminder telah diperbarui sesuai struktur database terbaru.

## 🏗️ Updated Database Structure

### Kontrol Table ✅

```sql
CREATE TABLE public.kontrol (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  profile_id uuid NOT NULL,
  tanggal date NOT NULL,
  dokter text NOT NULL,
  waktu text,
  isDone boolean DEFAULT false,
  nama_pasien text,
  wablas_schedule_id ARRAY,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

### Kontrol WA Reminders Table ✅

```sql
CREATE TABLE public.kontrol_wa_reminders (
  id uuid PRIMARY KEY,
  kontrol_id uuid NOT NULL,
  user_id uuid NOT NULL,
  reminder_types ARRAY NOT NULL,        -- ["1_day_before", "4_hours_before"]
  reminder_times ARRAY NOT NULL,        -- ["2025-08-09 10:00", "2025-08-10 06:00"]
  wablas_schedule_ids ARRAY NOT NULL,   -- ["wbl_001", "wbl_002"]
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),

  CONSTRAINT fk_kontrol_wa_reminders_kontrol
    FOREIGN KEY (kontrol_id) REFERENCES public.kontrol(id)
);
```

## 🚀 Updated API Endpoint

### POST `/v1/api/kontrol/create-kontrol`

Membuat kontrol baru dengan **dual WhatsApp reminders** otomatis.

#### Request Body ✅

```json
{
  "tanggal": "2025-08-10",
  "waktu": "10:00",
  "dokter": "Dr. Example",
  "nama_pasien": "John Doe"
}
```

#### Response Success (201) ✅

```json
{
  "success": true,
  "message": "Kontrol berhasil dibuat",
  "data": {
    "id": "uuid-123",
    "user_id": "uuid-456",
    "profile_id": "uuid-789",
    "tanggal": "2025-08-10",
    "waktu": "10:00",
    "dokter": "Dr. Example",
    "nama_pasien": "John Doe",
    "isDone": false,
    "wablas_schedule_id": ["wbl_001", "wbl_002"],
    "created_at": "2025-08-07T10:00:00Z",
    "updated_at": "2025-08-07T10:00:00Z"
  }
}
```

#### Automatic WhatsApp Reminders Created ✅

1. **24 hours before**: 2025-08-09 10:00
2. **4 hours before**: 2025-08-10 06:00

#### Example cURL ✅

```bash
curl -X POST http://163.53.195.57:5000/v1/api/kontrol/create-kontrol \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "tanggal": "2025-08-10",
    "waktu": "10:00",
    "dokter": "Dr. Example",
    "nama_pasien": "John Doe"
  }'
```

## 🔄 Flow Process

### 1. User Request ✅

- User sends POST request dengan data kontrol
- System ambil phone number dari user profile

### 2. Control Creation ✅

```javascript
// 1. Insert control ke database
const inserted = await supabase.from("kontrol").insert([
  {
    user_id,
    profile_id,
    tanggal: "2025-08-10",
    waktu: "10:00",
    dokter: "Dr. Example",
    nama_pasien: "John Doe",
  },
]);

// 2. Calculate reminder times
const reminderTimes = calculateControlReminderTimes("2025-08-10", "10:00");
// Returns: [
//   { type: "1_day_before", date: "2025-08-09", time: "10:00" },
//   { type: "4_hours_before", date: "2025-08-10", time: "06:00" }
// ]

// 3. Create Wablas schedules
for (const reminderTime of reminderTimes) {
  const scheduleResponse = await createWablasSchedule(
    phone,
    message,
    reminderTime.date,
    reminderTime.time
  );
  scheduleIds.push(scheduleResponse.id);
}

// 4. Save reminder data
await supabase.from("kontrol_wa_reminders").insert([
  {
    kontrol_id: inserted.id,
    user_id,
    reminder_types: ["1_day_before", "4_hours_before"],
    reminder_times: ["2025-08-09 10:00", "2025-08-10 06:00"],
    wablas_schedule_ids: ["wbl_001", "wbl_002"],
  },
]);
```

## 📱 WhatsApp Messages

### Message 1 (24h before) ✅

```
🩺 *Pengingat Kontrol Dokter*

🗓️ *Besok Anda memiliki jadwal kontrol*

📅 Tanggal: 2025-08-10
⏰ Waktu: 10:00
👨‍⚕️ Dokter: Dr. Example
👤 Pasien: John Doe

Jangan lupa untuk datang tepat waktu ya! 😊

_Pesan otomatis dari SmedBox_
```

### Message 2 (4h before) ✅

```
🩺 *Pengingat Kontrol Dokter*

⏰ *Segera! Kontrol dokter dalam 4 jam*

📅 Tanggal: 2025-08-10
⏰ Waktu: 10:00
👨‍⚕️ Dokter: Dr. Example
👤 Pasien: John Doe

Jangan lupa untuk datang tepat waktu ya! 😊

_Pesan otomatis dari SmedBox_
```

## ✅ Updated Code Files

### Services ✅

- `controlService.js` - Updated field mapping: `tanggal`, `waktu`, `dokter`, `nama_pasien`
- `wablasScheduleService.js` - Dual reminder calculation and message generation

### Controllers ✅

- `controlController.js` - Updated request body mapping

### Database ✅

- `supabse.sql` - Updated with correct kontrol table structure

## 🎯 Ready for Testing

Server sudah running dan siap untuk test:

- ✅ Database structure updated
- ✅ API endpoints updated
- ✅ Field mapping corrected
- ✅ Dual reminder system active

**Mari test API endpoint dengan data sesuai struktur baru!** 🚀
