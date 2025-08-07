# Dual Control Reminder System

## Overview

System notifikasi ganda untuk jadwal kontrol dokter yang mengirim 2 peringatan WhatsApp otomatis:

1. **24 jam sebelumnya** - di jam yang sama dengan jadwal asli
2. **4 jam sebelumnya** - 4 jam sebelum waktu jadwal

## Architecture

### Database Schema

```sql
-- kontrol table dengan array storage
ALTER TABLE kontrol ADD COLUMN wablas_schedule_ids text[];
```

### Service Structure

- `wablasScheduleService.js` - Perhitungan waktu dan integrasi Wablas API
- `controlService.js` - Business logic untuk manajemen kontrol
- `scheduleController.js` - API endpoints untuk manajemen manual

## Implementation Details

### 1. Time Calculation Logic

```javascript
export const calculateControlReminderTimes = (jadwalDate, jamMulai) => {
  const appointmentDateTime = new Date(`${jadwalDate}T${jamMulai}`);

  // Reminder 1: 1 day before at same time
  const reminder1 = new Date(appointmentDateTime);
  reminder1.setDate(reminder1.getDate() - 1);

  // Reminder 2: 4 hours before
  const reminder2 = new Date(appointmentDateTime);
  reminder2.setHours(reminder2.getHours() - 4);

  return [
    {
      date: reminder1.toISOString().split("T")[0],
      time: reminder1.toTimeString().slice(0, 5),
      type: "1_day_before",
      scheduledFor: appointmentDateTime,
    },
    {
      date: reminder2.toISOString().split("T")[0],
      time: reminder2.toTimeString().slice(0, 5),
      type: "4_hours_before",
      scheduledFor: appointmentDateTime,
    },
  ];
};
```

### 2. Message Generation

```javascript
export const generateControlReminderMessageWithTiming = (
  controlData,
  reminderTime
) => {
  const appointmentDate = new Date(
    controlData.jadwal_tanggal
  ).toLocaleDateString("id-ID");
  const appointmentTime = controlData.jam_mulai;
  const timingInfo =
    reminderTime.type === "1_day_before"
      ? "besok"
      : `${Math.abs(
          new Date(reminderTime.scheduledFor) - new Date()
        )} jam lagi`;

  return (
    `🏥 *Pengingat Jadwal Kontrol*\n\n` +
    `Halo! Ini pengingat untuk jadwal kontrol Anda:\n\n` +
    `📅 **Tanggal:** ${appointmentDate}\n` +
    `⏰ **Waktu:** ${appointmentTime}\n` +
    `🏥 **Rumah Sakit:** ${controlData.rumah_sakit || "Belum ditentukan"}\n` +
    `👨‍⚕️ **Dokter:** ${controlData.dokter || "Belum ditentukan"}\n` +
    `📋 **Catatan:** ${controlData.catatan || "Tidak ada catatan"}\n\n` +
    `⏱️ **Waktu pengingat:** ${timingInfo}\n\n` +
    `Jangan lupa untuk datang tepat waktu ya! 🙏`
  );
};
```

### 3. Array-based Storage Pattern

Mengikuti pola yang sama dengan `jadwal_wa_reminders`:

```javascript
// Collect schedule IDs in array
const wablasScheduleIds = [];

for (const reminderTime of reminderTimes) {
  try {
    const scheduleResponse = await createWablasSchedule(
      phone,
      message,
      reminderTime.date,
      reminderTime.time
    );

    if (scheduleResponse?.id) {
      wablasScheduleIds.push(scheduleResponse.id);
    }
  } catch (error) {
    console.error("Failed to create schedule:", error);
  }
}

// Store array in database
insertData.wablas_schedule_ids =
  wablasScheduleIds.length > 0 ? wablasScheduleIds : null;
```

## Usage

### Creating Control with Dual Reminders

```javascript
// Automatic creation when creating control
const controlData = {
  user_id: "uuid",
  jadwal_tanggal: "2024-01-15",
  jam_mulai: "10:00",
  rumah_sakit: "RS Example",
  dokter: "Dr. Example",
  catatan: "Kontrol rutin",
};

const result = await createControl(controlData);
// Will automatically create 2 WhatsApp schedule reminders
```

### Manual Schedule Creation

```javascript
// POST /api/schedule/control-reminder
{
  "user_id": "uuid",
  "jadwal_tanggal": "2024-01-15",
  "jam_mulai": "10:00",
  "phone": "628123456789",
  "rumah_sakit": "RS Example",
  "dokter": "Dr. Example",
  "catatan": "Kontrol rutin"
}
```

## Database Impact

### Before (Single Schedule ID)

```sql
kontrol:
- id: uuid
- user_id: uuid
- jadwal_tanggal: date
- jam_mulai: time
- wablas_schedule_id: text (single)
```

### After (Multiple Schedule IDs)

```sql
kontrol:
- id: uuid
- user_id: uuid
- jadwal_tanggal: date
- jam_mulai: time
- wablas_schedule_ids: text[] (array)
```

## Error Handling

### Schedule Creation Failure

- Control tetap dibuat walaupun WhatsApp scheduling gagal
- Log error untuk debugging
- Schedule IDs yang berhasil tetap disimpan

### Cleanup on Delete

- Log semua schedule IDs untuk manual cleanup
- Wablas tidak menyediakan cancel endpoint
- Production: implement tracking system untuk cleanup

## API Endpoints

### 1. Create Control Schedule (Manual)

- **POST** `/api/schedule/control-reminder`
- Creates dual reminders for existing control data
- Returns array of schedule IDs

### 2. Get Control Data

- **GET** `/api/control`
- Returns controls with `wablas_schedule_ids` array

### 3. Delete Control

- **DELETE** `/api/control/:id`
- Logs schedule IDs for manual cleanup
- Deletes control record from database

## Monitoring & Maintenance

### Logging

- Schedule creation success/failure
- Schedule ID tracking
- Error details for debugging

### Production Considerations

- Implement schedule cancellation if Wablas provides endpoint
- Monitor schedule delivery success rates
- Implement cleanup job for orphaned schedules

## Benefits

1. **Dual Notification**: Users get reminded twice for important appointments
2. **Flexible Timing**: 24-hour advance notice + last-minute 4-hour reminder
3. **Array Storage**: Consistent with existing reminder system
4. **Fault Tolerant**: Control creation continues even if some schedules fail
5. **Maintainable**: Clear separation of concerns in service layer

## Future Enhancements

1. **Dynamic Timing**: Allow users to customize reminder times
2. **Schedule Cancellation**: Implement if Wablas provides cancel endpoint
3. **Delivery Status**: Track message delivery success
4. **Reminder Templates**: Multiple message templates for different scenarios
5. **Bulk Operations**: Create/cancel multiple schedules efficiently
