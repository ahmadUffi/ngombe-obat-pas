/**
 * k6 load test (fixed)
 * Fokus: uji beban endpoint utama
 */
import http from "k6/http";
import { check, sleep, group } from "k6";

// Allow overriding stages via env (e.g. STAGES="10s:20,30s:100,10s:0")
function parseStages(str) {
  if (!str) return null;
  try {
    return str.split(",").map((p) => {
      const [d, t] = p.split(":");
      return { duration: d.trim(), target: Number(t) };
    });
  } catch {
    return null;
  }
}

const envStages = parseStages(__ENV.STAGES);

// Retry helper settings (override via env: MAX_RETRIES, BACKOFF_MS)
const MAX_RETRIES = Number(__ENV.MAX_RETRIES || 2);
const BASE_BACKOFF_MS = Number(__ENV.BACKOFF_MS || 200);

function reqWithRetry(method, url, params = {}, body) {
  let res;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (method === "GET") res = http.get(url, params);
      else if (method === "POST") res = http.post(url, body, params);
      else if (method === "PUT") res = http.put(url, body, params);
      else if (method === "PATCH") res = http.patch(url, body, params);
      else if (method === "DELETE") res = http.del(url, body, params);
      else throw new Error("Unsupported method " + method);
      if (res && res.status !== 0) return res; // status 0 = network layer issue
    } catch (e) {
      // swallow and retry
    }
    if (attempt < MAX_RETRIES) {
      const backoff = BASE_BACKOFF_MS * Math.pow(2, attempt);
      sleep(backoff / 1000);
    }
  }
  return res;
}

export const options = {
  stages: envStages || [
    { duration: "20s", target: 30 },
    { duration: "40s", target: 100 },
    { duration: "40s", target: 150 },
    { duration: "20s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.15"],
    // Global latency; tune later. Lower this gradually after optimizations.
    http_req_duration: ["p(95)<1800"],
    // Example per-endpoint threshold filtering by tag
    "http_req_duration{endpoint:profile_me}": ["p(95)<800"],
    "http_req_duration{endpoint:jadwal_list}": ["p(95)<1200"],
  },
  userAgent: "ngompas-k6-loadtest/1.1",
};

// ✅ login sekali di awal, return token untuk semua VU
export function setup() {
  const base = __ENV.BASE_URL || "http://localhost:5000";
  const email = __ENV.LOGIN_EMAIL;
  const password = __ENV.LOGIN_PASSWORD;
  if (!email || !password) {
    throw new Error("LOGIN_EMAIL & LOGIN_PASSWORD env required");
  }
  const loginRes = reqWithRetry(
    "POST",
    `${base}/v1/api/login`,
    {
      headers: { "Content-Type": "application/json" },
      tags: { endpoint: "login" },
      timeout: "10s",
    },
    JSON.stringify({ email, password })
  );
  check(loginRes, { "login 200": (r) => r.status === 200 }) ||
    console.error("Login failed body=", loginRes.body);
  const accessToken = loginRes.json()?.access_token;
  if (!accessToken) {
    throw new Error("No access_token in login response");
  }
  return { token: accessToken, base };
}

export default function (data) {
  const { token, base } = data;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  group("profile", () => {
    const res = reqWithRetry("GET", `${base}/v1/api/profile/me`, {
      headers,
      tags: { endpoint: "profile_me" },
      timeout: "8s",
    });
    check(res, { "profile 200": (r) => r && r.status === 200 }) ||
      console.warn("profile request failed status=" + (res && res.status));
  });

  group("jadwal", () => {
    const res = reqWithRetry("GET", `${base}/v1/api/jadwal/get-for-web`, {
      headers,
      tags: { endpoint: "jadwal_list" },
      timeout: "8s",
    });
    check(res, { "jadwal 200": (r) => r && r.status === 200 }) ||
      console.warn("jadwal request failed status=" + (res && res.status));
  });

  group("notes", () => {
    const res = reqWithRetry("GET", `${base}/v1/api/notes/stats`, {
      headers,
      tags: { endpoint: "notes_stats" },
      timeout: "8s",
    });
    check(res, { "notes stats 200": (r) => r && r.status === 200 }) ||
      console.warn("notes stats request failed status=" + (res && res.status));
  });

  sleep(1);
}
