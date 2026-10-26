# MediVault — Care Management

A responsive healthcare record-management starter with a professional SaaS interface and a small Node.js API.

## Project structure
- `frontend/` — dependency-free responsive web interface.
- `backend/server.js` — built-in Node.js HTTP API for patients, medical records, appointments and prescriptions.
- `dsa/` — reserved for existing course/project algorithm work.

## Run
Open `frontend/index.html` in a browser to use the frontend. For the API, use Node.js 18+:

```bash
node backend/server.js
```

Health check: `GET http://localhost:4000/api/health`
Collections: `GET /api/patients`, `/api/records`, `/api/appointments`, `/api/prescriptions`. `POST` creates a record; `DELETE /api/{collection}/{id}` removes one.

## Important limitations
This package is a starter implementation, not a production-ready medical-record system. The frontend stores records in page memory only and is not yet connected to the API. The API stores data in memory and resets on restart; it has no authentication, authorization, durable database, audit trail, or encryption at rest. Do not use real patient information until these controls are implemented and independently reviewed. Configure `CORS_ORIGIN` for the intended frontend origin before deployment.
