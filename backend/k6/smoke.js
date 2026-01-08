import {
  http,
  check,
  sleep,
  BASE_URL,
  authHeaders,
  randomString,
} from "./utils.js";

export const options = {
  vus: 1,
  iterations: 1,
};

// Minimal happy-path calls to verify API is alive.
export default function () {
  // Login (implicit via token fetch)
  const headers = authHeaders();

  // Profile
  const me = http.get(`${BASE_URL}/v1/api/profile/me`, { headers });
  check(me, { "profile ok": (r) => r.status === 200 });

  // Create note
  const noteCreate = http.post(
    `${BASE_URL}/v1/api/notes`,
    JSON.stringify({ category: "lainnya", message: "smoke-" + randomString() }),
    { headers }
  );
  check(noteCreate, { "note create 201": (r) => r.status === 201 });
  const noteId = noteCreate.json()?.data?.id;

  if (noteId) {
    const getNote = http.get(`${BASE_URL}/v1/api/notes/${noteId}`, { headers });
    check(getNote, { "get note 200": (r) => r.status === 200 });
    const del = http.del(`${BASE_URL}/v1/api/notes/${noteId}`, null, {
      headers,
    });
    check(del, { "delete note 200": (r) => r.status === 200 });
  }

  // Dose log status (depends on seed job having run earlier)
  const dose = http.get(`${BASE_URL}/v1/api/dose-log/status-today`, {
    headers,
  });
  check(dose, { "dose status 200": (r) => r.status === 200 });

  sleep(1);
}
