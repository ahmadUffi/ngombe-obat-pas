# Dokumen HKI Program Komputer – Firmware ESP32 "Ngompas"

Dokumen ini merangkum inti logika (algoritme dan arsitektur program) dari firmware perangkat “SmedBox/Ngompas” yang berjalan pada ESP32. Fokusnya adalah bagian-bagian bernilai kebaruan yang mengatur penjadwalan minum obat terintegrasi cloud, deteksi aksi pengguna via sensor IR per-slot, penanganan akses tidak sah, notifikasi multi-kanal (LED, buzzer, audio), serta sinkronisasi data non-blocking melalui WiFi/GSM.

Catatan: Cuplikan kode di bawah adalah ringkasan representatif dari berkas sumber `IoT/ngompas.ino` untuk memudahkan peninjauan. Pada implementasi asli, fungsi-fungsi saling terhubung dan lebih lengkap.

## Ringkasan Teknis

- Platform: ESP32 (Arduino framework)
- Komponen: RTC DS3231, PCF8575 (ekspander I/O untuk LED slot), DFPlayer Mini (audio), sensor IR tiap slot (A–F), buzzer, TFT (TFT_eSPI), SIM800L (GSM), WiFiManager, Preferences (penyimpanan lokal), ArduinoHttpClient/TinyGSM.
- Backend: HTTP REST API (Supabase/Express) via WiFi atau GSM, otentikasi Bearer Token.

## Cakupan Logika yang Dilindungi (Inti Kebaruan)

1. State machine jadwal aktif berbasis epoch WIB dengan maksimum 6 jadwal paralel, sinkron dengan dose-log harian, dan pengelolaan daftar aktif secara efisien (swap removal, de-duplicasi by id+timeslot).
2. Mekanisme fetch non-blocking ber-state (schedule → dose-log) dengan timeout dan retry adaptif, serta interupsi prioritas ketika mendeteksi interaksi pengguna (membuka slot atau akses tidak sah).
3. Deteksi sensor IR per slot yang memicu alur “taken” secara deterministik: hentikan fetch, update stok via API, tampilkan umpan balik visual/audio, dan rekonsiliasi daftar jadwal aktif.
4. Penanganan akses tidak sah: audio+buzzer bersamaan (pattern 3 detik), layar peringatan, serta pengiriman peringatan ke server dengan payload spesifik (jadwal_id + pesan) baik via WiFi maupun GSM.
5. Notifikasi multi-kanal terjadwal (buzzer burst 30 detik yang bising, audio bergilir 10 detik antar slot aktif), serta pemetaan LED komposit (status sistem + slot aktif) melalui PCF8575.
6. Sinkronisasi waktu RTC via NTP berzona waktu WIB, konversi jam string → epoch hari ini untuk window jadwal, serta tampilan statistik dose hari ini.
7. Mode konektivitas ganda (WiFi/GSM) dengan pemilihan jalur HTTP yang sesuai dan penyimpanan token aman di Preferences.

## Arsitektur Singkat

- Data periodik: jadwal minum (`/jadwal/get-for-iot`) dan dose log hari ini (`/dose-log/status-today`).
- Pengambilan data non-blocking dengan state `fetchState` dan flag `isFetching`.
- Daftar jadwal aktif: array fixed 6 elemen, menyimpan id, slot, nama, dosis, startEpoch, endEpoch, state, dsb.
- Loop utama memprioritaskan deteksi sensor IR dan akses tidak sah, lalu notifikasi, lalu fetch jika idle.

## Inti Logika & Cuplikan Kode

### 1) Struktur data jadwal aktif dan status

```cpp
enum ScheduleState { ALERTING, TAKEN, MISSED };

struct ActiveSchedule {
  String id_obat;      // UUID from API
  char slot;           // 'A'..'F'
  String nama_obat;    // optional display
  String dosis;        // optional
  uint32_t startEpoch; // epoch seconds - WIB
  uint32_t endEpoch;   // epoch seconds - WIB
  ScheduleState state;
  bool notified;       // initial notification done
  uint8_t audioIndex;  // slot->audio file index (1-6)
};

ActiveSchedule activeSchedules[6];
int activeCount = 0;
```

Kebaruan: pemetaan slot ke indeks audio, serta pengelolaan array fixed-size dengan strategi swap-removal untuk efisiensi memori dan waktu.

### 2) Pengambilan data non-blocking dengan state machine

```cpp
bool performNonBlockingFetch() {
  switch (fetchState) {
    case 0: // Start fetching schedule
      fetchState = 1; return false;
    case 1: // Fetch schedule
      scheduleDataLoaded = fetchData("/jadwal/get-for-iot", scheduleData);
      if (scheduleDataLoaded) { fetchAttempt = 0; fetchState = 2; }
      else if (++fetchAttempt >= MAX_FETCH_ATTEMPTS) { fetchAttempt = 0; fetchState = 2; }
      return false;
    case 2: // Start fetching dose log
      fetchState = 3; return false;
    case 3: // Fetch dose log
      doseLogDataLoaded = fetchData("/dose-log/status-today", doseLogData);
      if (doseLogDataLoaded) { calculateDoseStatistics(); fetchAttempt = 0; fetchState = 0; return true; }
      else if (++fetchAttempt >= MAX_FETCH_ATTEMPTS) { fetchAttempt = 0; fetchState = 0; return true; }
      return false;
    default:
      fetchState = 0; return true;
  }
}

bool fetchData(String endpoint, DynamicJsonDocument& data) {
  if (!wifiConnected || !isAuthenticated) return false;
  return gsmMode ? fetchDataViaGSM(endpoint, data)
                 : fetchDataViaWiFi(endpoint, data);
}
```

Kebaruan: state machine dua tahap (jadwal → dose-log) yang dapat di-interupsi kapan saja oleh aksi pengguna; ada timeout global dan retry adaptif.

### 3) Pemrosesan jadwal dan aktivasi window berbasis epoch WIB

```cpp
void processScheduleData() {
  uint32_t now = getCurrentEpoch();
  for (int i = activeCount - 1; i >= 0; i--) {
    if (now > activeSchedules[i].endEpoch) removeActiveSchedule(i);
  }
  JsonArray schedules = scheduleData["jadwalMinum"];
  JsonArray doseLogs = doseLogData["data"];
  for (JsonObject schedule : schedules) {
    String id_obat = schedule["id"]; String slot_obat = schedule["slot_obat"];
    JsonArray jam_awal = schedule["jam_awal"]; JsonArray jam_berakhir = schedule["jam_berakhir"];
    for (int i = 0; i < jam_awal.size(); i++) {
      String startTime = jam_awal[i]; String endTime = jam_berakhir[i];
      uint32_t startEpoch = parseTimeToEpoch(startTime);
      uint32_t endEpoch   = parseTimeToEpoch(endTime);
      if (now >= startEpoch && now <= endEpoch) {
        String doseStatus = getDoseStatus(doseLogs, id_obat, startTime);
        if (doseStatus == "pending" && !isAlreadyActive(id_obat, startTime)) {
          addActiveSchedule(id_obat, slot_obat.charAt(0), schedule["nama_obat"],
                            schedule["dosis_obat"], startEpoch, endEpoch);
        }
      }
    }
  }
  updateLEDStatus();
}
```

Kebaruan: pemilihan window aktif “hari-ini” menggunakan konversi string jam ke epoch berbasis RTC (WIB), dan deduplikasi kombinasi `id_obat+startTime` agar satu obat yang sama di jam berbeda bisa aktif bersamaan.

### 4) Deteksi aksi pengguna berprioritas tertinggi (IR) dan alur “taken”

```cpp
void checkIRSensors() {
  for (int i = activeCount - 1; i >= 0; i--) {
    ActiveSchedule& schedule = activeSchedules[i];
    if (schedule.state == ALERTING && isSlotOpened(schedule.slot)) {
      if (isFetching) { isFetching = false; fetchState = 0; fetchAttempt = 0; }
      updateMedicationStock(schedule.id_obat);   // API PUT update stok
      schedule.state = TAKEN;                    // tandai di sisi perangkat
      showSuccessScreen(String(schedule.slot), schedule.nama_obat);
      delay(3000);
      tft.fillScreen(TFT_BGCOLOR);
      currentDisplay = STARTUP; displayInitialized = false;
      removeActiveSchedule(i);
      return; // respons tercepat, proses satu aksi per iterasi
    }
  }
  checkUnauthorizedAccess();
}

bool isSlotOpened(char slot) {
  int sensorValue = /* digitalRead pin per slot */;
  return sensorValue == HIGH; // HIGH = tutup terbuka (IR tidak terhalang)
}
```

Kebaruan: alur deterministik dan responsif (membatalkan fetch non-blocking yang sedang berlangsung ketika ada interaksi), sehingga aksi pengguna tidak tertunda oleh jaringan.

### 5) Penanganan akses tidak sah + peringatan server

```cpp
void checkUnauthorizedAccess() {
  static unsigned long lastUnauthorizedCheck = 0;
  if (millis() - lastUnauthorizedCheck < 500) return;
  lastUnauthorizedCheck = millis();
  for (char slot : { 'A','B','C','D','E','F' }) {
    if (isSlotOpened(slot)) {
      bool authorized = false;
      for (int j = 0; j < activeCount; j++)
        if (activeSchedules[j].slot == slot && activeSchedules[j].state == ALERTING) { authorized = true; break; }
      if (!authorized) {
        if (isFetching) { isFetching = false; fetchState = 0; fetchAttempt = 0; }
        // Audio + buzzer 3 detik bersamaan
        buzzerTestMode = true;
        if (dfPlayerInitialized) { dfPlayer.play(9); /* buzzer pola 3s */ }
        else { /* buzzer-only 3s */ }
        buzzerTestMode = false;
        showUnauthorizedAccess(String(slot));
        sendUnauthorizedAlert(slot); // POST ke /peringatan/create-peringatan
        return;
      }
    }
  }
}
```

Kebaruan: pola mitigasi akses tidak sah yang jelas dan serempak (visual+audiotik+server alert) dengan interval polling IR dipercepat (500 ms) agar deteksi cepat namun tidak boros CPU.

### 6) Notifikasi multi-kanal (buzzer/audio) yang terjadwal

```cpp
void handleActiveNotifications(unsigned long now) {
  if (activeCount == 0) return;
  if (now - lastNotificationCheck >= 300000) { // tiap 5 menit
    startNotifications(); lastNotificationCheck = now;
  }
  handleBuzzer(now);
  handleAudio(now);
}

void startNotifications() {
  buzzerActive = true; buzzerStartTime = millis();
  lastAudioTime = 0; currentAudioSlot = 0; // paksa audio segera
}

void handleBuzzer(unsigned long now) {
  if (buzzerTestMode || !buzzerActive) return;
  if (now - buzzerStartTime >= 30000) { buzzerActive = false; digitalWrite(BUZZER_PIN, LOW); return; }
  unsigned long cycle = (now - buzzerStartTime) % 500; // 150ms ON, 350ms OFF
  digitalWrite(BUZZER_PIN, cycle < 150 ? HIGH : LOW);
}

void handleAudio(unsigned long now) {
  if (!dfPlayerInitialized || activeCount == 0) return;
  if (now - lastAudioTime >= 10000) { // 10 detik bergilir
    playCurrentSlotAudio(); lastAudioTime = now; currentAudioSlot = (currentAudioSlot + 1) % activeCount;
  }
}
```

Kebaruan: pola notifikasi yang “mengganggu” namun hemat daya (burst pendek, interval tetap), serta rotasi audio antar slot aktif agar pasien tahu slot mana yang relevan.

### 7) Pemetaan LED status via PCF8575

```cpp
void updateLEDStatus() {
  // Matikan semua LED (HIGH untuk common-cathode)
  pcf8575.digitalWrite(P0, HIGH); pcf8575.digitalWrite(P1, HIGH);
  pcf8575.digitalWrite(P2, HIGH); pcf8575.digitalWrite(P3, HIGH);
  pcf8575.digitalWrite(P4, HIGH); pcf8575.digitalWrite(P5, HIGH);

  if (wifiConnected && isAuthenticated && activeCount > 0) {
    for (int i = 0; i < activeCount; i++) {
      if (activeSchedules[i].state == ALERTING) {
        int idx = activeSchedules[i].slot - 'A';
        uint8_t ledPins[] = {P0, P1, P2, P3, P4, P5};
        if (idx >= 0 && idx < 6) pcf8575.digitalWrite(ledPins[idx], LOW); // ON
      }
    }
    digitalWrite(LED_STATUS, HIGH);
  } else {
    digitalWrite(LED_STATUS, LOW);
  }
}
```

Kebaruan: LED status mengindikasikan sekaligus “sistem siap” dan “slot yang aktif”, selaras dengan state machine jadwal sehingga mengurangi kebingungan pengguna.

### 8) Sinkronisasi waktu (RTC + NTP WIB) dan konversi jam → epoch

```cpp
void syncRTCTime() {
  if (!wifiConnected || !rtcReady || gsmMode) return; // NTP hanya via WiFi
  const char* ntpServer1 = "id.pool.ntp.org";
  const char* ntpServer2 = "asia.pool.ntp.org";
  const char* ntpServer3 = "pool.ntp.org";
  configTzTime("WIB-7", ntpServer1, ntpServer2, ntpServer3);
  // Setelah sinkron, set RTC ke waktu NTP
  // rtc.adjust(ntpTime);
}

uint32_t getCurrentEpoch() { DateTime now = rtc.now(); return now.unixtime(); }

uint32_t parseTimeToEpoch(String timeStr) {
  // Menggunakan tanggal hari ini dari RTC, dengan jam:menit dari string
  // menghasilkan epoch WIB untuk window jadwal
}
```

Kebaruan: memastikan window jadwal berada pada “hari ini” yang sama di RTC (WIB), sehingga logika mengambil obat tepat waktu meskipun perangkat reboot/berpindah jaringan.

### 9) Penyimpanan token dan mode konektivitas ganda

```cpp
// Preferences
Preferences prefs;
String accessToken = prefs.getString("token", "");

// HTTP via WiFi vs GSM berdasarkan gsmMode
void updateMedicationStock(String scheduleId) {
  if (gsmMode) updateStockViaGSM(scheduleId);
  else         updateStockViaWiFi(scheduleId);
}

void updateStockViaWiFi(String scheduleId) {
  // PUT http://.../v1/api/jadwal/update-stock-obat-iot { "id_obat": scheduleId }
  // On success: autoFetchAfterUpdate();
}

void updateStockViaGSM(String scheduleId) {
  // PUT /v1/api/jadwal/update-stock-obat-iot via TinyGSM HttpClient
}
```

Kebaruan: fallback konektivitas otomatis, tanpa mengubah jalur logika utama, cukup memilih transport (WiFi/GSM) pada titik I/O.

## Alur Kerja Utama (Ringkas)

1. Boot: inisialisasi periferal, baca token dan mode koneksi dari Preferences; koneksi WiFi/GSM; jika WiFi dan RTC siap → sinkron NTP WIB.
2. Loop: prioritas tertinggi deteksi IR dan akses tidak sah; jika ada aksi → hentikan fetch, proses “taken” atau “unauthorized”.
3. Notifikasi: setiap 5 menit, trigger notifikasi; buzzer aktif 30 detik, audio bergilir tiap 10 detik.
4. Fetch non-blocking: jadwal lalu dose-log; proses jadi daftar aktif berbasis epoch WIB; perbarui LED/UI.
5. Aksi “taken”: PUT update stok; fetch ulang ringkas untuk rekonsiliasi; daftar aktif disegarkan.

## Endpoints & Payload Utama

- GET `/jadwal/get-for-iot` → daftar jadwal minum obat (slot, nama, dosis, jam_awal/jam_berakhir).
- GET `/dose-log/status-today` → status dose harian (pending/taken/missed) per jadwal.
- PUT `/jadwal/update-stock-obat-iot` body `{ "id_obat": "<uuid>" }` → decrement stok saat obat diambil (via IoT).
- POST `/peringatan/create-peringatan` body `{ id: <jadwal_id>, pesan: <string> }` → kirim peringatan akses tidak sah.

Semua request menggunakan header `Authorization: Bearer <token>` yang disimpan lokal.

## Asumsi & Batasan

- Konflik jadwal per-slot telah divalidasi di aplikasi web; perangkat mempercayai server (mengurangi beban memori dan CPU).
- Maksimal 6 jadwal aktif bersamaan (A–F); dapat diperluas dengan penyesuaian memori.
- NTP hanya saat WiFi aktif; RTC menjaga waktu saat GSM-only.
- Pola buzzer/audio dirancang “mengganggu” untuk mendorong kepatuhan minum obat; boleh diatur di build lain.

## Pengujian Pokok (Saran)

- Happy path: jadwal aktif → buka slot benar → stok ter-update → layar sukses, LED/Audio sesuai.
- Unauthorized: di luar window → buka slot → audio+buzzer 3 detik → kirim peringatan → UI peringatan.
- Jaringan sibuk: saat fetch berlangsung → buka slot → fetch dihentikan segera → taken tetap cepat.
- GSM-only: semua endpoint (GET/PUT/POST) berjalan via TinyGSM.
- RTC/NTP: setelah sinkron, window epoch sesuai WIB dan tidak tumpang tindih lintas hari.

## Penutup

Dokumen ini menyorot elemen-elemen logika yang menjadi pembeda utama firmware: state machine jadwal aktif berbasis epoch WIB, pengambilan data non-blocking yang dapat di-interupsi oleh aksi pengguna, serta penanganan akses tidak sah dengan mitigasi serentak dan notifikasi multi-kanal. Cuplikan kode di atas merepresentasikan implementasi aktual di `IoT/ngompas.ino` dan dimaksudkan sebagai rujukan teknis untuk kebutuhan HKI program komputer.
