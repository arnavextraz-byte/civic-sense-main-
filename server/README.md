# Civic Backend (Demo)

Quick demo API for reports, uploads, routing, and analytics. In-memory store; replace with a database for production.

## Run

```bash
cd server
npm install
npm run start
```

## Endpoints
- POST /reports (multipart: media, fields: type, description, latitude, longitude, address, priority)
- GET /reports?status=&type=&search=
- PATCH /reports/:id (status, department, assignee, priority)
- POST /route/:id
- GET /analytics/summary
- GET /events (SSE live stream)

