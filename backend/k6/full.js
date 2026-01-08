import {
  http,
  check,
  sleep,
  BASE_URL,
  authHeaders,
  randomString,
} from "./utils.js";
import { Trend, Rate, Counter } from "k6/metrics";

export const options = {
  scenarios: {
    ramp_notes: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 5 },
        { duration: "30s", target: 10 },
        { duration: "30s", target: 0 },
      ],
      exec: "notesScenario",
    },
    constant_profile: {
      executor: "constant-vus",
      vus: 3,
      duration: "1m",
      exec: "profileScenario",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<800"],
  },
};

const noteLatency = new Trend("note_latency");
const noteErrors = new Counter("note_errors");
const profileErrors = new Counter("profile_errors");

export function setup() {
  // Ensure token once
  authHeaders();
}

export function notesScenario() {
  const headers = authHeaders();
  // Create
  const createRes = http.post(
    `${BASE_URL}/v1/api/notes`,
    JSON.stringify({
      category: "lainnya",
      message: "load-" + randomString(10),
    }),
    { headers }
  );
  const ok = check(createRes, { "note create 201": (r) => r.status === 201 });
  if (!ok) noteErrors.add(1);
  const id = createRes.json()?.data?.id;
  sleep(0.5);
  if (id) {
    const get = http.get(`${BASE_URL}/v1/api/notes/${id}`, { headers });
    check(get, { "note get 200": (r) => r.status === 200 });
    const upd = http.put(
      `${BASE_URL}/v1/api/notes/${id}`,
      JSON.stringify({ message: "updated-" + randomString(5) }),
      { headers }
    );
    check(upd, { "note update 200": (r) => r.status === 200 });
    const del = http.del(`${BASE_URL}/v1/api/notes/${id}`, null, { headers });
    check(del, { "note delete 200": (r) => r.status === 200 });
    noteLatency.add(
      createRes.timings.duration +
        get.timings.duration +
        upd.timings.duration +
        del.timings.duration
    );
  }
  sleep(0.5);
}

export function profileScenario() {
  const headers = authHeaders();
  const me = http.get(`${BASE_URL}/v1/api/profile/me`, { headers });
  if (!check(me, { "profile 200": (r) => r.status === 200 }))
    profileErrors.add(1);
  sleep(1);
}

// Additional one-off flow executed by default if script run without --execution-segment picking scenarios
export default function () {
  notesScenario();
  profileScenario();
  // Jadwal list
  const headers = authHeaders();
  const jadwalWeb = http.get(`${BASE_URL}/v1/api/jadwal/get-for-web`, {
    headers,
  });
  check(jadwalWeb, { "jadwal web 200": (r) => r.status === 200 });
  // Dose log status
  const dose = http.get(`${BASE_URL}/v1/api/dose-log/status-today`, {
    headers,
  });
  check(dose, { "dose status 200": (r) => r.status === 200 });
  sleep(1);
}
