# 🔄 Refactored WhatsApp Schedule Implementation

## 🎯 **Simplified Approach**

Mengganti implementasi dengan menambahkan `wablas_schedule_id` column langsung ke tabel `kontrol` daripada membuat tabel terpisah `control_wa_schedules`.

## 🗃️ **Database Changes**

### **Before**: Separate Table

```sql
CREATE TABLE public.control_wa_schedules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  control_id uuid NOT NULL,
  user_id uuid NOT NULL,
  scheduled_date date NOT NULL,
  scheduled_time time NOT NULL,
  wablas_schedule_id text NOT NULL,
  message_content text NOT NULL,
  is_active boolean DEFAULT true,
  -- ... other fields
);
```

### **After**: Additional Column

```sql
ALTER TABLE public.kontrol
ADD COLUMN wablas_schedule_id text;
```

## ✅ **Benefits**

1. **Simpler Schema**: Satu kolom tambahan vs tabel baru
2. **Easier Queries**: Data schedule langsung tersedia dengan control data
3. **Better Performance**: Tidak perlu JOIN operation
4. **Simpler Code**: Less complexity dalam service layer
5. **Direct Relationship**: 1-to-1 mapping antara control dan schedule

## 📋 **Updated Flow**

### **Create Control with Schedule**:

```javascript
// 1. Create Wablas schedule first
const scheduleResponse = await createWablasSchedule({...});

// 2. Insert control with wablas_schedule_id
insertData.wablas_schedule_id = scheduleResponse.schedule_id;
const control = await supabase.from("kontrol").insert([insertData]);
```

### **Get Controls with Schedules**:

```javascript
// Simple query - no JOIN needed
const controls = await supabase
  .from("kontrol")
  .select("*")
  .eq("user_id", user_id)
  .not("wablas_schedule_id", "is", null);
```

### **Delete Control**:

```javascript
// Get control with schedule ID
const control = await supabase.from("kontrol").select("*").eq("id", id);

// Log schedule ID for manual cleanup (if needed)
if (control.wablas_schedule_id) {
  console.log(`Schedule ID: ${control.wablas_schedule_id} may need cleanup`);
}

// Delete control (simple operation)
await supabase.from("kontrol").delete().eq("id", id);
```

## 🛠️ **Code Changes**

### **Files Modified**:

- ✅ `database/supabse.sql` - Added wablas_schedule_id column
- ✅ `src/services/controlService.js` - Simplified create/delete logic
- ✅ `src/controllers/scheduleController.js` - Updated to use kontrol table
- ✅ `test-schedule-api.js` - Updated test cases

### **Files Removed** (no longer needed):

- ❌ `src/services/controlScheduleService.js`
- ❌ `database/control_wa_schedules.sql`

## 🔌 **API Endpoints**

All endpoints remain the same, but now use simplified logic:

```
POST /v1/api/kontrol/create-kontrol          # Enhanced dengan auto-schedule
POST /v1/api/schedule/create-control-reminder # Manual schedule creation
GET  /v1/api/schedule/get-user-reminders     # Get controls with schedules
POST /v1/api/schedule/test-wablas-schedule   # Test Wablas API integration
```

## 📊 **Response Format**

```json
{
  "success": true,
  "data": [
    {
      "id": "control-uuid",
      "tanggal": "2025-08-10",
      "dokter": "Dr. Ahmad",
      "waktu": "14:00",
      "nama_pasien": "John Doe",
      "wablas_schedule_id": "8d554adc-7279-4864-adbd-7407e47e6b9d",
      "isDone": false
    }
  ]
}
```

## 🔧 **Migration**

Run this SQL to add the new column:

```sql
-- Add new column
ALTER TABLE public.kontrol
ADD COLUMN wablas_schedule_id text;

-- Add index for performance
CREATE INDEX idx_kontrol_wablas_schedule_id ON public.kontrol(wablas_schedule_id);
```

---

_Refactored: August 7, 2025_
_Simplified approach with better performance and maintainability_
