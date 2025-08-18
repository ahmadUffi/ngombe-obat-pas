#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include "RTClib.h"
#include <TFT_eSPI.h>
#include <SPI.h>

// WiFi & API setup
const char* ssid = "@AhmadUffi";
const char* password = "12345678";
const char* loginURL = "http://163.53.195.57:5000/v1/api/login";
const char* dataURL = "http://163.53.195.57:5000/v1/api/jadwal/get-for-iot";
const char* updateStockURL = "http://163.53.195.57:5000/v1/api/jadwal/update-stock-obat-iot";
const char* peringatanURL = "http://163.53.195.57:5000/v1/api/peringatan/create-peringatan";
const char* messageURL = "http://163.53.195.57:5000/v1/api/message/send";
const char* profileMeURL = "http://163.53.195.57:5000/v1/api/profile/me";
const char* email = "ahmaduffi45@gmail.com";
const char* passwd = "123456789";

String accessToken = "";
String profilePhone = ""; // nomor hp dari /profile/me

TFT_eSPI tft = TFT_eSPI();
RTC_DS3231 rtc;

const int jumlahSensor = 8;
int pinSensor[jumlahSensor] = {14, 27, 26, 25, 33, 32, 35, 34};
int nilaiSensor[jumlahSensor];
bool slotSudahDibuka[8] = {false};

// NOTE: Sesuaikan mapping dengan hardware Anda
// LED untuk setiap slot A-H (default pin ESP32 generic, ubah sesuai wiring)
int pinLed[jumlahSensor] = {12, 13, 15, 2, 4, 5, 18, 19};
const int buzzerPin = 23; // buzzer aktif-high; sesuaikan pin

unsigned long lastPeringatanMillis[8] = {0};
const unsigned long peringatanCooldown = 60000UL; // 60s cooldown per slot

uint16_t Background = TFT_BLACK;
uint16_t Text = TFT_WHITE;
uint16_t Latar = TFT_BLACK;

enum StatusSistem { MENUNGGU, AKTIF, SELESAI };
StatusSistem statusSistem = MENUNGGU;

#define MAX_JADWAL 30
#define MAX_OBAT 15

struct JadwalObat {
  String id;                    // ID dari jadwal obat
  String namaPasien;
  String namaObat;
  int dosisObat;
  int jumlahObat;
  String kategori;
  char slotObat;
  String catatan;
  int startJam;
  int startMenit;
  int endJam;
  int endMenit;
  int tersisaObat;              // Jumlah obat yang tersisa
  bool sudahDiminum;            // Flag apakah sudah diminum untuk waktu ini
  bool warned15;                // Peringatan T-15 menit sebelum akhir window
  bool warned5;                 // Peringatan T-5 menit sebelum akhir window
  bool preMealWarned;           // Peringatan 60 menit sebelum (untuk "sebelum makan")
};

JadwalObat daftarJadwal[MAX_JADWAL];
int jumlahJadwal = 0;

bool jadwalSudahDiproses[MAX_JADWAL] = {false};
int jadwalAktif = -1;
bool sudahSelesaiDicatat = false;
String statusObat = "Menunggu...";
int menitSebelumnya = -1;
unsigned long waktuSelesai = 0;

// --- Pending update queue (simple ring buffer) ---
#define PENDING_MAX 20
String pendingIds[PENDING_MAX];
int pendingHead = 0, pendingTail = 0, pendingCount = 0;

void enqueuePendingUpdate(const String &id) {
  if (pendingCount >= PENDING_MAX) {
    Serial.println("Pending queue full, dropping event");
    return;
  }
  pendingIds[pendingTail] = id;
  pendingTail = (pendingTail + 1) % PENDING_MAX;
  pendingCount++;
}

bool dequeuePendingUpdate(String &out) {
  if (pendingCount == 0) return false;
  out = pendingIds[pendingHead];
  pendingHead = (pendingHead + 1) % PENDING_MAX;
  pendingCount--;
  return true;
}

bool sendStockUpdate(const String &jadwalId) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("sendStockUpdate: WiFi not connected");
    return false;
  }
  HTTPClient http;
  http.begin(updateStockURL);
  http.addHeader("Content-Type", "application/json");
  if (accessToken.length() > 0) {
    http.addHeader("Authorization", "Bearer " + accessToken);
  }
  StaticJsonDocument<128> body;
  body["id_obat"] = jadwalId;
  String payload;
  serializeJson(body, payload);
  http.setTimeout(10000);

  Serial.print("Updating stock for jadwal id: ");
  Serial.println(jadwalId);
  int code = http.sendRequest("PUT", payload);

  if (code == 401) {
    // Try re-login once
    Serial.println("401 on update. Re-login and retry...");
    http.end();
    loginToApi();
    if (accessToken.length() == 0) return false;
    HTTPClient http2;
    http2.begin(updateStockURL);
    http2.addHeader("Content-Type", "application/json");
    http2.addHeader("Authorization", "Bearer " + accessToken);
    int code2 = http2.sendRequest("PUT", payload);
    String resp2 = http2.getString();
    Serial.printf("Retry update code: %d, resp: %s\n", code2, resp2.c_str());
    http2.end();
    return code2 >= 200 && code2 < 300;
  }

  String resp = http.getString();
  Serial.printf("Update code: %d, resp: %s\n", code, resp.c_str());
  http.end();
  return code >= 200 && code < 300;
}

void flushPendingUpdates() {
  if (WiFi.status() != WL_CONNECTED) return;
  if (pendingCount == 0) return;
  Serial.printf("Flushing %d pending updates...\n", pendingCount);
  int tries = pendingCount; // limit to current size to avoid infinite loop
  for (int i = 0; i < tries; i++) {
    String id;
    if (!dequeuePendingUpdate(id)) break;
    if (!sendStockUpdate(id)) {
      // push back if failed
      enqueuePendingUpdate(id);
      break; // stop early, network might be unstable
    }
    delay(100);
  }
}

void setup() {
  Serial.begin(115200);
  Serial.println("Starting NgomPas Medication Reminder System...");
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // Initialize I2C and display
  Wire.begin();
  tft.init();
  tft.setRotation(0);
  tft.fillScreen(Latar);
  tft.setTextSize(2);
  tft.setTextColor(Text, Background);
  tft.setTextDatum(ML_DATUM);
  
  // Display startup message
  tft.drawString("NgomPas System", 10, 20);
  tft.setTextSize(1);
  tft.drawString("Initializing...", 10, 40);
  tft.setTextSize(2);

  // Initialize RTC
  if (!rtc.begin()) {
    Serial.println("RTC tidak ditemukan");
    tft.fillScreen(TFT_RED);
    tft.setTextColor(TFT_WHITE);
    tft.drawString("RTC ERROR!", 20, 60);
    while (1) delay(1000);
  }
  
  // Check if RTC lost power and reset time if needed
  if (rtc.lostPower()) {
    Serial.println("RTC lost power, setting time to compile time");
    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
  }

  // Initialize sensor pins
  for (int i = 0; i < jumlahSensor; i++) {
    pinMode(pinSensor[i], INPUT_PULLUP);
  }

  // Initialize LED & buzzer pins
  for (int i = 0; i < jumlahSensor; i++) {
    pinMode(pinLed[i], OUTPUT);
    digitalWrite(pinLed[i], LOW);
  }
  pinMode(buzzerPin, OUTPUT);
  digitalWrite(buzzerPin, LOW);
  
  // Initialize arrays
  for (int i = 0; i < MAX_JADWAL; i++) {
    jadwalSudahDiproses[i] = false;
  }

  // Login and get initial data
  tft.drawString("Logging in...", 10, 60);
  loginToApi();
  
  if (accessToken != "") {
    tft.drawString("Getting data...", 10, 80);
    getDataWithToken();
  // dapatkan nomor hp profil untuk pengiriman pesan WA saat terlewat
  fetchProfileMe();
    tft.drawString("Ready!", 10, 100);
  } else {
    tft.drawString("Login failed!", 10, 80);
  }
  
  delay(2000);
  tft.fillScreen(Latar);
  
  Serial.println("Setup completed successfully!");
}

void beepBuzzer(unsigned long ms) {
  unsigned long start = millis();
  while (millis() - start < ms) {
    digitalWrite(buzzerPin, HIGH);
    delay(100);
    digitalWrite(buzzerPin, LOW);
    delay(100);
  }
}

void shortBeep() {
  digitalWrite(buzzerPin, HIGH);
  delay(150);
  digitalWrite(buzzerPin, LOW);
}

void loginToApi() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(loginURL);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(10000); // 10 second timeout

    StaticJsonDocument<200> doc;
    doc["email"] = email;
    doc["password"] = passwd;

    String requestBody;
    serializeJson(doc, requestBody);
    
    Serial.println("Attempting login...");
    int httpResponseCode = http.POST(requestBody);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.printf("Login response code: %d\n", httpResponseCode);
      Serial.println("Login response: " + response);
      
      StaticJsonDocument<512> responseDoc;
      DeserializationError error = deserializeJson(responseDoc, response);
      
      if (!error) {
        if (responseDoc.containsKey("access_token")) {
          accessToken = responseDoc["access_token"].as<String>();
          Serial.println("Login successful, token received.");
        } else {
          Serial.println("Login response missing access_token");
          if (responseDoc.containsKey("message")) {
            Serial.println("Server message: " + responseDoc["message"].as<String>());
          }
        }
      } else {
        Serial.print("Login JSON parse error: ");
        Serial.println(error.c_str());
      }
    } else {
      Serial.printf("HTTP POST login failed with code: %d\n", httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("Cannot login: WiFi not connected");
  }
}

void getDataWithToken() {
  if (WiFi.status() == WL_CONNECTED && accessToken != "") {
    HTTPClient http;
    http.begin(dataURL);
    http.addHeader("Authorization", "Bearer " + accessToken);
    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.GET();
    if (httpResponseCode > 0) {
      String payload = http.getString();
      Serial.println("Response received: " + payload);
      
      // Increased buffer size for larger JSON
      DynamicJsonDocument doc(12288);
      DeserializationError error = deserializeJson(doc, payload);
      if (error) {
        Serial.print("Gagal parsing JSON: ");
        Serial.println(error.c_str());
        return;
      }

      // Reset jadwal count
      jumlahJadwal = 0;
      
      // Clear previous processed flags
      for (int i = 0; i < MAX_JADWAL; i++) {
        jadwalSudahDiproses[i] = false;
      }

      JsonArray jadwalMinum = doc["jadwalMinum"];
      Serial.printf("Jumlah jadwal obat ditemukan: %d\n", jadwalMinum.size());
      
      for (JsonObject item : jadwalMinum) {
        if (jumlahJadwal >= MAX_JADWAL) {
          Serial.println("Maximum jadwal reached!");
          break;
        }

        String id = item["id"] | "";
        String namaPasien = item["nama_pasien"] | "";
        String namaObat = item["nama_obat"] | "";
        int dosisObat = item["dosis_obat"] | 1;
        int jumlahObat = item["jumlah_obat"] | 0;
        String kategori = item["kategori"] | "";
        String slotObatStr = item["slot_obat"] | "A";
        char slotObat = slotObatStr[0];
        String catatan = item["catatan"] | "";

        JsonArray jamAwal = item["jam_awal"];
        JsonArray jamBerakhir = item["jam_berakhir"];
        
        Serial.printf("Processing obat: %s, slot: %c\n", namaObat.c_str(), slotObat);
        Serial.printf("Jam arrays size - awal: %d, berakhir: %d\n", jamAwal.size(), jamBerakhir.size());

        // Create separate schedule entry for each time slot
        int maxTimes = min((int)jamAwal.size(), (int)jamBerakhir.size());
        for (int i = 0; i < maxTimes && jumlahJadwal < MAX_JADWAL; i++) {
          String jamAwalStr = jamAwal[i] | "";
          String jamBerakhirStr = jamBerakhir[i] | "";

          if (jamAwalStr.length() == 0 || jamBerakhirStr.length() == 0) {
            Serial.printf("Empty time string at index %d\n", i);
            continue;
          }

          int startJam, startMenit, endJam, endMenit;
          
          // Parse start time (format: HH:MM)
          if (sscanf(jamAwalStr.c_str(), "%d:%d", &startJam, &startMenit) != 2) {
            Serial.printf("Failed to parse start time: %s\n", jamAwalStr.c_str());
            continue;
          }
          
          // Parse end time (format: HH:MM:SS or HH:MM)
          if (sscanf(jamBerakhirStr.c_str(), "%d:%d", &endJam, &endMenit) < 2) {
            Serial.printf("Failed to parse end time: %s\n", jamBerakhirStr.c_str());
            continue;
          }

          // Validate time ranges
          if (startJam < 0 || startJam > 23 || startMenit < 0 || startMenit > 59 ||
              endJam < 0 || endJam > 23 || endMenit < 0 || endMenit > 59) {
            Serial.printf("Invalid time range: %02d:%02d - %02d:%02d\n", 
                         startJam, startMenit, endJam, endMenit);
            continue;
          }

          // Create jadwal entry
          daftarJadwal[jumlahJadwal] = {
            id,
            namaPasien,
            namaObat,
            dosisObat,
            jumlahObat,
            kategori,
            slotObat,
            catatan,
            startJam,
            startMenit,
            endJam,
            endMenit,
            jumlahObat,
            false,
            false,
            false,
            false
          };

          Serial.printf("Jadwal %d ditambahkan: %s (%s) %02d:%02d - %02d:%02d, slot: %c\n", 
                       jumlahJadwal, namaObat.c_str(), kategori.c_str(),
                       startJam, startMenit, endJam, endMenit, slotObat);
          
          jumlahJadwal++;
        }
      }
      
      Serial.printf("Total jadwal berhasil dimuat: %d\n", jumlahJadwal);
      
    } else {
      Serial.printf("Gagal mengambil data jadwal. HTTP Code: %d\n", httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("WiFi tidak terhubung atau token kosong");
  }
}

void fetchProfileMe() {
  if (WiFi.status() != WL_CONNECTED || accessToken == "") return;
  HTTPClient http;
  http.begin(profileMeURL);
  http.addHeader("Authorization", "Bearer " + accessToken);
  http.setTimeout(10000);
  int code = http.GET();
  if (code > 0) {
    String payload = http.getString();
    StaticJsonDocument<512> doc;
    if (deserializeJson(doc, payload) == DeserializationError::Ok) {
      if (doc["data"].is<JsonObject>()) {
        JsonObject d = doc["data"]; // assuming { success, data: {...} }
        profilePhone = String((const char*)d["no_hp"] | "");
      } else if (doc["no_hp"].is<const char*>()) {
        profilePhone = String((const char*)doc["no_hp"]);
      }
    }
  }
  http.end();
}

bool sendWhatsAppSimple(const String &phone, const String &msg) {
  if (WiFi.status() != WL_CONNECTED || accessToken == "") return false;
  HTTPClient http;
  http.begin(messageURL);
  http.addHeader("Authorization", "Bearer " + accessToken);
  http.addHeader("Content-Type", "application/json");
  StaticJsonDocument<512> body;
  body["phone"] = phone;
  body["message"] = msg;
  body["type"] = "text";
  String payload;
  serializeJson(body, payload);
  int code = http.POST(payload);
  http.end();
  return code >= 200 && code < 300;
}

bool sendPeringatanApi(const String &jadwalId, const String &pesan) {
  if (WiFi.status() != WL_CONNECTED || accessToken == "") return false;
  HTTPClient http;
  http.begin(peringatanURL);
  http.addHeader("Authorization", "Bearer " + accessToken);
  http.addHeader("Content-Type", "application/json");
  StaticJsonDocument<512> body;
  body["id"] = jadwalId;  // backend expects { id, pesan }
  body["pesan"] = pesan;
  String payload;
  serializeJson(body, payload);
  int code = http.POST(payload);
  http.end();
  return code >= 200 && code < 300;
}

bool waktuDalamRentang(DateTime sekarang, int sj, int sm, int ej, int em) {
  int menitSekarang = sekarang.hour() * 60 + sekarang.minute();
  int menitMulai = sj * 60 + sm;
  int menitAkhir = ej * 60 + em;
  if (menitMulai <= menitAkhir) {
    return menitSekarang >= menitMulai && menitSekarang <= menitAkhir;
  } else {
    return menitSekarang >= menitMulai || menitSekarang <= menitAkhir;
  }
}

// Function to find active medication schedule
int findActiveSchedule(DateTime sekarang) {
  int jam = sekarang.hour();
  int menit = sekarang.minute();
  
  for (int i = 0; i < jumlahJadwal; i++) {
    if (!jadwalSudahDiproses[i] && !daftarJadwal[i].sudahDiminum &&
        waktuDalamRentang(sekarang,
                          daftarJadwal[i].startJam,
                          daftarJadwal[i].startMenit,
                          daftarJadwal[i].endJam,
                          daftarJadwal[i].endMenit)) {
      return i;
    }
  }
  return -1;
}

int minutesUntil(int h, int m, DateTime now) {
  int nowMin = now.hour() * 60 + now.minute();
  int target = h * 60 + m;
  int diff = target - nowMin;
  if (diff < -720) diff += 1440; // handle next day wrap-around
  return diff;
}

// Function to get medication info for display
String getMedicationInfo(int jadwalIndex) {
  if (jadwalIndex < 0 || jadwalIndex >= jumlahJadwal) return "";
  
  JadwalObat& jadwal = daftarJadwal[jadwalIndex];
  String info = jadwal.namaObat + " (" + jadwal.kategori + ")";
  if (jadwal.catatan.length() > 0) {
    info += "\n" + jadwal.catatan;
  }
  info += "\nDosis: " + String(jadwal.dosisObat);
  info += " | Slot: " + String(jadwal.slotObat);
  return info;
}

// Function to display next upcoming schedule
void displayNextSchedule(DateTime sekarang) {
  int currentMinutes = sekarang.hour() * 60 + sekarang.minute();
  int nextScheduleIndex = -1;
  int minDifference = 24 * 60; // Maximum minutes in a day
  
  for (int i = 0; i < jumlahJadwal; i++) {
    if (jadwalSudahDiproses[i] || daftarJadwal[i].sudahDiminum) continue;
    
    int scheduleMinutes = daftarJadwal[i].startJam * 60 + daftarJadwal[i].startMenit;
    int difference;
    
    if (scheduleMinutes >= currentMinutes) {
      difference = scheduleMinutes - currentMinutes;
    } else {
      // Next day
      difference = (24 * 60) - currentMinutes + scheduleMinutes;
    }
    
    if (difference < minDifference) {
      minDifference = difference;
      nextScheduleIndex = i;
    }
  }
  
  if (nextScheduleIndex != -1) {
    tft.fillRect(0, 50, 240, 50, Background);
    tft.setTextSize(1);
    tft.setCursor(10, 50);
    
    JadwalObat& next = daftarJadwal[nextScheduleIndex];
    tft.print("Selanjutnya: ");
    tft.println(next.namaObat);
    tft.printf("Waktu: %02d:%02d (Slot %c)", next.startJam, next.startMenit, next.slotObat);
    
    if (minDifference < 60) {
      tft.printf("\nDalam %d menit", minDifference);
    } else {
      tft.printf("\nDalam %d jam %d menit", minDifference / 60, minDifference % 60);
    }
    
    tft.setTextSize(2);
  }
}

// Function to refresh data periodically
void refreshDataIfNeeded() {
  static unsigned long lastRefresh = 0;
  static unsigned long lastDebugPrint = 0;
  unsigned long currentTime = millis();
  
  // Check WiFi connection every minute
  static unsigned long lastWiFiCheck = 0;
  if (currentTime - lastWiFiCheck > 60000) {
    checkWiFiConnection();
    lastWiFiCheck = currentTime;
  }

  // Try flush pending updates every minute
  static unsigned long lastFlush = 0;
  if (currentTime - lastFlush > 60000) {
    flushPendingUpdates();
    lastFlush = currentTime;
  }
  
  // Print debug info every 5 minutes
  if (currentTime - lastDebugPrint > 5 * 60 * 1000) {
    printScheduleDebug();
    lastDebugPrint = currentTime;
  }
  
  // Refresh data every 30 minutes
  if (currentTime - lastRefresh > 30 * 60 * 1000) {
    Serial.println("Refreshing data from server...");
    checkWiFiConnection();
    
    if (WiFi.status() == WL_CONNECTED) {
      if (accessToken != "") {
        getDataWithToken();
        lastRefresh = currentTime;
      } else {
        loginToApi();
        if (accessToken != "") {
          getDataWithToken();
          lastRefresh = currentTime;
        }
      }
    } else {
      Serial.println("Cannot refresh: WiFi not connected");
    }
  }
}

void checkWiFiConnection() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected, attempting to reconnect...");
    tft.fillRect(0, 30, 240, 20, Background);
    tft.drawString("WiFi reconnecting...", 10, 30);
    
    WiFi.begin(ssid, password);
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
      delay(500);
      attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("WiFi reconnected successfully");
      flushPendingUpdates();
    } else {
      Serial.println("WiFi reconnection failed");
    }
  }
}

void loop() {
  DateTime sekarang = rtc.now();
  int jam = sekarang.hour();
  int menit = sekarang.minute();
  int detik = sekarang.second();
  unsigned long sekarangMillis = millis();

  // Reset processed flags when time window has passed
  if (menit != menitSebelumnya) {
    for (int i = 0; i < jumlahJadwal; i++) {
      int menitSekarang = jam * 60 + menit;
      int akhir = daftarJadwal[i].endJam * 60 + daftarJadwal[i].endMenit;
      
      // Reset if current time is past the end time
      if (menitSekarang > akhir) {
        jadwalSudahDiproses[i] = false;
        daftarJadwal[i].sudahDiminum = false;
  daftarJadwal[i].warned15 = false;
  daftarJadwal[i].warned5 = false;
  daftarJadwal[i].preMealWarned = false;
      }
    }
    menitSebelumnya = menit;
  }

  // Display current time
  tft.fillRect(0, 110, 70, 56, Background);
  char timeStr[10];
  sprintf(timeStr, "%02d:%02d", jam, menit);
  tft.drawString(timeStr, 10, 120);
  if (detik % 2 == 0) {
    tft.drawString(":", 38, 120);
  }

  // Main state machine
  if (statusSistem == MENUNGGU) {
    int activeScheduleIndex = findActiveSchedule(sekarang);
    
    if (activeScheduleIndex != -1) {
      jadwalAktif = activeScheduleIndex;
      statusSistem = AKTIF;
      statusObat = "Waktu minum obat!";
      sudahSelesaiDicatat = false;
      waktuSelesai = 0;
      
      // Reset all slot flags
      for (int s = 0; s < 8; s++) {
        slotSudahDibuka[s] = false;
      }

      // Display medication info
      tft.fillRect(0, 140, 240, 80, Background);
      tft.setCursor(10, 140);
      tft.setTextSize(1);
      
      String medInfo = getMedicationInfo(jadwalAktif);
      tft.print(medInfo);
      
      tft.setTextSize(2);
      
      Serial.printf("Jadwal aktif: %s pada %02d:%02d-%02d:%02d, slot: %c\n",
                   daftarJadwal[jadwalAktif].namaObat.c_str(),
                   daftarJadwal[jadwalAktif].startJam,
                   daftarJadwal[jadwalAktif].startMenit,
                   daftarJadwal[jadwalAktif].endJam,
                   daftarJadwal[jadwalAktif].endMenit,
                   daftarJadwal[jadwalAktif].slotObat);

      // Nyalakan LED slot dan bunyikan buzzer 5 detik
      int slotIndex = daftarJadwal[jadwalAktif].slotObat - 'A';
      if (slotIndex >= 0 && slotIndex < jumlahSensor) {
        digitalWrite(pinLed[slotIndex], HIGH);
      }
      beepBuzzer(5000);
    }
  }

  if (statusSistem == AKTIF && jadwalAktif != -1) {
    JadwalObat& currentSchedule = daftarJadwal[jadwalAktif];
    
    // If local stock shows zero, just show habis and skip
    if (currentSchedule.tersisaObat <= 0) {
      statusObat = "Stok habis - lewati";
      statusSistem = SELESAI;
      waktuSelesai = sekarangMillis;
      sudahSelesaiDicatat = true;
      jadwalSudahDiproses[jadwalAktif] = true;
    } else {
      // Check if still within time window
      if (waktuDalamRentang(sekarang,
                            currentSchedule.startJam,
                            currentSchedule.startMenit,
                            currentSchedule.endJam,
                            currentSchedule.endMenit)) {

        int slotIndex = currentSchedule.slotObat - 'A';
        
        // Validate slot index
        if (slotIndex >= 0 && slotIndex < jumlahSensor) {
          nilaiSensor[slotIndex] = digitalRead(pinSensor[slotIndex]);
          
          // Check if slot was opened (sensor triggered)
          if (nilaiSensor[slotIndex] == HIGH) {
            slotSudahDibuka[slotIndex] = true;
          }

          // Wrong-slot detection -> send peringatan (cooldown 60s per slot)
          for (int s = 0; s < jumlahSensor; s++) {
            if (s == slotIndex) continue;
            int val = digitalRead(pinSensor[s]);
            if (val == HIGH) {
              unsigned long nowMs = millis();
              if (nowMs - lastPeringatanMillis[s] > peringatanCooldown) {
                lastPeringatanMillis[s] = nowMs;
                String pesan = "peringatan pasien mencoba membuka obat " + currentSchedule.namaObat +
                                " pada slot" + String(currentSchedule.slotObat);
                sendPeringatanApi(currentSchedule.id, pesan);
              }
            }
          }

          // Pre-expiry alerts at T-15 and T-5 minutes before end
          int minsLeft = minutesUntil(currentSchedule.endJam, currentSchedule.endMenit, sekarang);
          if (minsLeft == 15 && !currentSchedule.warned15) {
            shortBeep();
            currentSchedule.warned15 = true;
          }
          if (minsLeft == 5 && !currentSchedule.warned5) {
            shortBeep();
            currentSchedule.warned5 = true;
          }

          if (slotSudahDibuka[slotIndex]) {
            statusObat = "Obat berhasil diminum!";
            statusSistem = SELESAI;
            waktuSelesai = sekarangMillis;
            sudahSelesaiDicatat = true;
            jadwalSudahDiproses[jadwalAktif] = true;
            currentSchedule.sudahDiminum = true;
            
            // Try to update backend stock
            bool updated = sendStockUpdate(currentSchedule.id);
            if (!updated) {
              enqueuePendingUpdate(currentSchedule.id);
            }
            
            // Update remaining medication count locally (best effort)
            if (currentSchedule.tersisaObat > 0) {
              currentSchedule.tersisaObat -= currentSchedule.dosisObat;
              if (currentSchedule.tersisaObat < 0) currentSchedule.tersisaObat = 0;
            }
            
            Serial.printf("Obat %s diminum. Update backend: %s. Tersisa: %d\n", 
                         currentSchedule.namaObat.c_str(), updated ? "OK" : "PENDING", currentSchedule.tersisaObat);

            // Matikan LED slot dan refresh jadwal dari server
            if (slotIndex >= 0 && slotIndex < jumlahSensor) {
              digitalWrite(pinLed[slotIndex], LOW);
            }
            getDataWithToken();
          } else {
            statusObat = "Buka slot " + String(currentSchedule.slotObat);
          }
        } else {
          Serial.printf("Invalid slot index: %d for slot %c\n", slotIndex, currentSchedule.slotObat);
          statusObat = "Error: Slot tidak valid";
        }

      } else {
        // Time window has passed
        statusObat = "Waktu habis - obat terlewat!";
        statusSistem = SELESAI;
        waktuSelesai = sekarangMillis;
        sudahSelesaiDicatat = true;
        jadwalSudahDiproses[jadwalAktif] = true;
        
        Serial.printf("Jadwal %s terlewat waktu\n", currentSchedule.namaObat.c_str());

        // Kirim pesan WhatsApp sederhana ke nomor profile (jika tersedia)
        if (profilePhone.length() > 0) {
          String msg = "Pengingat: Obat '" + currentSchedule.namaObat + "' di slot " +
                        String(currentSchedule.slotObat) + " terlewat waktunya.";
          sendWhatsAppSimple(profilePhone, msg);
        }
        // Matikan LED slot
        int slotIndex2 = currentSchedule.slotObat - 'A';
        if (slotIndex2 >= 0 && slotIndex2 < jumlahSensor) {
          digitalWrite(pinLed[slotIndex2], LOW);
        }
      }
    }
  }

  // Handle completion state
  if (statusSistem == SELESAI && sudahSelesaiDicatat) {
    if (sekarangMillis - waktuSelesai >= 10000) { // Show result for 10 seconds
      tft.fillRect(0, 140, 240, 80, Background);
      statusSistem = MENUNGGU;
      jadwalAktif = -1;
      statusObat = "Menunggu jadwal...";
      sudahSelesaiDicatat = false;
    }
  }

  // Display current status
  tft.fillRect(0, 10, 240, 20, Background);
  tft.drawString(statusObat, 10, 10);
  
  // Display next schedule info when waiting
  if (statusSistem == MENUNGGU) {
    displayNextSchedule(sekarang);
    // Pre-meal alert: 60 minutes before start for kategori "sebelum makan"
    for (int i = 0; i < jumlahJadwal; i++) {
      if (jadwalSudahDiproses[i] || daftarJadwal[i].sudahDiminum) continue;
      String k = daftarJadwal[i].kategori;
      k.toLowerCase();
      if (k.indexOf("sebelum") >= 0 && !daftarJadwal[i].preMealWarned) {
        int mins = minutesUntil(daftarJadwal[i].startJam, daftarJadwal[i].startMenit, sekarang);
        if (mins == 60) {
          shortBeep();
          daftarJadwal[i].preMealWarned = true;
        }
      }
    }
  }
  
  // Refresh data periodically
  refreshDataIfNeeded();
  
  // Check WiFi connection
  checkWiFiConnection();
  
  delay(500); // Reduced delay for better responsiveness
}