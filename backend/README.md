# Stock & Reminder Automation (Cron + Refill)

This backend includes automated behaviors for medication stock and WhatsApp reminders. It works with your existing routes and Wablas integration, and can be driven by IoT or web stock updates.

## What it does

- Low stock (cron, always-notify)
  - Detects when a medication has ≤ ~3 days of doses left.
  - Sends a WhatsApp notice “stok menipis” on every cron run while the condition holds.
- Out of stock (cron, always-notify) and immediate on update
  - Detects when stock hits 0 (≤ 0).
  - Pauses all Wablas reminders for that medication (deletes reminders and DB records) and sends a WhatsApp notice “stok habis” on every cron run while the condition holds.
- Refill (immediate on stock update)
  - When a stock update changes from ≤ 0 to > 0, it recreates all Wablas reminders for that medication and sends a WhatsApp notice “stok terisi ulang”. Also writes a history entry.

### Phone number change effects

- When a user’s profile phone number changes, the system:
  - Recreates all WA reminders for that user’s medication schedules (jadwal) so they point to the new number.
  - Recreates control schedules only for active controls.

## Files and components

- src/services/stockCronService.js
  - checkAllJadwalStockAndNotify(): scans all `jadwal` and triggers low/out-of-stock actions.
  - No daily dedup: messages are sent on every cron run while conditions hold. A history row is written each run for observability.
- src/services/jadwalService.js
  - updateObatByID(): extends stock update logic:
    - If new stock ≤ 0: pause reminders + WA notify + history.
    - If previous stock ≤ 0 and new stock > 0: recreate reminders + WA notify + history “stock diisi ulang”.
  - Also contains helpers used by profile phone change to rebuild jadwal reminders.
- src/services/controlService.js
  - Recreates control schedules for active controls when phone number changes.
- src/index.js
  - Wires a cron job using node-cron, controlled by env vars.
- package.json
  - Adds dependency: node-cron

## Environment variables

- CRON_ENABLED=true|false
  - Enables the stock-check cron loop. Default: false
- CRON_SCHEDULE
  - Cron expression. Default: `0 7,19 * * *` (07:00 and 19:00 Asia/Jakarta)
- WABLAS_TOKEN, WABLAS_SECRET_KEY
  - Required for Wablas API calls to send/pause reminders and WhatsApp messages.

Notes:

- Cron runs in timezone `Asia/Jakarta` (set in code). Message frequency aligns with your CRON_SCHEDULE.

## Routing (no changes required)

Existing routes continue to drive stock changes:

- PUT /v1/api/jadwal/update-stock-obat-web
  - Body: { id_obat: string, newStock: number }
- PUT /v1/api/jadwal/update-stock-obat-iot
  - Body: { id_obat: string } (decrements by 1 per call)

## Behavior details

- Low stock threshold
  - Computed as `jam_awal.length * 3` (≈ 3 days left). If `jam_awal` empty, uses 1 dose/day.
- Pause reminders (out-of-stock)
  - Deletes reminders on Wablas via reminder IDs in `jadwal_wa_reminders` and removes DB records.
- Recreate reminders (refill)
  - Rebuilds reminders for each `jam_awal`, stores new IDs in `jadwal_wa_reminders`.
- History entries
  - Writes entries for “stock habis”, “stock menipis”, and “stock diisi ulang”. For cron, a new row is written on every run while conditions hold (no daily dedup).

## How to run

1. Set environment variables (example)
   - CRON_ENABLED=true
   - CRON_SCHEDULE=0 7,19 \* \* \*
   - WABLAS_TOKEN=... WABLAS_SECRET_KEY=...
2. Start backend
   - npm run dev
3. Verify in logs

- You should see: "StockCron enabled with schedule:" and periodic results like `StockCron result: { total, lowCount, emptyCount }`.
- If CRON_SCHEDULE is frequent (e.g., every 5 minutes), WhatsApp notifications will also be frequent while low/out-of-stock conditions hold.

## Quick test scenarios

- Low stock notice
  - Set a medication’s `jumlah_obat` to a value ≤ (jam_awal.length \* 3) but > 0.
  - When cron runs, it sends a "stok menipis" WA on every run while condition holds and logs a history entry each time.
- Out of stock pause
  - Set `jumlah_obat` to 0.
  - Cron (or immediate update flow) pauses reminders and sends a "stok habis" notice on every run while condition holds.
- Refill
  - Change stock from 0 → > 0 via web/IoT endpoint.
  - The service recreates reminders and sends "stok terisi ulang" notice immediately.

## Troubleshooting

- No WA sent
  - Check `profile.no_hp` exists for the user and is valid.
  - Ensure WABLAS_TOKEN and WABLAS_SECRET_KEY are set.
- Cron not running
  - Ensure CRON_ENABLED=true and the process has that env var.
  - Verify CRON_SCHEDULE is a valid cron expression; default is used if not set.
- Reminders not recreated on refill
  - Refill only triggers when previous stock ≤ 0 and new stock > 0. If stock was already > 0, reminders remain as-is.
- Messages too frequent
  - Increase the interval in CRON_SCHEDULE or add quiet-hour windows by adjusting the cron expression. If you prefer daily-only notifications, reintroduce a dedup check (e.g., based on `history`).

## Notes & future improvements

- Quiet hours: you can adjust CRON_SCHEDULE to avoid late-night messages.
- Always-notify is the current design. If you want daily-only notices, add a dedup step (e.g., check `history` for a recent entry) or persist last-notified timestamps.
- IoT ingestion: for reliable offline behavior, consider adding a simple event queue endpoint (device_id + event_id) and idempotent processing.
