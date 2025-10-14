#include <WiFi.h>
#include <WiFiManager.h>
#include <WebServer.h>
#include <DNSServer.h>
#include <TFT_eSPI.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Preferences.h>
#include <RTClib.h>
#include <Wire.h>
#include <PCF8575.h>
#include <HardwareSerial.h>
#include <DFRobotDFPlayerMini.h>
#include <time.h>

// TinyGSM library for GSM support
#define TINY_GSM_MODEM_SIM800
#include <TinyGsmClient.h>
#include <ArduinoHttpClient.h>

// ================= CONFIGURATION =================
// TFT Configuration
TFT_eSPI tft = TFT_eSPI();

// RTC Configuration
RTC_DS3231 rtc;

// PCF8575 Configuration for LED control
PCF8575 pcf8575(0x20);

// DFPlayer Mini Configuration
HardwareSerial dfPlayerSerial(2);
DFRobotDFPlayerMini dfPlayer;
bool dfPlayerInitialized = false;

// GSM SIM800L Configuration
HardwareSerial gsmSerial(1);
TinyGsm modem(gsmSerial);
TinyGsmClient gsmClient(modem);
bool gsmInitialized = false;
bool gsmConnected = false;

// Preferences for storage
Preferences prefs;

// Pin Definitions
#define RESET_WIFI_BUTTON 12
#define LED_STATUS 2
#define BUZZER_PIN 19
#define BATTERY_PIN 34  // ADC pin untuk membaca tegangan baterai

// IR Sensor pins
#define SLOT_A_SENSOR 13
#define SLOT_B_SENSOR 14
#define SLOT_C_SENSOR 25
#define SLOT_D_SENSOR 33
#define SLOT_E_SENSOR 32
#define SLOT_F_SENSOR 35

// GSM SIM800L pins
#define GSM_TX_PIN 26
#define GSM_RX_PIN 27

// TFT Colors
#define TFT_BGCOLOR TFT_WHITE
#define TFT_TEXTCOLOR TFT_BLACK
#define TFT_HEADER_COLOR TFT_BLUE
#define TFT_SUCCESS_COLOR TFT_GREEN
#define TFT_ERROR_COLOR TFT_YELLOW
#define TFT_WARNING_COLOR TFT_RED
#define TFT_PENDING_COLOR TFT_RED
#define TFT_TAKEN_COLOR TFT_PURPLE
#define TFT_MISSED_COLOR TFT_YELLOW

// API Configuration
const char* API_HOST = "163.53.195.57";
const int API_PORT = 5000;
const char* API_BASE_URL = "http://163.53.195.57:5000/v1/api";
String accessToken = "";
String userEmail = "";
String userPassword = "";

// Battery Configuration
float batteryVoltage = 0.0;
const float R1 = 30.0;  // Resistor 100k ohm
const float R2 = 100.0;   // Resistor 33k ohm
const float VOLTAGE_RATIO = (R1 + R2) / R2;
const float ADC_MAX = 4095.0;
const float ESP32_MAX_VOLTAGE = 3.3;
const float BATTERY_MIN = 3.0;  // Tegangan minimum baterai (0%)
const float BATTERY_MAX = 4.2;   // Tegangan maximum baterai (100%)

// Battery display constants
const int BAT_BAR_WIDTH = 30;
const int BAT_BAR_HEIGHT = 12;
const int BAT_BAR_X = 280;
const int BAT_BAR_Y = 45;

// Web Server for captive portal
WebServer server(80);
DNSServer dnsServer;
WiFiManager wifiManager;

// ================= DATA STRUCTURES =================
enum ScheduleState { ALERTING, TAKEN, MISSED };

struct ActiveSchedule {
  String id_obat;      // UUID from API
  char slot;           // 'A','B','C','D','E','F'
  String nama_obat;    // optional display
  String dosis;        // optional
  uint32_t startEpoch; // epoch seconds - WIB
  uint32_t endEpoch;   // epoch seconds - WIB
  ScheduleState state;
  bool notified;       // initial notification done
  uint8_t audioIndex;  // slot->audio file index (1-6)
};

ActiveSchedule activeSchedules[6]; // max 6 concurrent schedules
int activeCount = 0;               // current active schedule count

// NOTE: Slot conflict validation is handled at the web application level.
// ESP32 trusts the server data and doesn't need additional conflict checking.
// This simplifies the embedded code and reduces memory/CPU overhead.

// ================= GLOBAL VARIABLES =================
bool isAuthenticated = false;
bool wifiConnected = false;
bool gsmMode = false;
bool systemInitialized = false;
bool rtcReady = false;
bool activeListDirty = false;

// Timing variables
unsigned long lastScheduleCheck = 0;
unsigned long lastNotificationCheck = 0;
unsigned long lastDisplayUpdate = 0;
unsigned long lastButtonCheck = 0;
unsigned long lastNTPSync = 0;
unsigned long lastBatteryCheck = 0;

// Non-blocking fetch variables
bool isFetching = false;
unsigned long fetchStartTime = 0;
const unsigned long FETCH_TIMEOUT = 60000; // 60 second timeout
int fetchState = 0; // 0=idle, 1=fetching schedule, 2=fetching dose log, 3=complete
int fetchAttempt = 0;
const int MAX_FETCH_ATTEMPTS = 3;

// Data storage
DynamicJsonDocument scheduleData(8192);
DynamicJsonDocument doseLogData(12288);
bool scheduleDataLoaded = false;
bool doseLogDataLoaded = false;

// Dose log statistics
int pendingCount = 0;
int takenCount = 0;
int missedCount = 0;

// Display state
enum DisplayState { STARTUP, MAIN, ACTIVE_SCHEDULE, SUCCESS, ERROR };
DisplayState currentDisplay = STARTUP;
bool displayInitialized = false;

// Button state
unsigned long wifiButtonPressStart = 0;
bool wifiButtonPressed = false;

// Notification state
bool buzzerActive = false;
unsigned long buzzerStartTime = 0;
unsigned long lastAudioTime = 0;
int currentAudioSlot = 0;
bool buzzerTestMode = false; // ✅ Flag untuk bypass handleBuzzer saat test

// ================= FUNCTION DECLARATIONS =================
// Core functions
void initializePins();
void initializeTFT();
void initializeI2C();
void initializeDFPlayer();
void initializeGSMSerial();
void initializeWiFi();
void initializeRTC();
bool authenticateUser();
void loadStoredCredentials();

// Battery functions
void readBatteryVoltage();
void drawBatteryIndicator(int x, int y);

// TFT Helper functions untuk koordinat adaptif
int getScreenWidth();
int getScreenHeight();
int getScreenCenterX();
int getScreenCenterY();

// LED functions
void forceAllLEDsOff();
void updateLEDStatus(char slot, bool state);
void testBuzzer();

// Display functions
void showStartupScreen();
void showMainScreen();
void updateMainScreen();
void showActiveScheduleScreen();
void updateActiveScheduleScreen();
void showSuccessScreen(String slot, String medicineName);
void showErrorScreen(String message);
void showUnauthorizedAccess(String slot);
void updateDisplay(unsigned long currentTime);

// Schedule functions
void fetchScheduleData();
void fetchDoseLogData();
void processScheduleData();
void autoFetchAfterUpdate();
void handleMedicationScheduling(unsigned long currentTime);
bool performNonBlockingFetch();
String findJadwalIdBySlot(char slot);

// Sensor functions
void checkIRSensors();
bool isSlotOpened(char slot);

// Notification functions
void handleActiveNotifications(unsigned long currentTime);
void startNotifications();
void handleBuzzer(unsigned long currentTime);

// Connection functions
void checkWiFiConnection();
void checkGSMConnection();

// ================= SETUP FUNCTION =================
void setup() {
  Serial.begin(115200);
  Serial.println("🚀 Ngompas v2 Starting...");
  
  // Initialize pins
  initializePins();
  
  // Initialize TFT
  initializeTFT();
  showStartupScreen();
  
  // Initialize I2C devices
  initializeI2C();
  
  // Initialize DFPlayer
  initializeDFPlayer();
  
  // Initialize GSM if configured
  initializeGSMSerial();
  
  // Initialize preferences
  prefs.begin("ngompas", false);
  
  // Load stored credentials
  loadStoredCredentials();
  
  // Initialize WiFi
  initializeWiFi();
  
  // Initialize RTC if available
  initializeRTC();
  // Perform initial NTP sync after RTC is ready (only in WiFi mode)
  if (wifiConnected && rtcReady && !gsmMode) {
    syncRTCTime();
  }
  
  // Authenticate user
  authenticateUser();
  
  // Test buzzer before LED test
  Serial.println("");
  Serial.println("========================================");
  Serial.println("🔊 BUZZER STARTUP TEST");
  Serial.println("========================================");
  Serial.println("Testing buzzer on GPIO 19...");
  Serial.println("");
  
  testBuzzer();
  
  Serial.println("");
  Serial.println("========================================");
  Serial.println("");
  
  // Initialize LED status - force all OFF since no active schedules yet
  forceAllLEDsOff();
  
  // Initial battery reading
  readBatteryVoltage();
  
  systemInitialized = true;
  Serial.println("✅ System initialization completed");
}

// ================= MAIN LOOP =================
void loop() {
  unsigned long currentTime = millis();
  
  // ✅ PRIORITAS TERTINGGI: Check IR sensors FIRST (before anything else)
  // This ensures immediate response to user actions
  if (isAuthenticated && wifiConnected) {
    checkIRSensors();
  }
  
  // Handle button presses
  handleButtons();
  
  // Check WiFi/GSM connection
  if (gsmMode) {
    checkGSMConnection();
  } else {
    checkWiFiConnection();
  }
  
  // Check battery every 30 seconds
  if (currentTime - lastBatteryCheck > 30000) {
    readBatteryVoltage();
    lastBatteryCheck = currentTime;
  }
  
  // Periodic NTP sync every 24 hours (86400000 ms) - only in WiFi mode
  if (wifiConnected && rtcReady && !gsmMode && currentTime - lastNTPSync > 86400000) {
    syncRTCTime();
    lastNTPSync = currentTime;
  }
  
  // ✅ Background task: Medication scheduling (fetch data)
  if (isAuthenticated && wifiConnected) {
    handleMedicationScheduling(currentTime);
  }
  
  // Handle active notifications
  handleActiveNotifications(currentTime);
  
  // Update display
  updateDisplay(currentTime);
  
  // Handle web server (if in AP mode)
  if (WiFi.getMode() == WIFI_AP || WiFi.getMode() == WIFI_AP_STA) {
    dnsServer.processNextRequest();
    server.handleClient();
  }
  
  delay(50); // Reduced from 100ms to 50ms for faster response
}

// ================= INITIALIZATION FUNCTIONS =================
void initializePins() {
  // IR sensors as input with pullup
  pinMode(SLOT_A_SENSOR, INPUT_PULLUP);
  pinMode(SLOT_B_SENSOR, INPUT_PULLUP);
  pinMode(SLOT_C_SENSOR, INPUT_PULLUP);
  pinMode(SLOT_D_SENSOR, INPUT_PULLUP);
  pinMode(SLOT_E_SENSOR, INPUT_PULLUP);
  pinMode(SLOT_F_SENSOR, INPUT_PULLUP);
  
  // Button as input with pullup
  pinMode(RESET_WIFI_BUTTON, INPUT_PULLUP);
  
  // Status LED and buzzer as output
  pinMode(LED_STATUS, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  // Battery pin as analog input
  pinMode(BATTERY_PIN, INPUT);
  
  // Set ADC resolution untuk ESP32
  analogReadResolution(12);
  
  // Turn off status LED and buzzer initially
  digitalWrite(LED_STATUS, LOW);
  digitalWrite(BUZZER_PIN, LOW);
  
  Serial.println("✅ Pins initialized");
}

void initializeTFT() {
  tft.init();
  tft.setRotation(3); // Landscape mode (320×240 untuk ILI9341)
  tft.fillScreen(TFT_BGCOLOR);
  
  // Debug info untuk troubleshooting di perangkat berbeda
  Serial.println("✅ TFT initialized");
  Serial.println("   Resolution: " + String(tft.width()) + "×" + String(tft.height()));
  Serial.println("   Rotation: 1 (Landscape)");
}

void initializeI2C() {
  Wire.begin(21, 22); // SDA=21, SCL=22
  Serial.println("🔌 I2C initialized on SDA=21, SCL=22");
  
  // Set pinMode for all LED pins BEFORE begin()
  pcf8575.pinMode(P0, OUTPUT);  // Slot A
  pcf8575.pinMode(P1, OUTPUT);  // Slot B  
  pcf8575.pinMode(P2, OUTPUT);  // Slot C
  pcf8575.pinMode(P3, OUTPUT);  // Slot D
  pcf8575.pinMode(P4, OUTPUT);  // Slot E
  pcf8575.pinMode(P5, OUTPUT);  // Slot F
  
  // Turn off all LEDs initially (set all pins to HIGH = LED off for common cathode)
  pcf8575.digitalWrite(P0, HIGH);
  pcf8575.digitalWrite(P1, HIGH);
  pcf8575.digitalWrite(P2, HIGH);
  pcf8575.digitalWrite(P3, HIGH);
  pcf8575.digitalWrite(P4, HIGH);
  pcf8575.digitalWrite(P5, HIGH);
  
  // Initialize PCF8575 AFTER setting pinMode and initial states
  pcf8575.begin();
  
  // Test PCF8575 connection by scanning I2C
  Wire.beginTransmission(0x20);
  int error = Wire.endTransmission();
  if (error == 0) {
    Serial.println("✅ PCF8575 found at address 0x20");
  } else {
    Serial.println("❌ PCF8575 not found at address 0x20 - Error: " + String(error));
  }
  
  Serial.println("✅ I2C devices initialized - All LEDs turned OFF");
  
  // Test LED functionality
  testAllLEDs();
}

void testAllLEDs() {
  Serial.println("💡 Testing all LEDs...");
  
  // Array of pin constants for easier iteration
  uint8_t ledPins[] = {P0, P1, P2, P3, P4, P5};
  char slots[] = {'A', 'B', 'C', 'D', 'E', 'F'};
  
  // Turn on each LED for 200ms
  for (int i = 0; i < 6; i++) {
    Serial.println("💡 Testing LED " + String(i) + " (Slot " + String(slots[i]) + ") - Pin P" + String(i));
    pcf8575.digitalWrite(ledPins[i], LOW);  // Turn on LED
    delay(200);
    pcf8575.digitalWrite(ledPins[i], HIGH); // Turn off LED
    delay(100);
  }
  
  Serial.println("💡 LED test completed");
}

void initializeDFPlayer() {
  dfPlayerSerial.begin(9600, SERIAL_8N1, 16, 17); // RX=16, TX=17
  
  if (dfPlayer.begin(dfPlayerSerial)) {
    dfPlayerInitialized = true;
    dfPlayer.volume(30); // Set volume to MAX (0-30)
    Serial.println("✅ DFPlayer initialized");
  } else {
    Serial.println("❌ DFPlayer initialization failed");
  }
}

void initializeGSMSerial() {
  // Initialize GSM serial communication
  gsmSerial.begin(9600, SERIAL_8N1, GSM_RX_PIN, GSM_TX_PIN);
  Serial.println("📱 GSM Serial initialized on TX=" + String(GSM_TX_PIN) + ", RX=" + String(GSM_RX_PIN));
}

void initializeRTC() {
  if (rtc.begin()) {
    if (rtc.lostPower()) {
      Serial.println("⚠ RTC lost power, setting to compile time");
      rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
    }
    Serial.println("✅ RTC initialized");
    rtcReady = true;
  } else {
    Serial.println("❌ RTC initialization failed");
    rtcReady = false;
  }
}

void loadStoredCredentials() {
  userEmail = prefs.getString("email", "");
  userPassword = prefs.getString("password", "");
  accessToken = prefs.getString("token", "");
  
  // Debug semua preferences yang tersimpan
  String storedMode = prefs.getString("connection_mode", "");
  Serial.println("🔍 Stored connection mode: '" + storedMode + "'");
  Serial.println("🔍 Stored email: '" + userEmail + "'");
  Serial.println("🔍 Stored token length: " + String(accessToken.length()));
  
  if (userEmail.length() > 0) {
    Serial.println("📱 Loaded stored credentials for: " + userEmail);
  } else {
    Serial.println("📱 No stored credentials found");
  }
}

// ================= GSM FUNCTIONS =================
bool initializeGSMConnection() {
  Serial.println("📱 Starting GSM initialization with TinyGSM...");
  
  // Restart modem
  Serial.println("🔄 Restarting modem...");
  modem.restart();
  delay(3000);
  
  // Check modem info
  String modemInfo = modem.getModemInfo();
  Serial.println("📱 Modem: " + modemInfo);
  
  // Wait for network
  Serial.println("🔍 Waiting for network...");
  if (!modem.waitForNetwork(60000L)) {
    Serial.println("❌ Failed to connect to network");
    return false;
  }
  Serial.println("✅ Network connected");
  
  // Check signal quality
  int signalQuality = modem.getSignalQuality();
  Serial.println("📡 Signal quality: " + String(signalQuality));
  
  if (signalQuality == 0) {
    Serial.println("⚠️ Warning: Very weak signal");
  }
  
  // Array of popular Indonesian APNs
  String apnList[] = {
    "internet",           // Telkomsel
    "indosatgprs",       // Indosat  
    "www.xlgprs.net",    // XL
    "3gprs",             // 3 (Tri)
    "smart",             // Smartfren
    "internet.three.co.id" // 3 alternative
  };
  
  int apnCount = sizeof(apnList) / sizeof(apnList[0]);
  
  // Try each APN
  for (int i = 0; i < apnCount; i++) {
    Serial.println("🔄 Trying APN: " + apnList[i]);
    
    if (modem.gprsConnect(apnList[i].c_str(), "", "")) {
      Serial.println("✅ GPRS connected with APN: " + apnList[i]);
      prefs.putString("gsm_apn", apnList[i]); // Save successful APN
      gsmInitialized = true;
      return true;
    }
    
    Serial.println("⚠️ Failed with APN: " + apnList[i]);
    delay(2000);
  }
  
  Serial.println("❌ Failed to connect with all APNs");
  return false;
}

bool checkGSMHardware() {
  Serial.println("🔍 Checking GSM hardware...");
  
  // Send AT command to check if modem responds
  gsmSerial.println("AT");
  delay(1000);
  
  String response = "";
  unsigned long startTime = millis();
  
  while (millis() - startTime < 3000) {
    while (gsmSerial.available()) {
      response += (char)gsmSerial.read();
    }
    if (response.indexOf("OK") >= 0) {
      Serial.println("✅ GSM modem responding");
      gsmInitialized = true;
      return true;
    }
  }
  
  Serial.println("❌ GSM modem not responding");
  Serial.println("Response: " + response);
  return false;
}

bool checkSIMCard() {
  Serial.println("🔍 Checking SIM card...");
  
  gsmSerial.println("AT+CPIN?");
  delay(2000);
  
  String response = readGSMResponse();
  Serial.println("SIM Status: " + response);
  
  if (response.indexOf("READY") >= 0) {
    Serial.println("✅ SIM card ready");
    return true;
  } else if (response.indexOf("SIM PIN") >= 0) {
    Serial.println("❌ SIM card requires PIN");
    return false;
  } else {
    Serial.println("❌ SIM card not detected");
    return false;
  }
}

bool checkSignalStrength() {
  Serial.println("🔍 Checking signal strength...");
  
  gsmSerial.println("AT+CSQ");
  delay(1000);
  
  String response = readGSMResponse();
  Serial.println("Signal: " + response);
  
  // Parse signal quality (format: +CSQ: rssi,ber)
  int rssiStart = response.indexOf(": ") + 2;
  int rssiEnd = response.indexOf(",");
  
  if (rssiStart > 1 && rssiEnd > rssiStart) {
    int rssi = response.substring(rssiStart, rssiEnd).toInt();
    Serial.println("RSSI: " + String(rssi));
    
    // RSSI 0-31 scale, 99 means not known or not detectable
    if (rssi >= 10 && rssi <= 31) {
      Serial.println("✅ Signal strength acceptable (RSSI: " + String(rssi) + ")");
      return true;
    }
  }
  
  Serial.println("❌ Signal strength too weak");
  return false;
}

bool connectToGPRS() {
  Serial.println("📶 Connecting to GPRS...");
  
  // Array of popular Indonesian APNs
  String apnList[] = {
    "internet",           // Telkomsel
    "indosatgprs",       // Indosat  
    "www.xlgprs.net",    // XL
    "3gprs",             // 3 (Tri)
    "smart",             // Smartfren
    "internet.three.co.id" // 3 alternative
  };
  
  int apnCount = sizeof(apnList) / sizeof(apnList[0]);
  
  for (int i = 0; i < apnCount; i++) {
    Serial.println("🔄 Trying APN: " + apnList[i]);
    
    if (tryGPRSConnection(apnList[i])) {
      Serial.println("✅ Connected with APN: " + apnList[i]);
      prefs.putString("gsm_apn", apnList[i]); // Save successful APN
      return true;
    }
    
    delay(3000); // Wait between attempts
  }
  
  Serial.println("❌ Failed to connect with all APNs");
  return false;
}

bool tryGPRSConnection(String apn) {
  // Set APN
  gsmSerial.println("AT+SAPBR=3,1,\"CONTYPE\",\"GPRS\"");
  delay(1000);
  
  gsmSerial.println("AT+SAPBR=3,1,\"APN\",\"" + apn + "\"");
  delay(1000);
  
  // Open GPRS context
  gsmSerial.println("AT+SAPBR=1,1");
  delay(5000); // Wait longer for GPRS connection
  
  String response = readGSMResponse();
  
  if (response.indexOf("OK") >= 0) {
    // Check if we got an IP
    gsmSerial.println("AT+SAPBR=2,1");
    delay(2000);
    
    String ipResponse = readGSMResponse();
    if (ipResponse.indexOf("1,1,") >= 0) {
      Serial.println("✅ GPRS connected with IP");
      Serial.println("IP Response: " + ipResponse);
      return true;
    }
  }
  
  Serial.println("❌ GPRS connection failed for APN: " + apn);
  return false;
}

String readGSMResponse() {
  String response = "";
  unsigned long startTime = millis();
  
  // Wait longer for GSM responses (up to 10 seconds)
  while (millis() - startTime < 10000) {
    while (gsmSerial.available()) {
      char c = (char)gsmSerial.read();
      response += c;
    }
    
    // Check for common GSM response endings
    if (response.indexOf("OK") >= 0 || 
        response.indexOf("ERROR") >= 0 ||
        response.indexOf("DOWNLOAD") >= 0 ||
        response.indexOf("+HTTPACTION:") >= 0 ||
        response.indexOf("+HTTPREAD:") >= 0) {
      break;
    }
    
    delay(100);
  }
  
  response.trim();
  return response;
}

void checkGSMConnection() {
  static unsigned long lastGSMCheck = 0;
  unsigned long currentTime = millis();
  
  if (!gsmMode || currentTime - lastGSMCheck < 30000) {
    return;
  }
  lastGSMCheck = currentTime;
  
  // Check network registration
  gsmSerial.println("AT+CREG?");
  delay(1000);
  
  String response = readGSMResponse();
  
  if (response.indexOf(",1") >= 0 || response.indexOf(",5") >= 0) {
    if (!gsmConnected) {
      gsmConnected = true;
      wifiConnected = true;
      Serial.println("✅ GSM network connected");
    }
  } else {
    if (gsmConnected) {
      gsmConnected = false;
      wifiConnected = false;
      Serial.println("❌ GSM network disconnected");
      forceAllLEDsOff();
    }
  }
}

void initializeWiFi() {
  String connectionMode = prefs.getString("connection_mode", "");
  
  Serial.println("🔍 Reading connection mode from preferences: '" + connectionMode + "'");
  
  if (connectionMode == "gsm") {
    Serial.println("📱 GSM mode detected, initializing GSM...");
    initializeGSMMode();
  } else if (connectionMode == "wifi") {
    Serial.println("📶 WiFi mode detected, initializing WiFi...");
    initializeWiFiMode();
  } else {
    // No mode selected, start captive portal
    Serial.println("🔧 No connection mode selected, starting setup...");
    startCaptivePortal();
  }
}

void initializeWiFiMode() {
  Serial.println("📶 Initializing WiFi mode...");
  gsmMode = false;
  
  String storedSSID = prefs.getString("wifi_ssid", "");
  String storedPassword = prefs.getString("wifi_password", "");
  
  if (storedSSID.length() > 0) {
    Serial.println("📶 Attempting to connect to stored WiFi: " + storedSSID);
    WiFi.mode(WIFI_STA);
    WiFi.begin(storedSSID.c_str(), storedPassword.c_str());
    
    unsigned long startTime = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - startTime < 15000) {
      delay(500);
      Serial.print(".");
    }
    
    if (WiFi.status() == WL_CONNECTED) {
      wifiConnected = true;
      Serial.println("\n✅ Connected to WiFi: " + WiFi.SSID());
      Serial.println("🌐 IP address: " + WiFi.localIP().toString());
      return;
    } else {
      Serial.println("\n❌ WiFi connection failed");
    }
  } else {
    Serial.println("❌ No WiFi credentials found");
  }
  
  // Connection failed, start captive portal
  startCaptivePortal();
}

void initializeGSMMode() {
  Serial.println("📱 Initializing GSM mode...");
  gsmMode = true;
  
  if (initializeGSMConnection()) {
    Serial.println("✅ GSM connected successfully");
    wifiConnected = true; // Use same flag for connection status
    gsmConnected = true;
    return;
  } else {
    Serial.println("❌ GSM connection failed, starting setup...");
  }
  
  // Connection failed, start captive portal
  startCaptivePortal();
}

// ================= CAPTIVE PORTAL FUNCTIONS =================

// ---------- WiFi scan cache (to avoid scanning while AP is active) ----------
const int MAX_CACHED_SSIDS = 32;
String cachedSSIDs[MAX_CACHED_SSIDS];
int cachedRSSI[MAX_CACHED_SSIDS];
int cachedEnc[MAX_CACHED_SSIDS];
int cachedSSIDCount = 0;
unsigned long lastScanMillis = 0;
const unsigned long SCAN_TTL_MS = 60000; // cache for 60 seconds

void scanAndCacheNetworks() {
  Serial.println("🔎 Scanning WiFi networks (cached) ...");

  // Ensure STA is active for reliable scanning
  WiFi.mode(WIFI_STA);
  WiFi.disconnect(true);
  delay(200);

  int n = WiFi.scanNetworks();
  cachedSSIDCount = 0;
  if (n <= 0) {
    Serial.println("⚠️ No networks found during scan");
  } else {
    Serial.println("✅ Networks found: " + String(n));
    for (int i = 0; i < n && i < MAX_CACHED_SSIDS; i++) {
      cachedSSIDs[cachedSSIDCount] = WiFi.SSID(i);
      cachedRSSI[cachedSSIDCount] = WiFi.RSSI(i);
      cachedEnc[cachedSSIDCount] = WiFi.encryptionType(i);
      Serial.println("   - " + cachedSSIDs[cachedSSIDCount] + " (" + String(cachedRSSI[cachedSSIDCount]) + " dBm)");
      cachedSSIDCount++;
    }
  }

  lastScanMillis = millis();
  // do not start AP here; caller will switch to AP mode
}

void startCaptivePortal() {
  Serial.println("🔧 Starting captive portal...");

  // Do a quick scan and cache results before starting softAP to improve reliability
  if (millis() - lastScanMillis > SCAN_TTL_MS) {
    scanAndCacheNetworks();
  }

  // Ensure clean AP start
  WiFi.disconnect(true);
  delay(200);
  WiFi.mode(WIFI_AP_STA);

  IPAddress apIP(192, 168, 4, 1);
  IPAddress gateway(192, 168, 4, 1);
  IPAddress subnet(255, 255, 255, 0);
  WiFi.softAPdisconnect(true);
  delay(100);
  WiFi.softAPConfig(apIP, gateway, subnet);
  // SSID open, channel 6, not hidden, max 4 clients
  WiFi.softAP("ngompas", NULL, 6, false, 4);
  delay(500); // allow stack to bring AP up

  Serial.println("📡 softAP SSID: " + WiFi.softAPSSID());
  Serial.println("📶 softAP IP: " + WiFi.softAPIP().toString());

  // Start DNS server
  dnsServer.start(53, "*", WiFi.softAPIP());

  // Setup web server routes
  setupWebServer();

  server.begin();
  Serial.println("🌐 Captive portal started");
  Serial.println("🔗 Connect to 'ngompas' and open ngompas.login");
}

void setupWebServer() {
  // Main setup page
  server.on("/", handleSetupPage);
  server.on("/save", HTTP_POST, handleSaveConfig);
  server.on("/status", handleStatus);
  
  // Captive portal redirect
  server.onNotFound(handleNotFound);
}

void handleSetupPage() {
  String html = generateSetupHTML();
  server.send(200, "text/html", html);
}

String generateSetupHTML() {
  String html = "<!DOCTYPE html><html><head>";
  html += "<meta charset=\"utf-8\">";
  html += "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">";
  html += "<title>Setup Ngompas</title>";
  html += "<style>";
  html += "body { font-family: Arial, sans-serif; margin: 20px; background: #f0f0f0; }";
  html += ".container { max-width: 450px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }";
  html += ".mode-selector { margin: 20px 0; }";
  html += ".mode-option { display: block; margin: 15px 0; padding: 15px; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; }";
  html += ".mode-option:hover { border-color: #007cba; background: #f8f9fa; }";
  html += ".mode-option.selected { border-color: #007cba; background: #f8f9fa; }";
  html += ".mode-option input[type=\"radio\"] { margin-right: 10px; }";
  html += ".mode-title { font-size: 1.2em; font-weight: bold; margin-bottom: 5px; }";
  html += ".mode-desc { color: #666; font-size: 0.9em; }";
  html += ".setup-section { display: none; margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px; }";
  html += ".setup-section.active { display: block; }";
  html += "input[type=\"text\"], input[type=\"password\"], input[type=\"email\"] { width: 100%; padding: 10px; margin: 5px 0 15px 0; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }";
  html += "button { background: #007cba; color: white; padding: 12px 20px; border: none; border-radius: 4px; cursor: pointer; width: 100%; font-size: 1em; }";
  html += "button:hover { background: #005a87; }";
  html += ".wifi-list { margin: 10px 0; max-height: 200px; overflow-y: auto; }";
  html += ".wifi-item { margin: 5px 0; padding: 8px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; }";
  html += ".wifi-item:hover { background: #f0f0f0; }";
  html += ".wifi-item.selected { background: #e3f2fd; border-color: #007cba; }";
  html += ".header { text-align: center; margin-bottom: 20px; }";
  html += ".step-indicator { color: #007cba; font-weight: bold; }";
  html += "</style>";
  html += "<script>";
  html += "function selectMode(mode) {";
  html += "document.querySelectorAll('.setup-section').forEach(el => el.classList.remove('active'));";
  html += "document.querySelectorAll('.mode-option').forEach(el => el.classList.remove('selected'));";
  html += "document.getElementById(mode + '-setup').classList.add('active');";
  html += "document.getElementById(mode + '-option').classList.add('selected');";
  html += "document.getElementById(mode + '-radio').checked = true;";
  html += "}";
  html += "function selectWifi(ssid, element) {";
  html += "document.querySelectorAll('.wifi-item').forEach(el => el.classList.remove('selected'));";
  html += "element.classList.add('selected');";
  html += "document.getElementById('selected-ssid').value = ssid;";
  html += "}";
  // Prepare form before submit: only require SSID if WiFi mode selected
  html += "function prepareSubmit() {";
  html += "var modeElem = document.querySelector('input[name=connection_mode]:checked');";
  html += "var mode = modeElem ? modeElem.value : 'wifi';";
  html += "if (mode === 'wifi') {";
  html += "  var manual = document.getElementById('manual-ssid').value.trim();";
  html += "  var hidden = document.getElementById('selected-ssid');";
  html += "  if (manual !== '') { hidden.value = manual; }";
  html += "  if (!hidden.value || hidden.value.trim() === '') { alert('Mohon pilih jaringan atau masukkan SSID secara manual.'); return false; }";
  html += "}";
  html += "return true; }";
  html += "</script></head><body>";
  html += "<div class=\"container\">";
  html += "<div class=\"header\">";
  html += "<h2>Setup Ngompas Device</h2>";
  html += "<p class=\"step-indicator\">Pilih Mode Koneksi Internet</p>";
  html += "</div>";
  html += "<form action=\"/save\" method=\"POST\" onsubmit=\"return prepareSubmit();\">";
  html += "<div class=\"mode-selector\">";
  html += "<div class=\"mode-option selected\" id=\"wifi-option\" onclick=\"selectMode('wifi')\">";
  html += "<input type=\"radio\" name=\"connection_mode\" value=\"wifi\" id=\"wifi-radio\" checked>";
  html += "<div class=\"mode-title\">WiFi Connection</div>";
  html += "<div class=\"mode-desc\">Gunakan jaringan WiFi rumah/kantor - Stabil dan cepat</div>";
  html += "</div>";
  html += "<div class=\"mode-option\" id=\"gsm-option\" onclick=\"selectMode('gsm')\">";
  html += "<input type=\"radio\" name=\"connection_mode\" value=\"gsm\" id=\"gsm-radio\">";
  html += "<div class=\"mode-title\">GSM/SIM Card</div>";
  html += "<div class=\"mode-desc\">Gunakan kartu SIM dengan paket data - Portable, bisa dimana saja</div>";
  html += "</div></div>";
  html += "<div class=\"setup-section active\" id=\"wifi-setup\">";
  html += "<h3>Setup WiFi Connection</h3>";
  html += "<p><strong>Pilih Jaringan WiFi:</strong></p>";
  html += "<div class=\"wifi-list\">";
  
  // Use cached scan results (scan is performed before starting AP)
  if (cachedSSIDCount == 0) {
    html += "<div style='color:#999;'>Tidak ada jaringan terdeteksi</div>";
  } else {
    for (int i = 0; i < cachedSSIDCount && i < 8; i++) {
      String ssid = cachedSSIDs[i];
      int rssi = cachedRSSI[i];
      String security = (cachedEnc[i] == WIFI_AUTH_OPEN) ? "[Open]" : "[Secured]";

      html += "<div class=\"wifi-item\" onclick=\"selectWifi('" + ssid + "', this)\">";
      html += security + " " + ssid + " <small>(" + String(rssi) + " dBm)</small>";
      html += "</div>";
    }
  }
  
  html += "</div>";
  // Manual SSID entry (user can type SSID instead of selecting)
  html += "<p><strong>Atau masukkan SSID secara manual:</strong></p>";
  html += "<input type=\"text\" id=\"manual-ssid\" placeholder=\"Ketik nama jaringan WiFi di sini jika tidak terlihat\">";
  html += "<input type=\"hidden\" name=\"wifi_ssid\" id=\"selected-ssid\" required>";
  html += "<p><strong>Password WiFi:</strong></p>";
  html += "<input type=\"password\" name=\"wifi_password\" placeholder=\"Masukkan password WiFi (kosongkan jika tidak ada)\">";
  html += "</div>";
  html += "<div class=\"setup-section\" id=\"gsm-setup\">";
  html += "<h3>Setup GSM Connection</h3>";
  html += "<div style=\"background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 15px 0;\">";
  html += "<strong>Setup Otomatis GSM:</strong>";
  html += "<ul style=\"margin: 10px 0; padding-left: 20px;\">";
  html += "<li>APN akan dideteksi otomatis untuk semua provider Indonesia</li>";
  html += "<li>Tidak perlu setting manual APN atau PIN</li>";
  html += "<li>Cukup pastikan SIM card sudah ada kuota data</li>";
  html += "<li>SIM card tidak boleh terkunci PIN</li>";
  html += "</ul></div>";
  html += "<p><strong>Provider yang didukung:</strong></p>";
  html += "<div style=\"display: flex; flex-wrap: wrap; gap: 10px; margin: 10px 0;\">";
  html += "<span style=\"background: #f0f0f0; padding: 5px 10px; border-radius: 15px; font-size: 0.9em;\">Telkomsel</span>";
  html += "<span style=\"background: #f0f0f0; padding: 5px 10px; border-radius: 15px; font-size: 0.9em;\">Indosat</span>";
  html += "<span style=\"background: #f0f0f0; padding: 5px 10px; border-radius: 15px; font-size: 0.9em;\">XL</span>";
  html += "<span style=\"background: #f0f0f0; padding: 5px 10px; border-radius: 15px; font-size: 0.9em;\">3 (Tri)</span>";
  html += "<span style=\"background: #f0f0f0; padding: 5px 10px; border-radius: 15px; font-size: 0.9em;\">Smartfren</span>";
  html += "</div></div>";
  html += "<div style=\"margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee;\">";
  html += "<h3>Login Akun Ngompas</h3>";
  html += "<p><strong>Email:</strong></p>";
  html += "<input type=\"email\" name=\"user_email\" placeholder=\"email@example.com\" required>";
  html += "<p><strong>Password:</strong></p>";
  html += "<input type=\"password\" name=\"user_password\" placeholder=\"Password akun Ngompas\" required>";
  html += "</div>";
  html += "<button type=\"submit\" style=\"margin-top: 20px;\">Simpan &amp; Aktifkan</button>";
  html += "</form>";
  html += "<div style=\"margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px; font-size: 0.9em;\">";
  html += "<strong>Catatan:</strong><br>";
  html += "- Untuk mengganti mode koneksi, tekan tombol reset selama 3 detik<br>";
  html += "- Device akan restart dan kembali ke setup awal";
  html += "</div></div></body></html>";
  
  return html;
}

void handleSaveConfig() {
  Serial.println("💾 Saving configuration...");
  
  String connectionMode = server.arg("connection_mode");
  String userEmail = server.arg("user_email");
  String userPassword = server.arg("user_password");
  
  // Validate required fields
  if (connectionMode.length() == 0 || userEmail.length() == 0 || userPassword.length() == 0) {
    server.send(400, "text/html", 
      "<h2>❌ Error</h2><p>Mode koneksi, email, dan password harus diisi!</p>"
      "<a href='/'>← Kembali</a>");
    return;
  }
  
  // Save common credentials
  prefs.putString("connection_mode", connectionMode);
  prefs.putString("email", userEmail);
  prefs.putString("password", userPassword);
  
  Serial.println("� Saving connection mode: '" + connectionMode + "'");
  Serial.println("💾 Verification - stored mode: '" + prefs.getString("connection_mode", "EMPTY") + "'");
  
  if (connectionMode == "wifi") {
    handleWiFiSetup(userEmail, userPassword);
  } else if (connectionMode == "gsm") {
    handleGSMSetup(userEmail, userPassword);
  } else {
    server.send(400, "text/html", 
      "<h2>❌ Error</h2><p>Mode koneksi tidak valid!</p>"
      "<a href='/'>← Kembali</a>");
  }
}

void handleWiFiSetup(String email, String password) {
  String wifiSSID = server.arg("wifi_ssid");
  String wifiPassword = server.arg("wifi_password");
  
  if (wifiSSID.length() == 0) {
    server.send(400, "text/html", 
      "<h2>❌ Error</h2><p>WiFi network harus dipilih!</p>"
      "<a href='/'>← Kembali</a>");
    return;
  }
  
  // Save WiFi credentials
  prefs.putString("wifi_ssid", wifiSSID);
  prefs.putString("wifi_password", wifiPassword);
  
  // Send response immediately
  server.send(200, "text/html", generateConnectingHTML("WiFi", "Menghubungkan ke " + wifiSSID + "..."));
  
  // Try WiFi connection
  Serial.println("📶 Connecting to WiFi: " + wifiSSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(wifiSSID.c_str(), wifiPassword.c_str());
  
  // Wait for connection (15 seconds max)
  unsigned long startTime = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startTime < 15000) {
    delay(500);
    Serial.print(".");
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    userEmail = email;
    userPassword = password;
    
    Serial.println("\n✅ WiFi connected: " + WiFi.localIP().toString());
    
    // Try authentication
    if (authenticateUser()) {
      Serial.println("✅ Setup completed successfully - Restarting...");
      delay(2000);
      ESP.restart();
    } else {
      Serial.println("❌ Authentication failed");
      resetToSetupMode("Login gagal. Periksa email dan password.");
    }
  } else {
    Serial.println("\n❌ WiFi connection failed");
    resetToSetupMode("Koneksi WiFi gagal. Periksa password WiFi.");
  }
}

void handleGSMSetup(String email, String password) {
  // Send response immediately
  server.send(200, "text/html", generateConnectingHTML("GSM", "Menginisialisasi modem GSM dan mencari jaringan..."));
  
  Serial.println("📱 Initializing GSM connection...");
  
  // Try GSM connection
  if (initializeGSMConnection()) {
    userEmail = email;
    userPassword = password;
    gsmMode = true;
    wifiConnected = true;
    gsmConnected = true;
    
    Serial.println("✅ GSM connected");
    
    // Try authentication
    if (authenticateUser()) {
      Serial.println("✅ Setup completed successfully - Restarting...");
      delay(2000);
      ESP.restart();
    } else {
      Serial.println("❌ Authentication failed");
      resetToSetupMode("Login gagal. Periksa email, password, dan koneksi data.");
    }
  } else {
    Serial.println("❌ GSM connection failed");
    resetToSetupMode("Koneksi GSM gagal. Periksa SIM card, sinyal, dan kuota data.");
  }
}

String generateConnectingHTML(String mode, String message) {
  String html = "<!DOCTYPE html><html><head>";
  html += "<meta charset=\"utf-8\">";
  html += "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">";
  html += "<title>Connecting...</title>";
  html += "<style>";
  html += "body { font-family: Arial, sans-serif; margin: 0; background: #f0f0f0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }";
  html += ".container { max-width: 400px; background: white; padding: 40px; border-radius: 8px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }";
  html += ".spinner { border: 4px solid #f3f3f3; border-top: 4px solid #007cba; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }";
  html += "@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }";
  html += ".message { color: #666; margin-top: 20px; }";
  html += "</style></head><body>";
  html += "<div class=\"container\">";
  html += "<h2>Setup Ngompas</h2>";
  html += "<div class=\"spinner\"></div>";
  html += "<h3>" + mode + " Mode</h3>";
  html += "<p class=\"message\">" + message + "</p>";
  html += "<p class=\"message\">Proses ini membutuhkan 30-90 detik...</p>";
  html += "</div></body></html>";
  
  return html;
}

void resetToSetupMode(String errorMessage) {
  Serial.println("🔄 Resetting to setup mode: " + errorMessage);
  
  // Clear connection preferences but keep login for retry
  prefs.remove("connection_mode");
  prefs.remove("wifi_ssid");
  prefs.remove("wifi_password");
  
  // Reset connection states
  wifiConnected = false;
  gsmConnected = false;
  gsmMode = false;
  isAuthenticated = false;
  
  delay(3000);
  ESP.restart();
}

void handleStatus() {
  String status = "{\"wifi\":\"" + String(wifiConnected ? "connected" : "disconnected") + "\",";
  status += "\"auth\":\"" + String(isAuthenticated ? "authenticated" : "not_authenticated") + "\"}";
  server.send(200, "application/json", status);
}

void handleNotFound() {
  // Redirect all unknown requests to setup page for captive portal
  server.sendHeader("Location", "/", true);
  server.send(302, "text/plain", "");
}

// ================= AUTHENTICATION FUNCTIONS =================
bool authenticateViaWiFi();
bool authenticateViaGSM();
void updateStockViaWiFi(String scheduleId);
void updateStockViaGSM(String scheduleId);

bool authenticateUser() {
  if (userEmail.length() == 0 || userPassword.length() == 0) {
    Serial.println("❌ No credentials available");
    return false;
  }
  
  if (!wifiConnected) {
    Serial.println("❌ No connection available");
    return false;
  }
  
  Serial.println("🔐 Authenticating user: " + userEmail);
  
  if (gsmMode) {
    return authenticateViaGSM();
  } else {
    return authenticateViaWiFi();
  }
}

bool authenticateViaWiFi() {
  HTTPClient http;
  http.begin(String(API_BASE_URL) + "/login");
  http.addHeader("Content-Type", "application/json");
  
  DynamicJsonDocument doc(512);
  doc["email"] = userEmail;
  doc["password"] = userPassword;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  String response = http.getString();
  
  Serial.println("WiFi HTTP Response Code: " + String(httpResponseCode));
  Serial.println("Response: " + response);
  
  if (httpResponseCode == 200) {
    DynamicJsonDocument responseDoc(1024);
    DeserializationError error = deserializeJson(responseDoc, response);
    
    if (!error && responseDoc["success"]) {
      accessToken = responseDoc["access_token"].as<String>();
      prefs.putString("token", accessToken);
      isAuthenticated = true;
      
      Serial.println("✅ WiFi Authentication successful");
      Serial.println("🔑 Token: " + accessToken.substring(0, 20) + "...");
      
      syncRTCTime();
      autoFetchAfterUpdate();
      
      http.end();
      return true;
    }
  }
  
  Serial.println("❌ WiFi Authentication failed");
  http.end();
  return false;
}

bool authenticateViaGSM() {
  Serial.println("📱 Authenticating via GSM HTTP...");
  
  // Prepare JSON data
  DynamicJsonDocument doc(512);
  doc["email"] = userEmail;
  doc["password"] = userPassword;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("📤 GSM Auth JSON: " + jsonString);
  
  // Create HTTP client
  HttpClient http(gsmClient, API_HOST, API_PORT);
  http.setTimeout(30000);
  
  // Start POST request
  http.beginRequest();
  http.post("/v1/api/login");
  http.sendHeader("Content-Type", "application/json");
  http.sendHeader("Content-Length", jsonString.length());
  http.beginBody();
  http.print(jsonString);
  http.endRequest();
  
  // Get response
  int statusCode = http.responseStatusCode();
  String response = http.responseBody();
  
  Serial.println("GSM HTTP Status: " + String(statusCode));
  Serial.println("GSM HTTP Response: " + response);
  
  http.stop();
  
  if (statusCode == 200) {
    // Parse JSON response
    DynamicJsonDocument responseDoc(1024);
    DeserializationError error = deserializeJson(responseDoc, response);
    
    if (!error) {
      if (responseDoc.containsKey("access_token")) {
        accessToken = responseDoc["access_token"].as<String>();
        prefs.putString("token", accessToken);
        isAuthenticated = true;
        Serial.println("✅ GSM Authentication successful");
        Serial.println("🔑 Token: " + accessToken.substring(0, 20) + "...");
        return true;
      } else {
        Serial.println("❌ Response missing access_token field");
      }
    } else {
      Serial.println("❌ GSM JSON parse error: " + String(error.c_str()));
    }
  } else {
    Serial.println("❌ GSM Authentication failed with code: " + String(statusCode));
  }
  
  Serial.println("❌ GSM Authentication failed");
  return false;
}

void syncRTCTime() {
  if (!wifiConnected) {
    Serial.println("❌ WiFi not connected, cannot sync RTC");
    return;
  }
  if (!rtcReady) {
    Serial.println("❌ RTC not initialized, skip NTP sync");
    return;
  }
  
  Serial.println("🕒 Syncing RTC with NTP server...");
  
  // Configure NTP for WIB timezone (+7 hours = 25200 seconds)
  const char* ntpServer1 = "id.pool.ntp.org";
  const char* ntpServer2 = "asia.pool.ntp.org";
  const char* ntpServer3 = "pool.ntp.org";
  const long gmtOffset_sec = 25200;  // UTC+7 (WIB)
  const int daylightOffset_sec = 0;  // No daylight saving in Indonesia
  
  // Initialize NTP (prefer configTzTime; fallback to configTime)
#if defined(ESP32) || defined(ESP8266)
  configTzTime("WIB-7", ntpServer1, ntpServer2, ntpServer3);
#else
  const long gmtOffset_sec = 25200;  // UTC+7
  const int daylightOffset_sec = 0;
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer1, ntpServer2, ntpServer3);
#endif
  
  // Wait for time sync (max 10 seconds)
  struct tm timeinfo;
  int attempts = 0;
  while (!getLocalTime(&timeinfo) && attempts < 20) {
    delay(500);
    attempts++;
    Serial.print(".");
  }
  
  if (attempts >= 20) {
    Serial.println("\n❌ Failed to sync with NTP server");
    return;
  }
  
  Serial.println("\n✅ NTP time synchronized");
  Serial.printf("Current time: %04d-%02d-%02d %02d:%02d:%02d\n", 
                timeinfo.tm_year + 1900, timeinfo.tm_mon + 1, timeinfo.tm_mday,
                timeinfo.tm_hour, timeinfo.tm_min, timeinfo.tm_sec);
  
  // Update RTC with NTP time
  DateTime ntpTime(timeinfo.tm_year + 1900, timeinfo.tm_mon + 1, timeinfo.tm_mday,
                   timeinfo.tm_hour, timeinfo.tm_min, timeinfo.tm_sec);
  
  rtc.adjust(ntpTime);
  lastNTPSync = millis(); // Update last sync time
  Serial.println("✅ RTC updated with NTP time");
}

// ================= DISPLAY FUNCTIONS =================
void showStartupScreen() {
  tft.fillScreen(TFT_BGCOLOR);
  
  int screenW = getScreenWidth();
  int screenH = getScreenHeight();
  int centerX = getScreenCenterX();
  int centerY = getScreenCenterY();
  
  // Show battery di pojok kanan atas (adaptif)
  if (batteryVoltage > 0) {
    drawBatteryIndicator(screenW - 35, 10);
  }
  
  tft.setTextColor(TFT_HEADER_COLOR, TFT_BGCOLOR);
  tft.setTextSize(2);
  // Center title
  tft.setCursor(centerX - 80, centerY - 40);
  tft.print("NgomPas System");
  
  tft.setTextColor(TFT_TEXTCOLOR, TFT_BGCOLOR);
  tft.setTextSize(1);
  tft.setCursor(centerX - 70, centerY);
  tft.print("Memulai sistem...");
  
  tft.setCursor(centerX - 85, centerY + 20);
  tft.print("Memeriksa koneksi...");
  
  displayInitialized = false;
  currentDisplay = STARTUP;
}

void updateDisplay(unsigned long currentTime) {
  // Update display every 1 second
  if (currentTime - lastDisplayUpdate < 1000) {
    return;
  }
  lastDisplayUpdate = currentTime;
  
  // Handle different display states properly
  switch (currentDisplay) {
    case SUCCESS:
    case ERROR:
    case STARTUP:
      // These are temporary states, determine what to show next
      if (activeCount > 0) {
        showActiveScheduleScreen();
      } else {
        showMainScreen();
      }
      break;
      
    case ACTIVE_SCHEDULE:
      if (activeCount > 0) {
        updateActiveScheduleScreen();
      } else {
        // No more active schedules, switch to main screen
        showMainScreen();
      }
      break;
      
    case MAIN:
      if (activeCount > 0) {
        // Active schedules appeared, switch to active schedule screen
        showActiveScheduleScreen();
      } else {
        updateMainScreen();
      }
      break;
  }
}

void showMainScreen() {
  tft.fillScreen(TFT_BGCOLOR);
  
  int screenW = getScreenWidth();
  int screenH = getScreenHeight();
  
  // Header with WiFi and Auth status
  tft.setTextColor(TFT_HEADER_COLOR, TFT_BGCOLOR);
  tft.setTextSize(1);
  tft.setCursor(10, 10);
  tft.print("Jaringan: " + String(wifiConnected ? "Terhubung " : "Terputus "));
  
  tft.setCursor((screenW / 2) - 25, 10);
  tft.print("Akun: " + String(isAuthenticated ? " Login" : " Belum Login"));
  
  // Battery indicator di kanan atas (adaptif)
  drawBatteryIndicator(screenW - 35, 10);
  
  // Current time
  DateTime now = rtc.now();
  String timeStr = formatDateTime(now);
  tft.setTextColor(TFT_TEXTCOLOR, TFT_BGCOLOR);
  tft.setTextSize(2);
  tft.setCursor(10, 45);
  tft.print(timeStr);
  
  // Next schedule info
  String nextSchedule = getNextScheduleInfo();
  tft.setTextSize(2);
  // tft.setCursor(10, 105);
  // tft.print("Berikutnya: " + nextSchedule);
  
  // Dose statistics section
  // tft.setTextColor(TFT_HEADER_COLOR, TFT_BGCOLOR);
  // tft.setCursor(10, 50);
  // tft.print("Statistik Hari Ini:");
  
  // Statistics with colors (adaptif spacing)
  int colWidth = screenW / 2;
  tft.setCursor(10, 80);
  tft.setTextColor(TFT_PENDING_COLOR, TFT_BGCOLOR);
  tft.print("Menunggu: " + String(pendingCount));
  
  tft.setCursor(colWidth, 80);
  tft.setTextColor(TFT_TAKEN_COLOR, TFT_BGCOLOR);
  tft.print("Diambil: " + String(takenCount));
  
  tft.setCursor(10, 110);
  tft.setTextColor(TFT_MISSED_COLOR, TFT_BGCOLOR);
  tft.print("Terlewat: " + String(missedCount));
  
  // System status
  tft.setCursor(10, 180);
  if (isAuthenticated && wifiConnected) {
    tft.setTextColor(TFT_SUCCESS_COLOR, TFT_BGCOLOR);
    tft.setTextSize(2);
    tft.print("Sistem Siap");
  } else {
    tft.setTextColor(TFT_HEADER_COLOR, TFT_BGCOLOR);
    tft.setTextSize(2);
    tft.print("konek wifi ngompas");
    tft.setCursor(10, 200);
    tft.print("dan buka di browser:");
    tft.setCursor(10, 220);
    tft.print("192.168.4.1");
  }
  
  currentDisplay = MAIN;
  displayInitialized = true;
}

void updateMainScreen() {
  int screenW = getScreenWidth();
  
  // Update battery indicator (adaptif)
  drawBatteryIndicator(screenW - 35, 10);
  
  // Update only the time to avoid flicker
  DateTime now = rtc.now();
  String timeStr = formatDateTime(now);
  
  tft.fillRect(10, 45, screenW - 50, 30, TFT_BGCOLOR);
  tft.setTextColor(TFT_TEXTCOLOR, TFT_BGCOLOR);
  tft.setTextSize(2);
  tft.setCursor(10, 45);
  tft.print(timeStr);
  
  // Update statistics area (clear and redraw) - adaptif
  tft.fillRect(10, 140, screenW - 20, 15, TFT_BGCOLOR);
  
  int colWidth = screenW / 2;
  tft.setCursor(10, 80);
  tft.setTextColor(TFT_PENDING_COLOR, TFT_BGCOLOR);
  tft.print("Menunggu: " + String(pendingCount));
  
  tft.setCursor(colWidth, 80);
  tft.setTextColor(TFT_TAKEN_COLOR, TFT_BGCOLOR);
  tft.print("Diambil: " + String(takenCount));
  
  tft.setCursor(10, 110);
  tft.setTextColor(TFT_MISSED_COLOR, TFT_BGCOLOR);
  tft.print("Terlewat: " + String(missedCount));
}

void showActiveScheduleScreen() {
  tft.fillScreen(TFT_BGCOLOR);
  
  int screenW = getScreenWidth();
  int centerX = getScreenCenterX();
  
  // Alert header
  tft.setTextColor(TFT_WARNING_COLOR, TFT_BGCOLOR);
  tft.setTextSize(2);
  tft.setCursor(centerX - 100, 20);
  tft.print("WAKTUNYA MINUM OBAT");
  
  // Battery indicator di kanan atas (adaptif)
  drawBatteryIndicator(screenW - 35, 45);
  
  // Current time
  DateTime now = rtc.now();
  String timeStr = formatTime(now);
  tft.setTextColor(TFT_HEADER_COLOR, TFT_BGCOLOR);
  tft.setTextSize(2);
  tft.setCursor(screenW - 100, 200);
  tft.print(timeStr);
  
  // Table header
  tft.setTextColor(TFT_TEXTCOLOR, TFT_BGCOLOR);
  tft.setTextSize(2);
  tft.setCursor(10, 60);
  tft.print("Slot | Dosis         ");
  tft.drawLine(10, 75, screenW - 10, 75, TFT_TEXTCOLOR);
  
  // Show active schedules
  for (int i = 0; i < activeCount; i++) {
    ActiveSchedule& schedule = activeSchedules[i];
    int y = 85 + (i * 20);
    
    // Slot
    tft.setCursor(10, y);
    tft.print(String(schedule.slot));
    
    // Medication name (truncated if too long)
    // tft.setCursor(30, y);
    // String medication = schedule.nama_obat;
    // if (medication.length() > 12) {
    //   medication = medication.substring(0, 12) + "...";
    // }
    // tft.print(medication);
    
    // Dosage
    tft.setCursor(100, y);
    String dosage = schedule.dosis;
    if (dosage.length() > 8) {
      dosage = dosage.substring(0, 8) + "...";
    }
    tft.print(dosage);
    
    // Status with color
    // tft.setCursor(220, y);
    // switch (schedule.state) {
    //   case ALERTING:
    //     tft.setTextColor(TFT_PENDING_COLOR, TFT_BGCOLOR);
    //     tft.print("menunggu");
    //     break;
    //   case TAKEN:
    //     tft.setTextColor(TFT_TAKEN_COLOR, TFT_BGCOLOR);
    //     tft.print("diambil");
    //     break;
    //   case MISSED:
    //     tft.setTextColor(TFT_MISSED_COLOR, TFT_BGCOLOR);
    //     tft.print("terlewat");
    //     break;
    // }
    tft.setTextColor(TFT_TEXTCOLOR, TFT_BGCOLOR); // Reset color
  }
  
  currentDisplay = ACTIVE_SCHEDULE;
  displayInitialized = true;
}

void updateActiveScheduleScreen() {
  // If the active list changed, redraw the whole screen once
  if (activeListDirty) {
    activeListDirty = false;
    showActiveScheduleScreen();
    return;
  }
  
  // Update battery indicator (adaptif)
  int screenW = getScreenWidth();
  drawBatteryIndicator(screenW - 35, 45);
  
  // Update time only
  DateTime now = rtc.now();
  String timeStr = formatTime(now);
  
  tft.fillRect(screenW - 100, 200, 70, 15, TFT_BGCOLOR);
  tft.setTextColor(TFT_HEADER_COLOR, TFT_BGCOLOR);
  tft.setTextSize(2);
  tft.setCursor(screenW - 100, 200);
  tft.print(timeStr);
}

void showSuccessScreen(String slot, String medication) {
  tft.fillScreen(TFT_BGCOLOR);
  
  int screenW = getScreenWidth();
  int centerX = getScreenCenterX();
  int centerY = getScreenCenterY();
  
  // Battery indicator (adaptif)
  drawBatteryIndicator(screenW - 35, 45);
  
  // Success icon (simple checkmark)
  tft.setTextColor(TFT_SUCCESS_COLOR, TFT_BGCOLOR);
  tft.setTextSize(4);
  tft.setCursor(centerX - 20, centerY - 40);
  tft.print("OK");
  
  // Success message
  tft.setTextSize(2);
  tft.setCursor(centerX - 70, centerY + 20);
  tft.print("OBAT DIAMBIL");
  
  // Details
  tft.setTextColor(TFT_TEXTCOLOR, TFT_BGCOLOR);
  tft.setTextSize(1);
  tft.setCursor(centerX - 60, centerY + 60);
  tft.print("Slot " + slot + ": " + medication);
  
  currentDisplay = SUCCESS;
  displayInitialized = true;
}

void showErrorScreen(String message) {
  tft.fillScreen(TFT_BGCOLOR);
  
  int screenW = getScreenWidth();
  int centerX = getScreenCenterX();
  int centerY = getScreenCenterY();
  
  // Battery indicator (adaptif)
  drawBatteryIndicator(screenW - 35, 45);
  
  // Error icon
  tft.setTextColor(TFT_ERROR_COLOR, TFT_BGCOLOR);
  tft.setTextSize(4);
  tft.setCursor(centerX - 50, centerY - 40);
  tft.print("ERROR");
  
  // Error message
  tft.setTextSize(1);
  tft.setCursor(centerX - 70, centerY + 20);
  tft.print("KESALAHAN: " + message);
  
  currentDisplay = ERROR;
  displayInitialized = true;
}

void showUnauthorizedAccess(String slot) {
  unsigned long startTime = millis();
  
  int centerX = getScreenCenterX();
  int centerY = getScreenCenterY();
  
  // Clear the entire screen completely
  tft.fillScreen(TFT_BGCOLOR);
  
  tft.setTextColor(TFT_ERROR_COLOR, TFT_BGCOLOR);
  tft.setTextSize(2);
  tft.setCursor(centerX - 120, centerY - 30);
  tft.print("ANDA SALAH BUKA OBAT");
  
  tft.setTextSize(1);
  tft.setCursor(centerX - 90, centerY + 10);
  tft.print("Slot " + slot + " dibuka tanpa jadwal");
  
  // Keep message for 5 seconds
  while (millis() - startTime < 5000) {
    delay(100);
  }
  
  // Clear the screen completely before returning to normal display
  tft.fillScreen(TFT_BGCOLOR);
  
  // Reset display state so updateDisplay() knows what to show
  if (activeCount > 0) {
    currentDisplay = STARTUP; // This will force showActiveScheduleScreen() to be called
  } else {
    currentDisplay = STARTUP; // This will force showMainScreen() to be called
  }
  
  displayInitialized = false; // Force redraw of normal screen
}

// ================= UTILITY FUNCTIONS =================
String formatDateTime(DateTime dt) {
  char buffer[32];
  sprintf(buffer, "%02d:%02d %s %02d/%02d/%02d", 
          dt.hour(), dt.minute(),
          getDayName(dt.dayOfTheWeek()).c_str(),
          dt.day(), dt.month(), dt.year() % 100);
  return String(buffer);
}

String formatTime(DateTime dt) {
  char buffer[16];
  sprintf(buffer, "%02d:%02d", dt.hour(), dt.minute());
  return String(buffer);
}

String getDayName(int dayOfWeek) {
  String days[] = {"Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"};
  return days[dayOfWeek];
}

String getMonthName(int month) {
  String months[] = {"", "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
                     "Jul", "Agu", "Sep", "Okt", "Nov", "Des"};
  return months[month];
}

uint32_t getCurrentEpoch() {
  DateTime now = rtc.now();
  return now.unixtime();
}

uint32_t parseTimeToEpoch(String timeStr) {
  // Parse time string like "08:00:00" to today's epoch
  int hour = timeStr.substring(0, 2).toInt();
  int minute = timeStr.substring(3, 5).toInt();
  int second = timeStr.substring(6, 8).toInt();
  
  DateTime now = rtc.now();
  DateTime timeToday(now.year(), now.month(), now.day(), hour, minute, second);
  
  return timeToday.unixtime();
}

String getNextScheduleInfo() {
  if (activeCount > 0) {
    return "Ada " + String(activeCount) + " jadwal aktif";
  }
  
  // TODO: Check upcoming schedules from scheduleData
  return "Tidak ada jadwal mendatang";
}

// Calculate dose log statistics
void calculateDoseStatistics() {
  pendingCount = 0;
  takenCount = 0;
  missedCount = 0;
  
  if (!doseLogDataLoaded) {
    return;
  }
  
  JsonArray doseLogs = doseLogData["data"];
  
  for (JsonObject log : doseLogs) {
    String status = log["status"];
    
    if (status == "pending") {
      pendingCount++;
    } else if (status == "taken") {
      takenCount++;
    } else if (status == "missed") {
      missedCount++;
    }
  }
  
  Serial.println("📊 Dose Statistics - Pending: " + String(pendingCount) + 
                ", Taken: " + String(takenCount) + 
                ", Missed: " + String(missedCount));
}

// Debug function to print all active schedules
void printActiveSchedules() {
  Serial.println("=== ACTIVE SCHEDULES DEBUG ===");
  Serial.println("Active count: " + String(activeCount));
  
  for (int i = 0; i < activeCount; i++) {
    ActiveSchedule& schedule = activeSchedules[i];
    Serial.println("Schedule " + String(i) + ":");
    Serial.println("  - ID: " + schedule.id_obat);
    Serial.println("  - Slot: " + String(schedule.slot));
    Serial.println("  - Medication: " + schedule.nama_obat);
    Serial.println("  - State: " + String(schedule.state));
    Serial.println("  - Start: " + String(schedule.startEpoch));
    Serial.println("  - End: " + String(schedule.endEpoch));
  }
  Serial.println("==============================");
}

// Helper function to get active schedules for a specific slot
int getActiveScheduleForSlot(char slot) {
  for (int i = 0; i < activeCount; i++) {
    if (activeSchedules[i].slot == slot && activeSchedules[i].state == ALERTING) {
      return i;
    }
  }
  return -1; // Not found
}

// ================= BUTTON HANDLING =================
void handleButtons() {
  unsigned long currentTime = millis();
  
  // Debounce check
  if (currentTime - lastButtonCheck < 50) {
    return;
  }
  lastButtonCheck = currentTime;
  
  // Reset button (GPIO12) - 3 second hold to reset WiFi AND login
  if (digitalRead(RESET_WIFI_BUTTON) == LOW) {
    if (!wifiButtonPressed) {
      wifiButtonPressed = true;
      wifiButtonPressStart = currentTime;
      Serial.println("📱 Reset button pressed");
    } else if (currentTime - wifiButtonPressStart >= 3000) {
      // Button held for 3+ seconds - reset WiFi and login credentials
      Serial.println("  Reset triggered - clearing WiFi and login data");
      resetAllCredentials();
      wifiButtonPressed = false;
    }
  } else {
    wifiButtonPressed = false;
  }
}

void resetAllCredentials() {
  Serial.println("🔄 Resetting all credentials and settings...");
  
  // Clear ALL stored preferences
  prefs.clear();
  
  // Reset all global variables
  isAuthenticated = false;
  wifiConnected = false;
  gsmConnected = false;
  gsmMode = false;
  accessToken = "";
  userEmail = "";
  userPassword = "";
  
  // Show reset message
  tft.fillScreen(TFT_BGCOLOR);
  tft.setTextColor(TFT_WARNING_COLOR, TFT_BGCOLOR);
  tft.setTextSize(2);
  tft.setCursor(50, 60);
  tft.print("RESET TOTAL");
  
  tft.setTextSize(1);
  tft.setTextColor(TFT_TEXTCOLOR, TFT_BGCOLOR);
  tft.setCursor(30, 100);
  tft.print("Semua pengaturan dihapus");
  
  tft.setCursor(40, 120);
  tft.print("Mode koneksi: Reset ke awal");
  
  tft.setCursor(60, 140);
  tft.print("Login akun: Reset ke awal");
  
  tft.setCursor(80, 170);
  tft.print("Restarting dalam 3 detik...");
  
  delay(3000);
  ESP.restart();
}

// ================= WIFI CONNECTION MANAGEMENT =================
void checkWiFiConnection() {
  static unsigned long lastWiFiCheck = 0;
  unsigned long currentTime = millis();
  
  // Check every 30 seconds
  if (currentTime - lastWiFiCheck < 30000) {
    return;
  }
  lastWiFiCheck = currentTime;
  
  if (WiFi.status() == WL_CONNECTED) {
    if (!wifiConnected) {
      wifiConnected = true;
      Serial.println("✅ WiFi reconnected");
      // Re-sync RTC on reconnection
      if (rtcReady) {
        syncRTCTime();
      }
      // Re-authenticate to restore access token for API calls
      if (!isAuthenticated) {
        Serial.println("🔐 Re-authenticating after WiFi reconnection...");
        authenticateUser();
      }
    }
  } else {
    if (wifiConnected) {
      wifiConnected = false;
      isAuthenticated = false;
      Serial.println("❌ WiFi disconnected");
      
      // Force all LEDs OFF when WiFi disconnected
      forceAllLEDsOff();
    }
  }
}

// ================= MAIN MEDICATION SCHEDULING =================
void handleMedicationScheduling(unsigned long currentTime) {
  // Dynamic interval: 1m if active schedules, 2m if idle
  unsigned long checkInterval = (activeCount > 0) ? 60000 : 120000;
  
  // START FETCH (non-blocking initiation)
  if (!isFetching && (currentTime - lastScheduleCheck >= checkInterval || !scheduleDataLoaded || !doseLogDataLoaded)) {
    Serial.println("🚀 Initiating non-blocking data fetch...");
    isFetching = true;
    fetchStartTime = currentTime;
    lastScheduleCheck = currentTime;
    
    // Show loading message on screen (adaptif)
    if (currentDisplay == MAIN) {
      int screenW = getScreenWidth();
      int screenH = getScreenHeight();
      tft.fillRect(10, screenH - 60, screenW - 20, 20, TFT_BGCOLOR);
      tft.setTextColor(TFT_WARNING_COLOR, TFT_BGCOLOR);
      tft.setTextSize(1);
      tft.setCursor(10, screenH - 60);
      tft.print("Mengambil data jadwal...");
    }
  }
  
  // HANDLE ONGOING FETCH (non-blocking)
  if (isFetching) {
    // Check timeout
    if (currentTime - fetchStartTime > FETCH_TIMEOUT) {
      Serial.println("⏱️ Fetch timeout, aborting...");
      isFetching = false;
      fetchState = 0;
      fetchAttempt = 0;
      
      // Clear loading message (adaptif)
      if (currentDisplay == MAIN) {
        int screenW = getScreenWidth();
        int screenH = getScreenHeight();
        tft.fillRect(10, screenH - 60, screenW - 20, 20, TFT_BGCOLOR);
      }
      return;
    }
    
    // Perform fetch (non-blocking version)
    bool fetchComplete = performNonBlockingFetch();
    
    if (fetchComplete) {
      Serial.println("✅ Fetch completed");
      isFetching = false;
      
      // Clear loading message
      if (currentDisplay == MAIN) {
        tft.fillRect(10, 180, 300, 20, TFT_BGCOLOR);
      }
      
      if (scheduleDataLoaded && doseLogDataLoaded) {
        processScheduleData();
        
        // Debug: Print active schedules after processing
        if (activeCount > 0) {
          printActiveSchedules();
        }
      }
    }
  }
  
  // ❌ REMOVED: checkIRSensors() from here - moved to main loop for higher priority
}

bool performNonBlockingFetch() {
  switch (fetchState) {
    case 0: // Start fetching schedule
      Serial.println("📅 Fetching schedule data (attempt " + String(fetchAttempt + 1) + ")...");
      fetchState = 1;
      return false;
      
    case 1: // Fetch schedule
      scheduleDataLoaded = fetchData("/jadwal/get-for-iot", scheduleData);
      
      if (scheduleDataLoaded) {
        Serial.println("✅ Schedule data loaded");
        fetchAttempt = 0;
        fetchState = 2; // Move to dose log fetch
      } else {
        fetchAttempt++;
        if (fetchAttempt >= MAX_FETCH_ATTEMPTS) {
          Serial.println("❌ Schedule fetch failed after " + String(MAX_FETCH_ATTEMPTS) + " attempts");
          fetchAttempt = 0;
          fetchState = 2; // Try dose log anyway
        }
      }
      return false;
      
    case 2: // Start fetching dose log
      Serial.println("💊 Fetching dose log data (attempt " + String(fetchAttempt + 1) + ")...");
      fetchState = 3;
      return false;
      
    case 3: // Fetch dose log
      doseLogDataLoaded = fetchData("/dose-log/status-today", doseLogData);
      
      if (doseLogDataLoaded) {
        Serial.println("✅ Dose log data loaded");
        calculateDoseStatistics();
        fetchAttempt = 0;
        fetchState = 0; // Reset state machine
        return true; // Fetch complete
      } else {
        fetchAttempt++;
        if (fetchAttempt >= MAX_FETCH_ATTEMPTS) {
          Serial.println("❌ Dose log fetch failed after " + String(MAX_FETCH_ATTEMPTS) + " attempts");
          fetchAttempt = 0;
          fetchState = 0; // Reset state machine
          return true; // Fetch complete (even if failed)
        }
      }
      return false;
      
    default:
      fetchState = 0;
      return true;
  }
}

bool fetchDataWithRetry(String endpoint, DynamicJsonDocument& data, int maxRetries = 3) {
  for (int attempt = 1; attempt <= maxRetries; attempt++) {
    Serial.println("📡 Fetch attempt " + String(attempt) + "/" + String(maxRetries) + " for " + endpoint);
    
    if (fetchData(endpoint, data)) {
      Serial.println("✅ Fetch successful on attempt " + String(attempt));
      return true;
    }
    
    Serial.println("❌ Fetch failed on attempt " + String(attempt));
    if (attempt < maxRetries) {
      delay(2000); // 2s delay between retries
    }
  }
  
  Serial.println("❌ All fetch attempts failed for " + endpoint);
  return false;
}

bool fetchData(String endpoint, DynamicJsonDocument& data) {
  if (!wifiConnected || !isAuthenticated) {
    return false;
  }
  
  if (gsmMode) {
    return fetchDataViaGSM(endpoint, data);
  } else {
    return fetchDataViaWiFi(endpoint, data);
  }
}

bool fetchDataViaWiFi(String endpoint, DynamicJsonDocument& data) {
  HTTPClient http;
  http.begin(String(API_BASE_URL) + endpoint);
  http.addHeader("Authorization", "Bearer " + accessToken);
  
  int httpResponseCode = http.GET();
  String response = http.getString();
  
  if (httpResponseCode == 200) {
    data.clear();
    DeserializationError error = deserializeJson(data, response);
    
    if (!error) {
      http.end();
      return true;
    }
  }
  
  http.end();
  return false;
}

bool fetchDataViaGSM(String endpoint, DynamicJsonDocument& data) {
  Serial.println("📱 Fetching data via GSM: " + endpoint);
  
  // Create HTTP client
  HttpClient http(gsmClient, API_HOST, API_PORT);
  
  // Set timeout
  http.setTimeout(30000);
  
  // Build full path
  String path = "/v1/api" + endpoint;
  
  // Start request
  http.beginRequest();
  http.get(path);
  
  // Add headers
  http.sendHeader("Content-Type", "application/json");
  http.sendHeader("Authorization", "Bearer " + accessToken);
  http.endRequest();
  
  // Get response
  int statusCode = http.responseStatusCode();
  String response = http.responseBody();
  
  Serial.println("📱 GSM HTTP Status: " + String(statusCode));
  
  if (statusCode == 200) {
    data.clear();
    DeserializationError error = deserializeJson(data, response);
    
    http.stop();
    
    if (!error) {
      Serial.println("✅ GSM fetch successful for: " + endpoint);
      return true;
    } else {
      Serial.println("❌ GSM JSON parse error: " + String(error.c_str()));
    }
  } else {
    Serial.println("❌ GSM HTTP failed with code: " + String(statusCode));
    Serial.println("Response: " + response);
  }
  
  http.stop();
  return false;
}

void fetchScheduleData() {
  Serial.println("📅 Fetching schedule data...");
  scheduleDataLoaded = fetchDataWithRetry("/jadwal/get-for-iot", scheduleData);
  
  if (scheduleDataLoaded) {
    Serial.println("✅ Schedule data loaded successfully");
  } else {
    Serial.println("❌ Failed to load schedule data");
  }
}

void fetchDoseLogData() {
  Serial.println("💊 Fetching dose log data...");
  doseLogDataLoaded = fetchDataWithRetry("/dose-log/status-today", doseLogData);
  
  if (doseLogDataLoaded) {
    Serial.println("✅ Dose log data loaded successfully");
    calculateDoseStatistics(); // Calculate statistics after loading data
  } else {
    Serial.println("❌ Failed to load dose log data");
  }
}

void autoFetchAfterUpdate() {
  Serial.println("=== AUTO-FETCH AFTER UPDATE ===");
  
  // Use direct fetch instead of retry to avoid blocking too long
  bool scheduleSuccess = fetchData("/jadwal/get-for-iot", scheduleData);
  bool doseLogSuccess = fetchData("/dose-log/status-today", doseLogData);
  
  // Update loaded flags independently so consumers can act on available data
  scheduleDataLoaded = scheduleSuccess;
  doseLogDataLoaded = doseLogSuccess;

  if (doseLogSuccess) {
    calculateDoseStatistics();
  }

  if (scheduleSuccess && doseLogSuccess) {
    Serial.println("✅ Auto-fetch completed successfully");
    processScheduleData(); // reprocess activeSchedules[] with new data
  } else if (scheduleSuccess && !doseLogSuccess) {
    Serial.println("⚠ Auto-fetch: schedule OK, dose logs failed");
  } else if (!scheduleSuccess && doseLogSuccess) {
    Serial.println("⚠ Auto-fetch: dose logs OK, schedule failed");
  } else {
    Serial.println("❌ Auto-fetch: both schedule and dose logs failed");
  }
}

void processScheduleData() {
  Serial.println("🔄 Processing schedule data...");
  Serial.println("🔄 Current active count before processing: " + String(activeCount));
  
  // Clear expired schedules first
  uint32_t now = getCurrentEpoch();
  for (int i = activeCount - 1; i >= 0; i--) {
    if (now > activeSchedules[i].endEpoch) {
      Serial.println("🗑 Removing expired schedule for slot " + String(activeSchedules[i].slot));
      removeActiveSchedule(i);
    }
  }
  
  // Parse new schedules from API and dose status
  // NOTE: Schedule conflicts are validated at the web application level,
  // so we can trust the server data without additional conflict checking
  JsonArray schedules = scheduleData["jadwalMinum"];
  JsonArray doseLogs = doseLogData["data"];
  
  for (JsonObject schedule : schedules) {
    String id_obat = schedule["id"];
    String slot_obat = schedule["slot_obat"];
    JsonArray jam_awal = schedule["jam_awal"];
    JsonArray jam_berakhir = schedule["jam_berakhir"];
    
    for (int i = 0; i < jam_awal.size(); i++) {
      String startTime = jam_awal[i];
      String endTime = jam_berakhir[i];
      uint32_t startEpoch = parseTimeToEpoch(startTime);
      uint32_t endEpoch = parseTimeToEpoch(endTime);
      
      // Check if within time window
      if (now >= startEpoch && now <= endEpoch) {
        // Check dose status from dose-log
        String doseStatus = getDoseStatus(doseLogs, id_obat, startTime);
        
        // Only add if status is pending and not already in activeSchedules
        if (doseStatus == "pending" && !isAlreadyActive(id_obat, startTime)) {
          Serial.println("➕ Adding new active schedule for slot " + slot_obat + " at " + startTime);
          addActiveSchedule(id_obat, slot_obat.charAt(0), schedule["nama_obat"], 
                           schedule["dosis_obat"], startEpoch, endEpoch);
        } else {
          Serial.println("⏭ Skipping schedule for slot " + slot_obat + " - Status: " + doseStatus + ", Already active: " + String(isAlreadyActive(id_obat, startTime)));
        }
      }
    }
  }
  
  Serial.println("🔄 Final active count after processing: " + String(activeCount));
  
  // Update LED status
  updateLEDStatus();
}

String getDoseStatus(JsonArray doseLogs, String scheduleId, String timeSlot) {
  for (JsonObject log : doseLogs) {
    if (log["jadwal_id"] == scheduleId && log["dose_time"] == timeSlot) {
      return log["status"];
    }
  }
  return "unknown";
}

bool isAlreadyActive(String id_obat, String timeSlot) {
  for (int i = 0; i < activeCount; i++) {
    // Check both medication ID and time slot to allow same medication at different times
    if (activeSchedules[i].id_obat == id_obat) {
      uint32_t checkEpoch = parseTimeToEpoch(timeSlot);
      if (activeSchedules[i].startEpoch == checkEpoch) {
        return true;
      }
    }
  }
  return false;
}

void addActiveSchedule(String id_obat, char slot, String nama_obat, String dosis, uint32_t startEpoch, uint32_t endEpoch) {
  if (activeCount >= 6) {
    Serial.println("⚠ Maximum active schedules reached");
    return;
  }
  
  ActiveSchedule& schedule = activeSchedules[activeCount];
  schedule.id_obat = id_obat;
  schedule.slot = slot;
  schedule.nama_obat = nama_obat;
  schedule.dosis = dosis;
  schedule.startEpoch = startEpoch;
  schedule.endEpoch = endEpoch;
  schedule.state = ALERTING;
  schedule.notified = false;
  schedule.audioIndex = slot - 'A' + 1; // A=1, B=2, ..., F=6
  
  activeCount++;
  activeListDirty = true; // schedule list changed, trigger redraw if visible
  
  // Update LED status after adding schedule
  updateLEDStatus();
  
  Serial.println("✅ Added active schedule: " + nama_obat + " (Slot " + String(slot) + ")");
}

void removeActiveSchedule(int index) {
  if (index < 0 || index >= activeCount) {
    return;
  }
  
  Serial.println("🗑 Removing schedule: " + activeSchedules[index].nama_obat + " (Slot " + String(activeSchedules[index].slot) + ")");
  
  // More efficient removal: swap with last element instead of shifting
  if (index != activeCount - 1) {
    activeSchedules[index] = activeSchedules[activeCount - 1];
  }
  
  activeCount--;
  activeListDirty = true; // schedule list changed, trigger redraw if visible
  
  // Update LED status after removal
  updateLEDStatus();
}

// ================= LED CONTROL =================
void updateLEDStatus() {
  Serial.println("💡 Updating LED status - Active count: " + String(activeCount));
  Serial.println("💡 System status - WiFi: " + String(wifiConnected) + ", Auth: " + String(isAuthenticated));
  
  // Array of pin constants
  uint8_t ledPins[] = {P0, P1, P2, P3, P4, P5};
  
  // First, turn off all LEDs (set all pins to HIGH for common cathode LEDs)
  pcf8575.digitalWrite(P0, HIGH);  // Slot A
  pcf8575.digitalWrite(P1, HIGH);  // Slot B
  pcf8575.digitalWrite(P2, HIGH);  // Slot C
  pcf8575.digitalWrite(P3, HIGH);  // Slot D
  pcf8575.digitalWrite(P4, HIGH);  // Slot E
  pcf8575.digitalWrite(P5, HIGH);  // Slot F
  
  // Only turn on LEDs if system is ready (WiFi + Auth) AND has active schedules
  if (wifiConnected && isAuthenticated && activeCount > 0) {
    // Turn on LEDs for active schedules (set pins to LOW for common cathode LEDs)
    for (int i = 0; i < activeCount; i++) {
      if (activeSchedules[i].state == ALERTING) {
        int slotIndex = activeSchedules[i].slot - 'A'; // A=0, B=1, ..., F=5
        if (slotIndex >= 0 && slotIndex < 6) {
          Serial.println("💡 Turning ON LED for slot " + String(activeSchedules[i].slot) + " (pin P" + String(slotIndex) + ")");
          pcf8575.digitalWrite(ledPins[slotIndex], LOW); // Turn on LED
        }
      }
    }
    
    // Update status LED
    digitalWrite(LED_STATUS, HIGH);
    Serial.println("💡 Status LED: ON (system ready with active schedules)");
  } else {
    // System not ready or no active schedules - keep all LEDs OFF
    digitalWrite(LED_STATUS, LOW);
    if (!wifiConnected) {
      Serial.println("💡 Status LED: OFF (WiFi not connected)");
    } else if (!isAuthenticated) {
      Serial.println("💡 Status LED: OFF (not authenticated)");
    } else {
      Serial.println("💡 Status LED: OFF (no active schedules)");
    }
  }
  
  // Debug LED status
  debugLEDStatus();
}

void debugLEDStatus() {
  Serial.println("=== LED STATUS DEBUG ===");
  for (int i = 0; i < 6; i++) {
    char slot = 'A' + i;
    bool hasActiveSchedule = false;
    
    // Check if this slot has an active schedule
    for (int j = 0; j < activeCount; j++) {
      if (activeSchedules[j].slot == slot && activeSchedules[j].state == ALERTING) {
        hasActiveSchedule = true;
        break;
      }
    }
    
    Serial.println("Slot " + String(slot) + " (LED " + String(i) + "): Should be " + 
                   String(hasActiveSchedule ? "ON" : "OFF"));
  }
  Serial.println("========================");
}

void forceAllLEDsOff() {
  Serial.println("💡 Forcing all LEDs OFF");
  
  // Explicitly turn off each LED pin
  pcf8575.digitalWrite(P0, HIGH);  // Slot A OFF
  pcf8575.digitalWrite(P1, HIGH);  // Slot B OFF
  pcf8575.digitalWrite(P2, HIGH);  // Slot C OFF
  pcf8575.digitalWrite(P3, HIGH);  // Slot D OFF
  pcf8575.digitalWrite(P4, HIGH);  // Slot E OFF
  pcf8575.digitalWrite(P5, HIGH);  // Slot F OFF
  
  // Also turn off status LED
  digitalWrite(LED_STATUS, LOW);
  
  Serial.println("💡 All LEDs forced OFF");
}

void testBuzzer() {
  Serial.println("🔊 Buzzer test started");
  Serial.println("   Pin: GPIO " + String(BUZZER_PIN));
  
  // ✅ Set flag untuk prevent handleBuzzer interference
  buzzerTestMode = true;
  Serial.println("   buzzerTestMode = true");
  
  // Ensure pin is OUTPUT and LOW first
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  delay(100);
  Serial.println("   Pin initialized as OUTPUT, set to LOW");
  
  // Test 1: Short beep
  Serial.println("   Test 1: Beep 200ms");
  digitalWrite(BUZZER_PIN, HIGH);
  Serial.println("   → Pin set to HIGH");
  delay(200);
  digitalWrite(BUZZER_PIN, LOW);
  Serial.println("   → Pin set to LOW");
  delay(100);
  
  // Test 2: Short beep
  Serial.println("   Test 2: Beep 200ms");
  digitalWrite(BUZZER_PIN, HIGH);
  Serial.println("   → Pin set to HIGH");
  delay(200);
  digitalWrite(BUZZER_PIN, LOW);
  Serial.println("   → Pin set to LOW");
  delay(100);
  
  // Test 3: Long beep
  Serial.println("   Test 3: Long beep 500ms");
  digitalWrite(BUZZER_PIN, HIGH);
  Serial.println("   → Pin set to HIGH");
  delay(500);
  digitalWrite(BUZZER_PIN, LOW);
  Serial.println("   → Pin set to LOW");
  
  // ✅ Clear flag setelah test selesai
  buzzerTestMode = false;
  Serial.println("   buzzerTestMode = false");
  
  Serial.println("🔊 Buzzer test completed");
  Serial.println("");
}

// ================= IR SENSOR MONITORING =================
void checkIRSensors() {
  // ✅ This function now runs at HIGHEST PRIORITY in main loop
  // It will interrupt/pause any fetch operation if user action detected
  
  for (int i = activeCount - 1; i >= 0; i--) { // Iterate backwards for safe removal
    ActiveSchedule& schedule = activeSchedules[i];
    
    if (schedule.state == ALERTING && isSlotOpened(schedule.slot)) {
      Serial.println("✅ Slot " + String(schedule.slot) + " opened - IMMEDIATE ACTION");
      
      // ✅ PRIORITY ACTION: Pause fetch immediately
      if (isFetching) {
        Serial.println("⚠️ PAUSING FETCH - User opened slot " + String(schedule.slot));
        isFetching = false;
        fetchState = 0;
        fetchAttempt = 0;
        
        // Clear loading message immediately
        if (currentDisplay == MAIN) {
          tft.fillRect(10, 180, 300, 20, TFT_BGCOLOR);
        }
      }
      
      // Update medication stock
      updateMedicationStock(schedule.id_obat);
      
      // Mark as taken
      schedule.state = TAKEN;
      
      // Show success screen
      showSuccessScreen(String(schedule.slot), schedule.nama_obat);
      delay(3000);
      
      // Clear screen and reset display state for proper transition
      tft.fillScreen(TFT_BGCOLOR);
      currentDisplay = STARTUP; // Force redraw of appropriate screen
      displayInitialized = false;
      
      // Remove from active schedules (safe with backwards iteration)
      removeActiveSchedule(i);
      
      // ✅ RETURN IMMEDIATELY after processing to avoid checking other slots
      // This ensures fastest possible response
      return;
    }
  }
  
  // Check for unauthorized access
  checkUnauthorizedAccess();
}

bool isSlotOpened(char slot) {
  int sensorValue = 0;
  
  switch (slot) {
    case 'A': sensorValue = digitalRead(SLOT_A_SENSOR); break;
    case 'B': sensorValue = digitalRead(SLOT_B_SENSOR); break;
    case 'C': sensorValue = digitalRead(SLOT_C_SENSOR); break;
    case 'D': sensorValue = digitalRead(SLOT_D_SENSOR); break;
    case 'E': sensorValue = digitalRead(SLOT_E_SENSOR); break;
    case 'F': sensorValue = digitalRead(SLOT_F_SENSOR); break;
    default: return false;
  }
  
  // IR sensor LOW = object detected (closed), HIGH = no object (opened)
  return sensorValue == HIGH;
}

void checkUnauthorizedAccess() {
  static unsigned long lastUnauthorizedCheck = 0;
  unsigned long currentTime = millis();
  
  // ✅ Reduce check interval from 2s to 500ms for faster detection
  if (currentTime - lastUnauthorizedCheck < 500) {
    return;
  }
  lastUnauthorizedCheck = currentTime;
  
  char slots[] = {'A', 'B', 'C', 'D', 'E', 'F'};
  
  for (int i = 0; i < 6; i++) {
    char slot = slots[i];
    
    if (isSlotOpened(slot)) {
      // Check if this slot is authorized (in activeSchedules)
      bool authorized = false;
      for (int j = 0; j < activeCount; j++) {
        if (activeSchedules[j].slot == slot && activeSchedules[j].state == ALERTING) {
          authorized = true;
          break;
        }
      }
      
      if (!authorized) {
        Serial.println("⚠ UNAUTHORIZED ACCESS - Slot " + String(slot) + " - IMMEDIATE ACTION");
        
        // ✅ PRIORITY ACTION: Pause fetch immediately
        if (isFetching) {
          Serial.println("⚠️ PAUSING FETCH - Unauthorized access on slot " + String(slot));
          isFetching = false;
          fetchState = 0;
          fetchAttempt = 0;
          
          // Clear loading message immediately
          if (currentDisplay == MAIN) {
            tft.fillRect(10, 180, 300, 20, TFT_BGCOLOR);
          }
        }
        
        // ✅ AUDIO + BUZZER WARNING: BERSAMAAN untuk akses tidak sah (3 DETIK)
        Serial.println("🔊🔔 Playing AUDIO + BUZZER together for unauthorized access (3s)");
        Serial.println("   Pin: GPIO " + String(BUZZER_PIN));
        
        // ✅ Set flag untuk prevent handleBuzzer interference
        buzzerTestMode = true;
        Serial.println("   buzzerTestMode = true");
        
        // ✅ PLAY AUDIO + BUZZER BERSAMAAN selama 3 detik
        if (dfPlayerInitialized) {
          Serial.println("🔊 Starting audio file 009 (1x) with buzzer for 3 seconds");
          
          // Start audio 009.mp3
          dfPlayer.play(9);
          delay(50);  // Brief delay untuk DFPlayer start
          
          // Buzzer berbunyi selama 3 detik bersamaan dengan audio
          unsigned long buzzerStart = millis();
          while (millis() - buzzerStart < 3000) {  // 3 detik
            digitalWrite(BUZZER_PIN, HIGH);
            delay(80);  // Rapid beep pattern
            digitalWrite(BUZZER_PIN, LOW);
            delay(80);
          }
          
          // Pastikan buzzer OFF
          digitalWrite(BUZZER_PIN, LOW);
          
        } else {
          Serial.println("⚠️ DFPlayer not initialized, playing buzzer only for 3s");
          
          // Buzzer only selama 3 detik jika DFPlayer gagal
          unsigned long buzzerStart = millis();
          while (millis() - buzzerStart < 3000) {
            digitalWrite(BUZZER_PIN, HIGH);
            delay(80);
            digitalWrite(BUZZER_PIN, LOW);
            delay(80);
          }
          digitalWrite(BUZZER_PIN, LOW);
        }
        
        // ✅ Clear flag setelah buzzer selesai
        buzzerTestMode = false;
        Serial.println("   buzzerTestMode = false");
        Serial.println("   Audio+Buzzer warning completed (3s)");
        
        showUnauthorizedAccess(String(slot));
        
        // Send alert to server
        sendUnauthorizedAlert(slot);
        
        // ✅ RETURN IMMEDIATELY after processing
        return;
      }
    }
  }
}

// ================= HELPER FUNCTION: FIND JADWAL ID BY SLOT =================
String findJadwalIdBySlot(char slot) {
  if (!scheduleDataLoaded) {
    Serial.println("⚠️ Schedule data not loaded yet");
    return ""; // Belum ada data
  }
  
  JsonArray schedules = scheduleData["jadwalMinum"];
  
  for (JsonObject schedule : schedules) {
    String slotObat = schedule["slot_obat"];
    
    if (slotObat.length() > 0 && slotObat.charAt(0) == slot) {
      String jadwalId = schedule["id"];
      Serial.println("✅ Found jadwal_id for slot " + String(slot) + ": " + jadwalId);
      return jadwalId;
    }
  }
  
  Serial.println("⏭ No jadwal found for slot " + String(slot) + " (slot kosong)");
  return ""; // Slot kosong
}

// ================= UNAUTHORIZED ACCESS ALERT =================
void sendUnauthorizedAlert(char slot) {
  if (!wifiConnected || !isAuthenticated) {
    return;
  }
  
  // ✅ CARI JADWAL_ID UNTUK SLOT INI
  String jadwalId = findJadwalIdBySlot(slot);
  
  if (jadwalId == "") {
    Serial.println("⏭ Slot " + String(slot) + " tidak ada jadwal, skip unauthorized alert");
    return; // ABAIKAN - Slot kosong, tidak perlu kirim alert
  }
  
  // ✅ STRUKTUR JSON SESUAI API SPEC
  // API expects: { id: jadwal_id, pesan: string }
  DynamicJsonDocument doc(512);
  doc["id"] = jadwalId; // ✅ id = jadwal_id (BUKAN timestamp!)
  doc["pesan"] = "Peringatan: pasien mencoba membuka obat pada slot " + String(slot) + " di luar jadwal";
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("📤 Sending unauthorized alert:");
  Serial.println("   Slot: " + String(slot));
  Serial.println("   Jadwal ID: " + jadwalId);
  Serial.println("   JSON: " + jsonString);
  
  if (gsmMode) {
    // GSM HTTP Alert using TinyGSM
    Serial.println("📍 Alert Endpoint: POST /peringatan/create-peringatan");
    Serial.println("🔑 Token length: " + String(accessToken.length()));
    
    HttpClient http(gsmClient, API_HOST, API_PORT);
    http.setTimeout(30000);
    
    http.beginRequest();
    http.post("/v1/api/peringatan/create-peringatan"); // Full path with /v1/api prefix
    http.sendHeader("Content-Type", "application/json");
    http.sendHeader("Authorization", "Bearer " + accessToken);
    http.sendHeader("Content-Length", jsonString.length());
    http.beginBody();
    http.print(jsonString);
    http.endRequest();
    
    int statusCode = http.responseStatusCode();
    String response = http.responseBody();
    http.stop();
    
    Serial.println("📱 GSM Alert Status: " + String(statusCode));
    if (statusCode == 200 || statusCode == 201) {
      Serial.println("✅ GSM Unauthorized alert sent successfully");
    } else {
      Serial.println("⚠️ GSM alert failed: " + String(statusCode));
      Serial.println("Response: " + response);
    }
    
  } else {
    // WiFi HTTP Alert
    HTTPClient http;
    http.begin(String(API_BASE_URL) + "/peringatan/create-peringatan");
    http.addHeader("Authorization", "Bearer " + accessToken);
    http.addHeader("Content-Type", "application/json");
    
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode == 200) {
      Serial.println("✅ WiFi Unauthorized alert sent successfully");
    } else {
      Serial.println("❌ Failed to send WiFi unauthorized alert: " + String(httpResponseCode));
    }
    
    http.end();
  }
}

// ================= MEDICATION STOCK UPDATE =================
void updateMedicationStock(String scheduleId) {
  Serial.println("📞 Updating medication stock for ID: " + scheduleId);
  
  if (!wifiConnected || !isAuthenticated) {
    Serial.println("❌ Cannot update stock: not connected or authenticated");
    return;
  }
  
  if (gsmMode) {
    updateStockViaGSM(scheduleId);
  } else {
    updateStockViaWiFi(scheduleId);
  }
}

void updateStockViaWiFi(String scheduleId) {
  HTTPClient http;
  http.begin(String(API_BASE_URL) + "/jadwal/update-stock-obat-iot");
  http.addHeader("Authorization", "Bearer " + accessToken);
  http.addHeader("Content-Type", "application/json");
  
  DynamicJsonDocument doc(512);
  doc["id_obat"] = scheduleId;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  int httpResponseCode = http.PUT(jsonString);
  String response = http.getString();
  
  Serial.println("WiFi Stock Update Response: " + String(httpResponseCode));
  
  if (httpResponseCode == 200) {
    Serial.println("✅ Stock updated successfully via WiFi");
    autoFetchAfterUpdate();
  } else {
    Serial.println("❌ Failed to update stock via WiFi");
  }
  
  http.end();
}

void updateStockViaGSM(String scheduleId) {
  Serial.println("📱 Updating stock via GSM...");
  
  DynamicJsonDocument doc(512);
  doc["id_obat"] = scheduleId;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("📤 GSM Stock Update JSON: " + jsonString);
  Serial.println("📍 Endpoint: /v1/api/jadwal/update-stock-obat-iot");
  
  // Create HTTP client
  HttpClient http(gsmClient, API_HOST, API_PORT);
  http.setTimeout(30000);
  
  // Start PUT request (to match WiFi version)
  http.beginRequest();
  http.put("/v1/api/jadwal/update-stock-obat-iot");
  http.sendHeader("Content-Type", "application/json");
  http.sendHeader("Authorization", "Bearer " + accessToken);
  http.sendHeader("Content-Length", jsonString.length());
  http.beginBody();
  http.print(jsonString);
  http.endRequest();
  
  // Get response
  int statusCode = http.responseStatusCode();
  String response = http.responseBody();
  
  Serial.println("📱 GSM Stock Update Status: " + String(statusCode));
  
  http.stop();
  
  if (statusCode == 200) {
    Serial.println("✅ Stock updated successfully via GSM");
  } else {
    Serial.println("❌ GSM stock update failed: " + String(statusCode));
    Serial.println("Response: " + response);
  }
}

// ================= NOTIFICATION HANDLING =================
void handleActiveNotifications(unsigned long currentTime) {
  if (activeCount == 0) {
    return;
  }
  
  // Check notifications every 5 minutes (300000ms)
  if (currentTime - lastNotificationCheck >= 300000) {
    startNotifications();
    lastNotificationCheck = currentTime;
  }
  
  // Handle buzzer
  handleBuzzer(currentTime);
  
  // Handle audio
  handleAudio(currentTime);
}

void startNotifications() {
  Serial.println("🔔 Starting notifications for active schedules");
  
  buzzerActive = true;
  buzzerStartTime = millis();
  lastAudioTime = 0; // Force immediate audio
  currentAudioSlot = 0;
}

void handleBuzzer(unsigned long currentTime) {
  // ✅ Skip jika sedang test mode
  if (buzzerTestMode) {
    return;
  }
  
  if (!buzzerActive) {
    return;
  }
  
  // Buzzer active for 30 seconds (LOUD & ANNOYING)
  if (currentTime - buzzerStartTime >= 30000) {
    buzzerActive = false;
    digitalWrite(BUZZER_PIN, LOW);
    return;
  }
  
  // Buzzer pattern: 150ms on, 350ms off (lebih cepat & berisik)
  unsigned long buzzerCycle = (currentTime - buzzerStartTime) % 500;
  if (buzzerCycle < 150) {
    digitalWrite(BUZZER_PIN, HIGH);
  } else {
    digitalWrite(BUZZER_PIN, LOW);
  }
}

void handleAudio(unsigned long currentTime) {
  if (!dfPlayerInitialized || activeCount == 0) {
    return;
  }
  
  // Play audio every 10 seconds
  if (currentTime - lastAudioTime >= 10000) {
    playCurrentSlotAudio();
    lastAudioTime = currentTime;
    
    // Move to next slot
    currentAudioSlot = (currentAudioSlot + 1) % activeCount;
  }
}

void playCurrentSlotAudio() {
  if (currentAudioSlot >= activeCount) {
    return;
  }
  
  ActiveSchedule& schedule = activeSchedules[currentAudioSlot];
  
  if (schedule.state == ALERTING) {
    Serial.println("🔊 Playing audio for slot " + String(schedule.slot) + " (file " + String(schedule.audioIndex) + ")");
    dfPlayer.play(schedule.audioIndex);
  }
}

// ================= BATTERY FUNCTIONS =================
void readBatteryVoltage() {
  // Rata-rata beberapa pembacaan untuk stabilitas
  int total = 0;
  const int samples = 10;
  
  for(int i = 0; i < samples; i++) {
    total += analogRead(BATTERY_PIN);
    delay(10);
  }
  
  int batteryRaw = total / samples;
  
  // Konversi ke tegangan sebenarnya
  batteryVoltage = batteryRaw * (ESP32_MAX_VOLTAGE / ADC_MAX) * VOLTAGE_RATIO;
  
  // Debug info
  Serial.print("🔋 Battery ADC: ");
  Serial.print(batteryRaw);
  Serial.print(" | Voltage: ");
  Serial.print(batteryVoltage, 2);
  Serial.print(" V | Percentage: ");
  Serial.print(calculateBatteryPercentage(batteryVoltage), 1);
  Serial.println("%");
}

float calculateBatteryPercentage(float voltage) {
  // Pastikan voltage dalam range yang valid
  if (voltage >= BATTERY_MAX) return 100.0;
  if (voltage <= BATTERY_MIN) return 0.0;
  
  // Hitung persentase berdasarkan range voltage
  float percentage = ((voltage - BATTERY_MIN) / (BATTERY_MAX - BATTERY_MIN)) * 100.0;
  return percentage;
}

void drawBatteryIndicator(int x, int y) {
  float percentage = calculateBatteryPercentage(batteryVoltage);
  
  // Draw outer frame of battery bar
  tft.drawRect(x, y, BAT_BAR_WIDTH, BAT_BAR_HEIGHT, TFT_BLACK);
  
  // Draw battery tip
  int tipWidth = 2;
  int tipHeight = BAT_BAR_HEIGHT / 2;
  int tipX = x + BAT_BAR_WIDTH;
  int tipY = y + (BAT_BAR_HEIGHT - tipHeight) / 2;
  tft.fillRect(tipX, tipY, tipWidth, tipHeight, TFT_WHITE);
  
  // Clear the inside of the bar
  tft.fillRect(x + 1, y + 1, BAT_BAR_WIDTH - 2, BAT_BAR_HEIGHT - 2, TFT_BGCOLOR);
  
  // Calculate fill width
  int fillWidth = (int)((percentage / 100.0) * (BAT_BAR_WIDTH - 2));
  
  // Choose color based on battery level
  uint16_t fillColor;
  if (percentage > 60) {
    fillColor = TFT_PURPLE;
  } else if (percentage > 30) {
    fillColor = TFT_RED;
  } else if (percentage > 15) {
    fillColor = TFT_ORANGE;
  } else {
    fillColor = TFT_YELLOW;
  }
  
  // Draw the fill
  if (fillWidth > 0) {
    tft.fillRect(x + 1, y + 1, fillWidth, BAT_BAR_HEIGHT - 2, fillColor);
  }
  
  // Show percentage text
  tft.setTextColor(TFT_BLACK, TFT_BGCOLOR);
  tft.setTextSize(1);
  tft.setCursor(x - 25, y + 2);
  tft.print(String(percentage, 0) + "%");
}

// ================= TFT HELPER FUNCTIONS =================
// Fungsi-fungsi ini membuat kode lebih adaptif terhadap berbagai ukuran layar TFT
int getScreenWidth() {
  return tft.width();  // Dinamis sesuai rotasi
}

int getScreenHeight() {
  return tft.height();  // Dinamis sesuai rotasi
}

int getScreenCenterX() {
  return tft.width() / 2;
}

int getScreenCenterY() {
  return tft.height() / 2;
}

// ================= END OF FIRMWARE =================