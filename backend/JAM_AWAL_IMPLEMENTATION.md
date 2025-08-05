# 📋 Implementasi jam_awal untuk WhatsApp Reminder

## ✅ **Confirmed Implementation**

### **1. Data Flow:**

```javascript
// Input jadwal data
{
  nama_pasien: "Ahmad Test",
  nama_obat: "Paracetamol",
  dosis_obat: "500mg",
  jam_awal: ["08:00", "12:00", "16:00", "20:00"], // ✅ Array of times
  // ... other fields
}
```

### **2. Processing dalam createJadwal():**

```javascript
// Loop setiap jam di jam_awal array
if (data.jam_awal && Array.isArray(data.jam_awal)) {
  for (const jam of data.jam_awal) {
    // 1. Generate message dengan jam spesifik
    const message = generateReminderMessage(insertData, jam);

    // 2. Format start_date untuk jam ini
    const startDate = formatStartDate(jam);

    // 3. Create Wablas reminder
    const wablasResponse = await createWablasReminder({
      phone: formattedPhone,
      start_date: startDate, // "2025-08-05 16:00:00"
      message: message,
      title: `Reminder ${insertData.nama_obat} - ${jam}`,
    });

    // 4. Save reminder ID ke database
    await createWaReminder({
      jadwal_id: result.id,
      user_id: user_id,
      jam_reminder: jam, // "16:00"
      wablas_reminder_id: wablasResponse.reminder_id,
    });
  }
}
```

### **3. Result:**

Untuk `jam_awal: ["08:00", "12:00", "16:00", "20:00"]`:

| jam_reminder | start_date          | wablas_reminder_id | message                 |
| ------------ | ------------------- | ------------------ | ----------------------- |
| 08:00        | 2025-08-06 08:00:00 | uuid1              | Message untuk jam 08:00 |
| 12:00        | 2025-08-06 12:00:00 | uuid2              | Message untuk jam 12:00 |
| 16:00        | 2025-08-05 16:00:00 | uuid3              | Message untuk jam 16:00 |
| 20:00        | 2025-08-05 20:00:00 | uuid4              | Message untuk jam 20:00 |

### **4. Message Format per Jam:**

```
🕐 *Pengingat Minum Obat*

⏰ Waktu: 16:00        ← Jam spesifik dari jam_awal[i]
👤 Pasien: Ahmad Test
💊 Obat: Paracetamol
📏 Dosis: 500mg

Jangan lupa minum obat sesuai jadwal ya! 😊

_Pesan otomatis dari SmedBox_
```

### **5. Database Records:**

```sql
-- Tabel jadwal (1 record)
INSERT INTO jadwal (nama_obat, jam_awal, ...)
VALUES ('Paracetamol', ['08:00','12:00','16:00','20:00'], ...)

-- Tabel jadwal_wa_reminders (4 records)
INSERT INTO jadwal_wa_reminders (jadwal_id, jam_reminder, wablas_reminder_id)
VALUES
  ('jadwal-uuid', '08:00', 'wablas-uuid-1'),
  ('jadwal-uuid', '12:00', 'wablas-uuid-2'),
  ('jadwal-uuid', '16:00', 'wablas-uuid-3'),
  ('jadwal-uuid', '20:00', 'wablas-uuid-4');
```

### **6. Smart Date Logic:**

- Jika jam belum lewat hari ini → set hari ini
- Jika jam sudah lewat hari ini → set besok
- Format timezone lokal (bukan UTC)

## 🎯 **Key Points:**

✅ **1 jadwal → Multiple reminders** (sesuai length jam_awal)  
✅ **Each reminder** has unique Wablas ID  
✅ **Message** includes specific jam untuk reminder tsb  
✅ **Phone number** dari profile.no_hp, auto-formatted  
✅ **Error handling** with rollback jika ada yang gagal

---

_Implementation verified: August 5, 2025_
