# k6 Performance & API Test Suite

Kumpulan skrip k6 untuk smoke test, load test, dan pengujian end‑to‑end API penting aplikasi Ngompas.

## 1. Struktur Skrip

| File                | Tujuan                                                 | Catatan                                                   |
| ------------------- | ------------------------------------------------------ | --------------------------------------------------------- |
| `smoke.js`          | Cek cepat server & basic flow                          | 1 VU / sangat singkat                                     |
| `full.js`           | Load ringan + scenario CRUD notes                      | Threshold dasar                                           |
| `all-apis.js`       | End-to-end hampir semua endpoint + cleanup             | Membuat & hapus data (jadwal, kontrol, peringatan, notes) |
| `important-apis.js` | Fokus endpoint kritikal + metrik custom + summary JSON | p95 per endpoint untuk grafik                             |
| `loadtest.js`       | Load ramp endpoint read (profile, jadwal, notes stats) | Retry + backoff                                           |
| `utils.js`          | Helper login/token, random string                      | Dipakai script lain                                       |
| `endpoints.md`      | Matriks cakupan endpoint                               | Update saat menambah cakupan                              |

## 2. Variabel Lingkungan

| Env              | Wajib    | Deskripsi                                          |
| ---------------- | -------- | -------------------------------------------------- |
| `BASE_URL`       | Ya       | URL backend (`http://localhost:5000` / prod URL)   |
| `LOGIN_EMAIL`    | Ya       | Email user Supabase                                |
| `LOGIN_PASSWORD` | Ya       | Password user                                      |
| `STAGES`         | Opsional | Override stages load (`10s:10,30s:50,10s:0`)       |
| `MAX_RETRIES`    | Opsional | Retry maksimum (default script)                    |
| `BACKOFF_MS`     | Opsional | Base backoff ms (misal 200)                        |
| `SLEEP`          | Opsional | Jeda antar iterasi (detik) di beberapa skrip       |
| `ADMIN_EMAIL`    | Opsional | Untuk endpoint admin                               |
| `DISABLE_WA`     | Opsional | (Jika ditambah di backend) nonaktifkan WA reminder |

Contoh PowerShell (.env.k6 tidak di-commit):

```
$env:BASE_URL="http://localhost:5000"; $env:LOGIN_EMAIL="user@test.com"; $env:LOGIN_PASSWORD="secret"
```

## 3. Menjalankan Skrip

Smoke:

```
k6 run k6/smoke.js
```

Full:

```
k6 run k6/full.js
```

All APIs:

```
k6 run k6/all-apis.js
```

Important APIs (export summary JSON):

```
k6 run --summary-export=important-summary.json k6/important-apis.js
```

Load test fokus:

```
k6 run k6/loadtest.js
```

Via npm:

```
npm run k6:smoke
npm run k6:full
npm run k6:all
npm run k6:important
```

## 4. Kustomisasi Load & Retry

Override stages:

```
$env:STAGES="10s:10,30s:40,10s:0"; k6 run k6/loadtest.js
```

Retry & backoff:

```
$env:MAX_RETRIES=3; $env:BACKOFF_MS=300; k6 run k6/loadtest.js
```

Jeda iterasi:

```
$env:SLEEP=0.5; k6 run k6/important-apis.js
```

## 5. Export & Visualisasi

`important-apis.js` punya `handleSummary` (p95 per endpoint) → file JSON bisa dimuat ke Grafana / chart lain.

```
k6 run --summary-export=important-summary.json k6/important-apis.js
```

Contoh potongan JSON:

```json
{
  "time": "2025-09-11T08:00:00.000Z",
  "endpoints": {
    "profile_p95": 320.5,
    "notes_stats_p95": 410.2,
    "jadwal_p95": 730.8
  }
}
```

## 6. Coverage

Lihat `k6/endpoints.md` untuk cakupan CRUD notes, jadwal, kontrol, peringatan, history, dose-log, forgot-password, admin cron, message test.

## 7. Keamanan & Produksi

| Risiko                     | Mitigasi                                   |
| -------------------------- | ------------------------------------------ |
| Data dummy tercipta        | Pakai user khusus / staging                |
| WA reminder tak diinginkan | Tambah guard env (`DISABLE_WA`) di backend |
| Beban DB tinggi            | Turunkan stages, ramp bertahap             |
| P95 tiba-tiba naik         | Simpan baseline JSON & bandingkan          |
| Error rate naik            | Lihat log / per endpoint tag               |

## 8. Workflow Rekomendasi

1. Commit/deploy → `smoke.js`.
2. Harian → `important-apis.js` (simpan summary).
3. Pra-scaling → `loadtest.js` dengan STAGES custom.
4. Regression penuh → `all-apis.js` (staging).
5. Iterasi threshold seiring optimasi query.

## 9. Contoh Lengkap PowerShell

```
$env:BASE_URL="https://api.ngompas.com"
$env:LOGIN_EMAIL="ahmaduffi45@gmail.com"
$env:LOGIN_PASSWORD="qwerty1Q"
$env:STAGES="15s:20,30s:50,20s:0"
$env:MAX_RETRIES=2
k6 run --summary-export=important-summary.json k6/important-apis.js
```

## 10. Troubleshooting

| Gejala               | Penyebab                                        | Solusi                                               |
| -------------------- | ----------------------------------------------- | ---------------------------------------------------- |
| status 0             | Network / TLS                                   | Retry, cek firewall/CDN                              |
| 401 login            | Email/password salah                            | Validasi env                                         |
| 500 jadwal create    | `dosis_obat` bukan integer / profile incomplete | Perbaiki payload/profil                              |
| Threshold gagal      | p95 tinggi / error rate                         | Optimasi DB / indexing / sementara naikkan threshold |
| Token expired (lama) | Cache token habis                               | Jalankan ulang tes / refresh                         |

---

Perbarui `endpoints.md` saat menambah cakupan. Tambah reporter HTML atau integrasi Grafana jika dibutuhkan.
