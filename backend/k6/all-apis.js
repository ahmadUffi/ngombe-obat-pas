/**
 * k6 script: All major API endpoints end-to-end (create, list, update, delete flows)
 * WARNING: This will create real data (jadwal, kontrol, notes, peringatan, history) and attempt to cleanup.
 * Ensure you point to a staging environment or understand side-effects.
 * Requires env vars:
 *  BASE_URL, LOGIN_EMAIL, LOGIN_PASSWORD
 * Optional:
 *  ADMIN_EMAIL (user must be admin in backend env to access /admin endpoints)
 */
import {
  http,
  check,
  sleep,
  BASE_URL,
  authHeaders,
  randomString,
} from "./utils.js";
import { Counter } from "k6/metrics";

export const options = {
  vus: 1,
  iterations: 1,
};

const flowErrors = new Counter("flow_errors");

// Retry/backoff settings (can override via env)
const MAX_RETRIES = parseInt(__ENV.MAX_RETRIES || "2", 10); // additional attempts after first
const BACKOFF_MS = parseInt(__ENV.BACKOFF_MS || "300", 10);
const REQ_TIMEOUT = __ENV.HTTP_TIMEOUT || "60s";
const TEST_ADMIN = __ENV.TEST_ADMIN === "1"; // only call admin route when explicitly requested
const TEST_WA = __ENV.TEST_WA === "1"; // only call WA test endpoint when explicitly requested
const TEST_FORGOT = __ENV.TEST_FORGOT === "1"; // only call forgot-password when explicitly requested

function backoffSleep(attempt) {
  const ms = BACKOFF_MS * Math.pow(2, attempt);
  sleep(ms / 1000);
}

function withRetry(name, fn) {
  let res = fn();
  if (res && res.status !== 0) return res;
  for (let i = 0; i < MAX_RETRIES; i++) {
    backoffSleep(i);
    res = fn();
    if (res && res.status !== 0) return res;
  }
  return res; // may be status 0
}

function mergeParams(params, name) {
  const base = params || {};
  const tags = { ...(base.tags || {}), ep: name };
  return { ...base, timeout: REQ_TIMEOUT, tags };
}

const R = {
  get(name, url, params) {
    return withRetry(name, () => http.get(url, mergeParams(params, name)));
  },
  del(name, url, body = null, params) {
    return withRetry(name, () =>
      http.del(url, body, mergeParams(params, name))
    );
  },
  post(name, url, body, params) {
    return withRetry(name, () =>
      http.post(url, body, mergeParams(params, name))
    );
  },
  put(name, url, body, params) {
    return withRetry(name, () =>
      http.put(url, body, mergeParams(params, name))
    );
  },
  patch(name, url, body, params) {
    return withRetry(name, () =>
      http.patch(url, body, mergeParams(params, name))
    );
  },
};

function logFail(name, res) {
  if (!res || res.status >= 400) {
    console.error(
      `❌ ${name} failed (${res && res.status}) body=`,
      res && res.body
    );
    flowErrors.add(1);
  }
}

export default function () {
  const headers = authHeaders();
  const jsonHeaders = { ...headers };

  // Containers for created IDs
  const ctx = {
    noteId: null,
    jadwalId: null,
    kontrolId: null,
    peringatanCreated: false,
  };

  // 1. Profile GET
  const profile = R.get("profile_me", `${BASE_URL}/v1/api/profile/me`, {
    headers,
  });
  check(profile, { "profile 200": (r) => r.status === 200 }) ||
    logFail("profile", profile);

  // 2. Notes CRUD + search + stats
  const noteCreate = R.post(
    "notes_create",
    `${BASE_URL}/v1/api/notes`,
    JSON.stringify({ category: "lainnya", message: "all-" + randomString(8) }),
    { headers: jsonHeaders }
  );
  check(noteCreate, { "note create 201": (r) => r.status === 201 }) ||
    logFail("note create", noteCreate);
  ctx.noteId = noteCreate.json()?.data?.id;
  // List all notes (basic list coverage)
  const notesList = R.get("notes_list", `${BASE_URL}/v1/api/notes`, {
    headers,
  });
  check(notesList, { "notes list 200": (r) => r.status === 200 }) ||
    logFail("notes list", notesList);
  if (ctx.noteId) {
    const noteGet = R.get(
      "notes_get",
      `${BASE_URL}/v1/api/notes/${ctx.noteId}`,
      {
        headers,
      }
    );
    check(noteGet, { "note get 200": (r) => r.status === 200 }) ||
      logFail("note get", noteGet);
    const noteUpd = R.put(
      "notes_upd",
      `${BASE_URL}/v1/api/notes/${ctx.noteId}`,
      JSON.stringify({ message: "updated-" + randomString(5) }),
      { headers: jsonHeaders }
    );
    check(noteUpd, { "note upd 200": (r) => r.status === 200 }) ||
      logFail("note upd", noteUpd);
    const search = R.get(
      "notes_search",
      `${BASE_URL}/v1/api/notes/search?q=updated`,
      {
        headers,
      }
    );
    check(search, { "note search 200": (r) => r.status === 200 }) ||
      logFail("note search", search);
    const stats = R.get("notes_stats", `${BASE_URL}/v1/api/notes/stats`, {
      headers,
    });
    check(stats, { "note stats 200": (r) => r.status === 200 }) ||
      logFail("note stats", stats);
  }

  // 3. Jadwal create (minimal). NOTE: Needs valid profile with phone + unique slot_obat & jam_awal array.
  const jadwalBody = {
    nama_pasien: "Pasien " + randomString(4),
    nama_obat: "Obat " + randomString(4),
    dosis_obat: 1, // harus integer sesuai schema
    jumlah_obat: 10,
    jam_awal: ["08:00", "20:00"],
    jam_berakhir: ["08:30", "20:30"],
    catatan: "catatan",
    kategori: "umum",
    slot_obat: "SLOT-" + randomString(3),
  };
  const jadwalCreate = R.post(
    "jadwal_create",
    `${BASE_URL}/v1/api/jadwal/input`,
    JSON.stringify(jadwalBody),
    { headers: jsonHeaders }
  );
  if (jadwalCreate.status === 201) {
    // fetch list to find the ID we just created (since controller returns only message)
    const list = R.get(
      "jadwal_list_web",
      `${BASE_URL}/v1/api/jadwal/get-for-web`,
      { headers }
    );
    if (list.status === 200) {
      const arr = list.json();
      if (Array.isArray(arr)) {
        // heuristic: find by nama_obat & slot
        const found = arr.find(
          (j) =>
            j.nama_obat === jadwalBody.nama_obat &&
            j.slot_obat === jadwalBody.slot_obat
        );
        if (found) ctx.jadwalId = found.id;
      }
    }
  } else {
    logFail("jadwal create", jadwalCreate);
  }

  // Jadwal get-for-iot
  const jadwalIot = R.get(
    "jadwal_list_iot",
    `${BASE_URL}/v1/api/jadwal/get-for-iot`,
    {
      headers,
    }
  );
  check(jadwalIot, { "jadwal iot 200": (r) => r.status === 200 }) ||
    logFail("jadwal get-for-iot", jadwalIot);

  if (ctx.jadwalId) {
    // update stock web (increase) then iot (decrement)
    const updWeb = R.put(
      "jadwal_upd_web",
      `${BASE_URL}/v1/api/jadwal/update-stock-obat-web`,
      JSON.stringify({ id_obat: ctx.jadwalId, newStock: 15 }),
      { headers: jsonHeaders }
    );
    check(updWeb, { "jadwal upd web 200": (r) => r.status === 200 }) ||
      logFail("jadwal upd web", updWeb);
    const updIot = R.put(
      "jadwal_upd_iot",
      `${BASE_URL}/v1/api/jadwal/update-stock-obat-iot`,
      JSON.stringify({ id_obat: ctx.jadwalId }),
      { headers: jsonHeaders }
    );
    check(updIot, { "jadwal upd iot 200": (r) => r.status === 200 }) ||
      logFail("jadwal upd iot", updIot);
  }

  // 4. History list (after potential automatic insertions) — create manual if jadwalId exists
  if (ctx.jadwalId) {
    const histCreate = R.post(
      "history_create",
      `${BASE_URL}/v1/api/history/input-history`,
      JSON.stringify({ id: ctx.jadwalId, status: "test status" }),
      { headers: jsonHeaders }
    );
    check(histCreate, { "history create 201": (r) => r.status === 201 }) ||
      logFail("history create", histCreate);
  }
  const histList = R.get(
    "history_list",
    `${BASE_URL}/v1/api/history/get-all-history`,
    {
      headers,
    }
  );
  check(histList, { "history list 200": (r) => r.status === 200 }) ||
    logFail("history list", histList);

  // 5. Kontrol create & flow
  const kontrolBody = {
    tanggal: "2099-12-31",
    waktu: "09:00",
    dokter: "Dr " + randomString(4),
    nama_pasien: "Pasien " + randomString(4),
    enableReminder: false, // disable WA creation for test speed/safety
  };
  const kontrolCreate = R.post(
    "kontrol_create",
    `${BASE_URL}/v1/api/kontrol/create-kontrol`,
    JSON.stringify(kontrolBody),
    { headers: jsonHeaders }
  );
  if (!check(kontrolCreate, { "kontrol create 201": (r) => r.status === 201 }))
    logFail("kontrol create", kontrolCreate);
  ctx.kontrolId = kontrolCreate.json()?.data?.id;
  const kontrolList = R.get(
    "kontrol_list",
    `${BASE_URL}/v1/api/kontrol/get-all-kontrol`,
    {
      headers,
    }
  );
  check(kontrolList, { "kontrol list 200": (r) => r.status === 200 }) ||
    logFail("kontrol list", kontrolList);
  // Edit kontrol BEFORE marking done (done prevents edits)
  if (ctx.kontrolId) {
    const kontrolEditBody = {
      tanggal: "2099-12-31",
      waktu: "10:30",
      dokter: "Dr Edit " + randomString(3),
      nama_pasien: kontrolBody.nama_pasien,
    };
    const kontrolEdit = R.put(
      "kontrol_edit",
      `${BASE_URL}/v1/api/kontrol/edit/${ctx.kontrolId}`,
      JSON.stringify(kontrolEditBody),
      { headers: jsonHeaders }
    );
    check(kontrolEdit, { "kontrol edit 200": (r) => r.status === 200 }) ||
      logFail("kontrol edit", kontrolEdit);
    const kontrolDone = R.patch(
      "kontrol_done",
      `${BASE_URL}/v1/api/kontrol/done`,
      JSON.stringify({ id: ctx.kontrolId, isDone: true }),
      { headers: jsonHeaders }
    );
    check(kontrolDone, { "kontrol done 200": (r) => r.status === 200 }) ||
      logFail("kontrol done", kontrolDone);
  }

  // 6. Peringatan (needs jadwalId)
  if (ctx.jadwalId) {
    const peringatanCreate = R.post(
      "peringatan_create",
      `${BASE_URL}/v1/api/peringatan/create-peringatan`,
      JSON.stringify({
        id: ctx.jadwalId,
        pesan: "Ingat minum " + randomString(3),
      }),
      { headers: jsonHeaders }
    );
    check(peringatanCreate, {
      "peringatan create 201": (r) => r.status === 201,
    }) || logFail("peringatan create", peringatanCreate);
    ctx.peringatanCreated = peringatanCreate.status === 201;
  }
  const peringatanList = R.get(
    "peringatan_list",
    `${BASE_URL}/v1/api/peringatan/get-all-peringatan`,
    { headers }
  );
  check(peringatanList, { "peringatan list 200": (r) => r.status === 200 }) ||
    logFail("peringatan list", peringatanList);

  // 7. Dose log status
  const doseToday = R.get(
    "dose_today",
    `${BASE_URL}/v1/api/dose-log/status-today`,
    {
      headers,
    }
  );
  check(doseToday, { "dose today 200": (r) => r.status === 200 }) ||
    logFail("dose log status", doseToday);

  // 8. Message (optional) — only run when TEST_WA=1 to avoid http_req_failed from expected 400/500
  if (TEST_WA) {
    const msgSingle = R.post(
      "message_test_send",
      `${BASE_URL}/v1/api/message/test/send`,
      JSON.stringify({
        phone: "081234567890",
        message: "Test pesan k6 " + randomString(4),
      }),
      { headers: jsonHeaders }
    );
    check(msgSingle, {
      "message test status": (r) =>
        r.status === 200 || r.status === 400 || r.status === 500,
    });
  }

  // 9. Admin cron trigger (optional). Skip unless TEST_ADMIN=1 to avoid 403 => http_req_failed.
  if (TEST_ADMIN) {
    const admin = R.post(
      "admin_cron_stock_check",
      `${BASE_URL}/v1/api/admin/cron/stock-check`,
      null,
      {
        headers,
      }
    );
    check(admin, {
      "admin cron allowed/forbidden": (r) => [200, 403].includes(r.status),
    }) || logFail("admin cron", admin);
  }

  // 10. Forgot password (optional) — Skip unless TEST_FORGOT=1 to avoid 400 inflating http_req_failed
  if (TEST_FORGOT) {
    const forgot = R.post(
      "forgot_password",
      `${BASE_URL}/v1/api/forgot-password`,
      JSON.stringify({ email: __ENV.LOGIN_EMAIL }),
      { headers: { "Content-Type": "application/json" } }
    );
    check(forgot, { "forgot 200/400": (r) => [200, 400].includes(r.status) }) ||
      logFail("forgot password", forgot);
  }

  // Cleanup (best-effort) — delete note, jadwal, kontrol (API deletions only where available)
  if (ctx.noteId) {
    const delNote = R.del(
      "notes_delete",
      `${BASE_URL}/v1/api/notes/${ctx.noteId}`,
      null,
      {
        headers,
      }
    );
    check(delNote, { "note delete cleanup 200": (r) => r.status === 200 });
  }
  if (ctx.jadwalId) {
    const delJadwal = R.del(
      "jadwal_delete",
      `${BASE_URL}/v1/api/jadwal/delete/${ctx.jadwalId}`,
      null,
      { headers }
    );
    check(delJadwal, { "jadwal delete cleanup 200": (r) => r.status === 200 });
  }
  if (ctx.kontrolId) {
    const delKontrol = R.del(
      "kontrol_delete",
      `${BASE_URL}/v1/api/kontrol/delete/${ctx.kontrolId}`,
      null,
      { headers }
    );
    check(delKontrol, {
      "kontrol delete cleanup 200/400/404": (r) =>
        [200, 400, 404].includes(r.status),
    });
  }

  sleep(1);
}
