# 🔧 Troubleshooting WhatsApp Reminder Delete

## ❌ **Common Issues**

### **1. Token Invalid Error**

```
Wablas Delete Error: { status: false, message: 'token invalid' }
```

**Possible Causes:**

- ❌ WABLAS_TOKEN atau WABLAS_SECRET_KEY salah
- ❌ Token expired
- ❌ Format authorization header tidak sesuai
- ❌ Base URL salah

**Solutions:**

1. Verify credentials di Wablas dashboard
2. Check format: `Authorization: TOKEN.SECRET_KEY`
3. Pastikan Base URL benar: `https://sby.wablas.com/api`

### **2. Reminder Not Found (404)**

```
Wablas Delete Error: 404 Not Found
```

**Handling:**

- ✅ Dianggap sukses (sudah terhapus)
- ✅ Tidak menggagalkan delete jadwal

### **3. Network/Connection Issues**

```
ECONNREFUSED atau timeout errors
```

**Handling:**

- ⚠️ Log error tapi lanjutkan delete jadwal
- ✅ Tidak menggagalkan proses utama

## 🛡️ **Robust Delete Strategy**

### **Current Implementation:**

```javascript
// 1. Soft failure approach
export const deleteWablasReminder = async (reminderId) => {
  try {
    // Try to delete from Wablas
    const response = await axios.delete(...);
    return { success: true, data: response.data };
  } catch (error) {
    // Log error but don't throw
    console.error('Wablas delete failed:', error);
    return { success: false, error: error.message };
  }
};

// 2. Delete jadwal continues regardless
for (const reminder of waReminders) {
  const result = await deleteWablasReminder(reminder.wablas_reminder_id);
  if (result.success) {
    console.log('✅ Deleted successfully');
  } else {
    console.warn('⚠️ Delete failed but continuing');
  }
}
```

### **Benefits:**

- ✅ Delete jadwal tidak akan gagal karena Wablas issue
- ✅ Database cleanup tetap berjalan (CASCADE DELETE)
- ✅ Proper error logging untuk debugging
- ✅ User experience tidak terganggu

## 🔍 **Debugging Steps**

### **1. Test Delete Function:**

```bash
# Run test script
node test-delete-reminder.js
```

### **2. Check Logs:**

```javascript
// Look for these logs in console:
"Attempting to delete Wablas reminder: [ID]";
"✅ Wablas reminder deleted successfully";
"⚠️ Wablas delete failed: [reason]";
"❌ Wablas Delete Error: [error]";
```

### **3. Manual API Test:**

```bash
# Test dengan curl
curl -X DELETE "https://sby.wablas.com/api/reminder/REMINDER_ID" \
     -H "Authorization: TOKEN.SECRET_KEY"
```

## 📋 **Best Practices**

### **1. Graceful Degradation**

- ✅ Always allow jadwal delete to proceed
- ✅ Log Wablas failures for investigation
- ✅ Consider 404 as success (already deleted)

### **2. Error Monitoring**

- 📊 Track Wablas delete success rate
- 🔔 Alert if consistent failures
- 📝 Log for debugging

### **3. User Communication**

- ✅ Show "Jadwal berhasil dihapus" even if Wablas fails
- ⚠️ Optionally notify about reminder cleanup status

## 🔄 **Fallback Options**

### **Option 1: Manual Cleanup**

- Admin bisa cleanup orphaned reminders via Wablas dashboard

### **Option 2: Batch Cleanup**

- Scheduled job untuk cleanup reminders yang gagal dihapus

### **Option 3: Alternative API Endpoints**

- Try different Wablas endpoints jika ada

---

_Updated: August 5, 2025_
