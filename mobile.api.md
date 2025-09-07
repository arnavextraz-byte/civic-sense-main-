# Mobile API integration (plan)

This file documents how the existing React Native app can send reports to the new backend without modifying existing screens yet.

- POST http://localhost:4000/reports (multipart/form-data)
  - fields: type, description, latitude, longitude, address, priority
  - file: media (image/video)
- GET http://localhost:4000/reports
- PATCH http://localhost:4000/reports/:id
- GET http://localhost:4000/events (live updates)

Future steps:
- Add `services/api.ts` with upload function using fetch + FormData
- On submit in `ReportScreen`, call the upload and show server confirmation

