import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Counter } from "k6/metrics";

// ENV required: BASE_URL, PHONE
// Optional: MESSAGE (defaults), MAX_WAIT_SEC (default 120), POLL_INTERVAL_MS (default 2000)

const BASE_URL = __ENV.BASE_URL || "http://localhost:5000";
const PHONE = __ENV.PHONE; // target phone to receive WA test
const MESSAGE = __ENV.MESSAGE || "K6 WA latency test";
const MAX_WAIT_SEC = parseInt(__ENV.MAX_WAIT_SEC || "120", 10);
const POLL_INTERVAL_MS = parseInt(__ENV.POLL_INTERVAL_MS || "2000", 10);

if (!PHONE) throw new Error("PHONE env required");

export const options = {
  vus: 1,
  iterations: 10,
};

const sendLatency = new Trend("wa_send_latency_ms");
const deliveryLatency = new Trend("wa_delivery_latency_ms");
const successCount = new Counter("wa_success");
const failCount = new Counter("wa_fail");

export function setup() {}

function pollStatus(messageId) {
  const start = Date.now();
  while ((Date.now() - start) / 1000 < MAX_WAIT_SEC) {
    const res = http.get(
      `${BASE_URL}/v1/api/message/test/status/${messageId}?dryRun=1`,
      { timeout: "60s" }
    );
    if (res.status === 200) {
      const data = res.json()?.data;
      const status = data?.status || data?.response?.data?.status;
      if (status && ["delivered", "read", "sent"].includes(status)) {
        return { ok: true, status };
      }
    }
    sleep(POLL_INTERVAL_MS / 1000);
  }
  return { ok: false };
}

export default function () {
  const sendStart = Date.now();
  const res = http.post(
    `${BASE_URL}/v1/api/message/test/send`,
    JSON.stringify({ phone: PHONE, message: MESSAGE, dryRun: true }),
    {
      headers: { "Content-Type": "application/json" },
      timeout: "60s",
    }
  );
  check(res, { "send 200": (r) => r.status === 200 });
  sendLatency.add(Date.now() - sendStart);

  const msgId = res.json()?.data?.messageId || res.json()?.messageId;
  if (!msgId) {
    failCount.add(1);
    return;
  }

  const pollStart = Date.now();
  const status = pollStatus(msgId);
  if (status.ok) {
    deliveryLatency.add(Date.now() - pollStart);
    successCount.add(1);
  } else {
    failCount.add(1);
  }
}
