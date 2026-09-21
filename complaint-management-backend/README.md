# Campus Complaint Management System — Backend

This is a runnable REST API for the backend scope in the proposal. It supports student/admin authentication, complaint submission, category-based routing, transparent priority scoring, status history, notifications, admin summaries, and optional MongoDB persistence. The code is organized using routes, controllers, services, repositories, middleware, validators, and database modules.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the complete folder guide and request flow.

## Quick start today

```bash
cd /home/ubuntu/complaint-management-backend
npm install
cp .env.example .env
npm test
npm start
```

The default mode is an in-memory repository, so the API can be demonstrated without installing MongoDB. Set `USE_MONGODB=true` and `MONGODB_URI` in `.env` for persistent storage.

## Main endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/health` | Public | Health check |
| GET | `/api/categories` | Public | Categories and automatically assigned departments |
| POST | `/api/auth/register` | Public | Register student or admin |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| GET | `/api/auth/me` | Authenticated | Current user |
| POST | `/api/complaints` | Student/admin | Submit a complaint |
| GET | `/api/complaints` | Authenticated | Student's complaints; admin sees all |
| GET | `/api/complaints/:id` | Authenticated | View one complaint |
| PATCH | `/api/complaints/:id/status` | Admin | Change status and add history/notification |
| GET | `/api/notifications` | Authenticated | Read status-change notifications |
| PATCH | `/api/notifications/:id/read` | Authenticated | Mark notification read |
| GET | `/api/admin/summary` | Admin | Counts by status and category |

Send `Authorization: Bearer <token>` on protected requests. Complaint submission JSON:

```json
{
  "category": "electricity",
  "description": "No power and exposed wire in classroom",
  "location": "Block A, Room 3",
  "attachmentUrl": "https://example.com/photo.jpg"
}
```

The API maps categories to departments and calculates a priority level (`low`, `medium`, `high`, `critical`) using transparent keyword rules plus the number of similar unresolved complaints. This directly implements the proposal's rule-based algorithm.

## Important design decisions

The proposal mentions both Firebase and MongoDB. This backend owns the application API, authorization, workflow, and MongoDB persistence. For the mobile client, use Firebase Cloud Messaging later by storing a device token on the user and calling FCM from the status-update handler. For today’s demo, notifications are persisted in the notification collection/in-memory store and are available through `/api/notifications`.

For production, change the default JWT secret, restrict CORS to the mobile/web client origins, add rate limiting, use Firebase Admin token verification if Firebase Authentication is selected, and store uploaded images in object storage rather than accepting arbitrary public URLs.

## Suggested frontend handoff

1. Register/login and retain the returned JWT securely in the mobile client.
2. Call `GET /api/categories` to populate the complaint form.
3. Submit `POST /api/complaints` and show `complaintNumber`, `status`, `department`, and `priority`.
4. Poll or refresh `GET /api/complaints` for the student tracking screen.
5. For the admin dashboard, use `GET /api/complaints` and `GET /api/admin/summary`.
6. After an admin status update, refresh the student's complaints and notifications.

## Directory structure

```text
src/config/      Environment configuration
src/db/          Database connection and in-memory demo store
src/routes/      URL definitions
src/controllers/HTTP request/response handlers
src/services/    Business logic and use cases
src/repositories/Database access functions
src/middleware/  Authentication, validation, and errors
src/validators/  Zod request schemas
src/models.js    Mongoose schemas
src/rules.js     Routing and priority algorithm
src/app.js       Express app composition
src/server.js    Server startup
test/api.test.js End-to-end API tests
```
