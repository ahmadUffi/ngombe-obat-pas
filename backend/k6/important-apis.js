/**
 * k6 important APIs performance test
 * Fokus: endpoint kritikal read/write dengan metrik terpisah dan summary JSON
 * Output grafik: gunakan --summary-export=important-summary.json lalu visualisasi (Grafana, k6 cloud, dsb)
 * Jalankan contoh:
 *  powershell:
 *   $env:BASE_URL="http://localhost:5000"; $env:LOGIN_EMAIL="..."; $env:LOGIN_PASSWORD="..."; k6 run --summary-export=important-summary.json k6/important-apis.js
 */
import http from "k6/http";
import { check, sleep, group, Trend, Rate, Counter } from "k6";

// Konfigurasi dapat di override via env
const STAGES_ENV = __ENV.STAGES; // format: 10s:20,30s:50,10s:0
function parseStages(str) {
  if (!str) return null;
  return str.split(",").map((s) => {
    const [d, t] = s.split(":");
    return { duration: d.trim(), target: Number(t) };
  });
}

export const options = {
  stages: parseStages(STAGES_ENV) || [
    { duration: "15s", target: 20 },
    { duration: "30s", target: 50 },
    { duration: "45s", target: 80 },
    { duration: "15s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<1500"],
    "http_req_duration{ep:profile_me}": ["p(95)<600"],
    "http_req_duration{ep:notes_stats}": ["p(95)<900"],
    "http_req_duration{ep:jadwal_list}": ["p(95)<1200"],
    "http_req_duration{ep:dose_today}": ["p(95)<900"],
    "http_req_duration{ep:kontrol_list}": ["p(95)<1200"],
  },
  userAgent: "ngompas-k6-important/1.0",
};

// Custom metrics
const createNoteTrend = new Trend("latency_note_create");
const createJadwalTrend = new Trend("latency_jadwal_create");
const createKontrolTrend = new Trend("latency_kontrol_create");
const errors = new Counter("flow_errors");
const apiFailRate = new Rate("api_fail_rate");

// Helper retry ringan
function req(method, url, body, params) {
  const max = Number(__ENV.MAX_RETRIES || 1); // lebih ringan di sini
  let res;
  for (let i = 0; i <= max; i++) {
    try {
      if (method === "GET") res = http.get(url, params);
      else if (method === "POST") res = http.post(url, body, params);
      else if (method === "PUT") res = http.put(url, body, params);
      else if (method === "PATCH") res = http.patch(url, body, params);
      else if (method === "DELETE") res = http.del(url, body, params);
      else throw new Error("Unsupported method");
    } catch (e) {}
    if (res && res.status !== 0) return res;
    if (i < max) sleep(0.2 * Math.pow(2, i));
  }
  return res;
}

function randomString(n = 6) {
  const c = "abcdefghijklmnopqrstuvwxyz0123456789";
  let o = "";
  for (let i = 0; i < n; i++) o += c[Math.floor(Math.random() * c.length)];
  return o;
}

export function setup() {
  const base = __ENV.BASE_URL || "http://localhost:5000";
  const email = __ENV.LOGIN_EMAIL;
  const password = __ENV.LOGIN_PASSWORD;
  if (!email || !password)
    throw new Error("LOGIN_EMAIL & LOGIN_PASSWORD required");
  const login = http.post(
    `${base}/v1/api/login`,
    JSON.stringify({ email, password }),
    { headers: { "Content-Type": "application/json" }, tags: { ep: "login" } }
  );
  check(login, { "login 200": (r) => r.status === 200 }) ||
    (errors.add(1), apiFailRate.add(1));
  const token = login.json()?.access_token;
  if (!token) throw new Error("No access_token");
  return { base, token };
}

export default function (data) {
  const { base, token } = data;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // READ heavy endpoints
  group("reads", () => {
    const profile = req("GET", `${base}/v1/api/profile/me`, null, {
      headers,
      tags: { ep: "profile_me" },
    });
    check(profile, { "profile 200": (r) => r && r.status === 200 }) ||
      (errors.add(1), apiFailRate.add(1));
    const notesStats = req("GET", `${base}/v1/api/notes/stats`, null, {
      headers,
      tags: { ep: "notes_stats" },
    });
    check(notesStats, { "notes stats 200": (r) => r && r.status === 200 }) ||
      (errors.add(1), apiFailRate.add(1));
    const jadwal = req("GET", `${base}/v1/api/jadwal/get-for-web`, null, {
      headers,
      tags: { ep: "jadwal_list" },
    });
    check(jadwal, { "jadwal list 200": (r) => r && r.status === 200 }) ||
      (errors.add(1), apiFailRate.add(1));
    const dose = req("GET", `${base}/v1/api/dose-log/status-today`, null, {
      headers,
      tags: { ep: "dose_today" },
    });
    check(dose, { "dose today 200": (r) => r && r.status === 200 }) ||
      (errors.add(1), apiFailRate.add(1));
    const kontrolList = req(
      "GET",
      `${base}/v1/api/kontrol/get-all-kontrol`,
      null,
      { headers, tags: { ep: "kontrol_list" } }
    );
    check(kontrolList, { "kontrol list 200": (r) => r && r.status === 200 }) ||
      (errors.add(1), apiFailRate.add(1));
  });

  // WRITE flows minimal (create + cleanup) — dijalankan subset VU (gunakan mod iteration)
  if (__ITER % 5 === 0) {
    // kurangi beban penulisan
    group("writes", () => {
      // Note create-delete
      const noteCreate = req(
        "POST",
        `${base}/v1/api/notes`,
        JSON.stringify({
          category: "lainnya",
          message: "imp-" + randomString(10),
        }),
        { headers, tags: { ep: "note_create" } }
      );
      if (noteCreate && noteCreate.status === 201) {
        createNoteTrend.add(noteCreate.timings.duration);
        const id = noteCreate.json()?.data?.id;
        if (id) {
          req("DELETE", `${base}/v1/api/notes/${id}`, null, {
            headers,
            tags: { ep: "note_delete" },
          });
        }
      } else {
        errors.add(1);
        apiFailRate.add(1);
      }

      // Jadwal create (hanya jika profil punya no_hp valid; kalau gagal abaikan agar tidak merusak hasil read)
      const jadwalBody = {
        nama_pasien: "P" + randomString(4),
        nama_obat: "O" + randomString(4),
        dosis_obat: 1,
        jumlah_obat: 5,
        jam_awal: ["08:00"],
        jam_berakhir: ["08:30"],
        slot_obat: "SL-" + randomString(3),
      };
      const jadwalCreate = req(
        "POST",
        `${base}/v1/api/jadwal/input`,
        JSON.stringify(jadwalBody),
        { headers, tags: { ep: "jadwal_create" } }
      );
      if (jadwalCreate && jadwalCreate.status === 201) {
        createJadwalTrend.add(jadwalCreate.timings.duration);
        // fetch list find id & delete
        const list = req("GET", `${base}/v1/api/jadwal/get-for-web`, null, {
          headers,
        });
        if (list && list.status === 200) {
          const arr = list.json();
          if (Array.isArray(arr)) {
            const found = arr.find(
              (j) =>
                j.nama_obat === jadwalBody.nama_obat &&
                j.slot_obat === jadwalBody.slot_obat
            );
            if (found) {
              req("DELETE", `${base}/v1/api/jadwal/delete/${found.id}`, null, {
                headers,
                tags: { ep: "jadwal_delete" },
              });
            }
          }
        }
      }

      // Kontrol create (disable reminder) + delete
      const kontrolBody = {
        tanggal: "2099-12-31",
        waktu: "09:00",
        dokter: "D" + randomString(3),
        nama_pasien: "P" + randomString(4),
        enableReminder: false,
      };
      const kontrolCreate = req(
        "POST",
        `${base}/v1/api/kontrol/create-kontrol`,
        JSON.stringify(kontrolBody),
        { headers, tags: { ep: "kontrol_create" } }
      );
      if (kontrolCreate && kontrolCreate.status === 201) {
        createKontrolTrend.add(kontrolCreate.timings.duration);
        const kontrolId = kontrolCreate.json()?.data?.id;
        if (kontrolId) {
          req("DELETE", `${base}/v1/api/kontrol/delete/${kontrolId}`, null, {
            headers,
            tags: { ep: "kontrol_delete" },
          });
        }
      }
    });
  }

  sleep(Number(__ENV.SLEEP || 0.8));
}

export function handleSummary(data) {
  const fs = JSON.stringify(
    {
      time: new Date().toISOString(),
      checks: data.metrics.checks,
      http_req_duration: data.metrics.http_req_duration,
      endpoints: (() => {
        function p95(metricKey) {
          const m = data.metrics[metricKey];
          if (!m || !m.percentiles) return null;
          // percentiles stored as object: e.g. { 'p(95)': value }
          return m.percentiles["p(95)"] ?? null;
        }
        return {
          profile_p95: p95("http_req_duration{ep:profile_me}"),
          notes_stats_p95: p95("http_req_duration{ep:notes_stats}"),
          jadwal_p95: p95("http_req_duration{ep:jadwal_list}"),
          dose_today_p95: p95("http_req_duration{ep:dose_today}"),
          kontrol_list_p95: p95("http_req_duration{ep:kontrol_list}"),
        };
      })(),
    },
    null,
    2
  );
  return {
    "important-summary.json": fs,
    stdout: `\nCustom summary saved (important-summary.json).`,
  };
}
