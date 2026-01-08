# Pengujian k6 (Ringkas)

Panduan singkat untuk menjalankan pengujian kinerja dan fungsional API dengan k6, fokus hanya pada skrip yang paling penting.

## Lokasi & Berkas Penting

Semua skrip berada di `backend/k6/`:

- `smoke.js` — Cek cepat layanan dan alur dasar (sanity check).
- `important-apis.js` — Uji endpoint kritikal (read/write) + export ringkasan JSON (p95 per endpoint).
- `loadtest.js` — Uji beban terukur endpoint utama dengan opsi retry/backoff.
- `utils.js` — Helper login/token, header auth, dan utilitas umum.

Opsional:

- `all-apis.js` — End‑to‑end banyak endpoint (untuk regression di staging).

## Prasyarat

- Backend berjalan (default: `http://localhost:5000`).
- Akun uji Supabase (email & password).
- k6 terpasang di sistem.
  - Windows (PowerShell): `choco install k6`

## Variabel Lingkungan (minimal)

Set di PowerShell sebelum menjalankan tes:

```powershell
$env:BASE_URL="http://localhost:5000"; $env:LOGIN_EMAIL="user@test.com"; $env:LOGIN_PASSWORD="secret"
```

Opsi (sesuai skrip):

- `STAGES` — Override pola beban, format `10s:10,30s:50,10s:0`
- `MAX_RETRIES` — Ulang permintaan saat gagal jaringan (default di skrip)
- `BACKOFF_MS` — Dasar backoff dalam milidetik (mis. 200)
- `SLEEP` — Jeda antar iterasi (detik) untuk beberapa skrip

## Cara Cepat Menjalankan

Dari folder `backend/`:

- Smoke test:

  ```powershell
  k6 run k6/smoke.js
  ```

- Endpoint kritikal + export ringkasan:

  ```powershell
  k6 run --summary-export=important-summary.json k6/important-apis.js
  ```

- Load test endpoint utama:
  ```powershell
  k6 run k6/loadtest.js
  ```

Atau via npm scripts:

```powershell
npm run k6:smoke
npm run k6:full
npm run k6:all
npm run k6:important
```

## Kustomisasi Beban & Retry

- Override stages (contoh ramp):
  ```powershell
  $env:STAGES="10s:20,30s:40,10s:0"; k6 run k6/loadtest.js
  ```
- Retry & backoff:
  ```powershell
  $env:MAX_RETRIES=3; $env:BACKOFF_MS=300; k6 run k6/loadtest.js
  ```

## Output Ringkasan (important-apis)

`important-apis.js` menghasilkan ringkasan metrik per endpoint (p95) jika dijalankan dengan `--summary-export`. File `important-summary.json` dapat dimuat ke Grafana/visualisasi lain.

```powershell
k6 run --summary-export=important-summary.json k6/important-apis.js
```

Cuplikan:

```json
{
  "time": "2025-10-29T08:00:00.000Z",
  "endpoints": {
    "profile_p95": 320.5,
    "notes_stats_p95": 410.2,
    "jadwal_p95": 730.8
  }
}
```

## Troubleshooting Singkat

- Status 0 (network/TLS): coba ulangi, cek firewall/proxy, gunakan retry/backoff.
- 401 saat login: pastikan `LOGIN_EMAIL` dan `LOGIN_PASSWORD` benar.
- P95 melompat tinggi: simpan baseline `important-summary.json` untuk perbandingan, cek query/indexing di backend.
- Dampak data: gunakan akun khusus/staging; beberapa skrip melakukan create+delete agar bersih.

---

Catatan: Threshold dasar sudah didefinisikan di skrip (per endpoint). Sesuaikan bertahap seiring optimasi.
