# Endpoint Coverage Matrix

| Area            | Method | Path (prefix /v1/api)          | Covered In Script               | Notes                          |
| --------------- | ------ | ------------------------------ | ------------------------------- | ------------------------------ |
| Auth            | POST   | /login                         | utils.js (token)                | login token fetch              |
| Forgot Password | POST   | /forgot-password               | all-apis.js                     | Public                         |
| Profile         | GET    | /profile/me                    | smoke, full                     |                                |
| Profile         | PUT    | /profile/update                | (TODO)                          | Need sample form-data; complex |
| Notes           | POST   | /notes                         | smoke, full                     | CRUD cycle                     |
| Notes           | GET    | /notes/:id                     | smoke, full                     |                                |
| Notes           | PUT    | /notes/:id                     | full                            |                                |
| Notes           | DELETE | /notes/:id                     | smoke, full                     |                                |
| Notes           | GET    | /notes                         | full (list)                     |                                |
| Notes           | GET    | /notes/search?q=               | all-apis.js                     |                                |
| Notes           | GET    | /notes/stats                   | all-apis.js                     |                                |
| Jadwal          | GET    | /jadwal/get-for-web            | full                            | list only                      |
| Jadwal          | GET    | /jadwal/get-for-iot            | all-apis.js                     |                                |
| Jadwal          | POST   | /jadwal/input                  | all-apis.js                     | create + find id               |
| Jadwal          | PUT    | /jadwal/update-stock-obat-iot  | all-apis.js                     |                                |
| Jadwal          | PUT    | /jadwal/update-stock-obat-web  | all-apis.js                     |                                |
| Jadwal          | DELETE | /jadwal/delete/:id             | all-apis.js                     | cleanup                        |
| Dose Log        | GET    | /dose-log/status-today         | smoke, full                     |                                |
| History         | POST   | /history/input-history         | all-apis.js                     |                                |
| History         | GET    | /history/get-all-history       | all-apis.js                     |                                |
| Kontrol         | POST   | /kontrol/create-kontrol        | all-apis.js                     |                                |
| Kontrol         | GET    | /kontrol/get-all-kontrol       | all-apis.js                     |                                |
| Kontrol         | PATCH  | /kontrol/done                  | all-apis.js                     |                                |
| Kontrol         | PUT    | /kontrol/edit/:id              | all-apis.js                     | edit before done               |
| Kontrol         | DELETE | /kontrol/delete/:id            | all-apis.js                     | cleanup                        |
| Peringatan      | POST   | /peringatan/create-peringatan  | all-apis.js                     |                                |
| Peringatan      | GET    | /peringatan/get-all-peringatan | all-apis.js                     |                                |
| Message         | POST   | /message/send                  | all-apis.js (test/send variant) | uses test route                |
| Message         | POST   | /message/send-bulk             | (TODO)                          | not added yet                  |
| Admin           | POST   | /admin/cron/stock-check        | all-apis.js                     | 200 or 403 accepted            |
| Schedule        | POST   | /schedule/control-reminder     | (inactive)                      | route disabled in index.js     |

Add remaining items as needed.
