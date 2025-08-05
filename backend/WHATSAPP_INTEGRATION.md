# 📱 WhatsApp Integration Documentation

## 🎯 Overview

SmedBox WhatsApp integration menggunakan Wablas API untuk mengirim reminder otomatis saat jadwal minum obat dibuat.

## 🔧 Setup & Configuration

### Environment Variables

```bash
# .env
WABLAS_TOKEN=your_wablas_token_here
WABLAS_SECRET_KEY=your_wablas_secret_key_here
```

### Database Schema

```sql
CREATE TABLE public.jadwal_wa_reminders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  jadwal_id uuid NOT NULL,
  user_id uuid NOT NULL,
  jam_reminder text NOT NULL,
  wablas_reminder_id text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),

  CONSTRAINT fk_jadwal_wa_reminders_jadwal
    FOREIGN KEY (jadwal_id) REFERENCES public.jadwal(id) ON DELETE CASCADE,

  CONSTRAINT fk_jadwal_wa_reminders_user
    FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
```

## 🚀 Features

### ✅ Automatic Reminder Creation

- Saat membuat jadwal baru, sistem otomatis membuat WhatsApp reminder
- Setiap jam di `jam_awal` array mendapat reminder terpisah
- Message format yang user-friendly dengan emoji

### ✅ Cleanup on Delete

- Saat jadwal dihapus, semua reminder WhatsApp ikut terhapus
- Cleanup dari Wablas API dan database

### ✅ Error Handling

- Transaction-like behavior: jika ada reminder gagal, jadwal tidak dibuat
- Proper rollback mechanism
- Detailed error logging

### ✅ Phone Number Formatting

- Auto-format nomor HP ke format internasional (62xxx)
- Support berbagai format input: 08xxx, 8xxx, +62xxx

## 📋 API Flow

### Create Jadwal Flow:

```
1. Validate user profile & phone number
2. Create jadwal record in database
3. Loop through jam_awal array:
   - Generate reminder message
   - Create Wablas reminder
   - Save reminder ID to database
4. Create history record
5. Return success

// If any step fails:
- Delete created jadwal
- Delete created Wablas reminders
- Return error
```

### Delete Jadwal Flow:

```
1. Get all WA reminders for jadwal
2. Delete each reminder from Wablas
3. Delete reminder records from database
4. Create history record
5. Delete jadwal (CASCADE handles remaining reminders)
```

## 🔌 Service Architecture

### Files Structure:

```
src/services/
├── wablasService.js      # Wablas API integration
├── waReminderService.js  # Database operations for reminders
└── jadwalService.js      # Enhanced with WhatsApp integration
```

### Key Functions:

#### wablasService.js

```javascript
// Core API functions
createWablasReminder(data);
deleteWablasReminder(reminderId);

// Utility functions
generateReminderMessage(jadwalData, jam);
formatStartDate(jam);
formatPhoneNumber(phone);
```

#### waReminderService.js

```javascript
// Database CRUD
createWaReminder(data);
getWaRemindersByJadwal(jadwal_id);
deleteWaRemindersByJadwal(jadwal_id);
```

## 📱 Message Format

```
🕐 *Pengingat Minum Obat*

⏰ Waktu: 08:00
👤 Pasien: Ahmad Test
💊 Obat: Paracetamol
📏 Dosis: 500

Jangan lupa minum obat sesuai jadwal ya! 😊

_Pesan otomatis dari SmedBox_
```

## 🧪 Testing

### Manual Testing:

1. Pastikan user memiliki profile dengan `no_hp` yang valid
2. Create jadwal dengan `jam_awal` array
3. Check database untuk reminder records
4. Verify Wablas dashboard untuk scheduled messages
5. Delete jadwal dan verify cleanup

### Test File:

Run `node test-whatsapp.js` untuk test utility functions.

## ⚠️ Important Notes

### Requirements:

- User MUST have valid `no_hp` in profile table
- Wablas credentials must be valid
- Network access to Wablas API required

### Error Scenarios:

- Missing phone number → jadwal creation fails
- Invalid Wablas credentials → reminder creation fails
- Network issues → proper error handling with rollback

### Performance:

- Multiple reminders created sequentially (not parallel)
- Database CASCADE DELETE handles cleanup efficiently
- Proper indexing on `jadwal_id` for fast queries

## 🔮 Future Enhancements

- [ ] Batch reminder creation for better performance
- [ ] Retry mechanism for failed Wablas calls
- [ ] User preference for reminder frequency
- [ ] WhatsApp status tracking (delivered/read)
- [ ] Custom message templates per user

---

_Last updated: August 5, 2025_
