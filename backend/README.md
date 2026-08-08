# Campus Complaint Management System — Backend

Node.js/Express API backing the React Native app. Uses **Firebase** for authentication (ID token verification) + push notifications, and **MongoDB** for all complaint/user/department data — matching the architecture in section 4.3.1 of the proposal.

## 1. Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:
- `MONGO_URI` — your MongoDB Atlas connection string.
- Firebase credentials — either:
  - Download a service account key (Firebase Console → Project Settings → Service Accounts → Generate new private key), save it as `config/serviceAccountKey.json`, **or**
  - Paste the JSON as one line into `FIREBASE_SERVICE_ACCOUNT` in `.env`.

## 2. Seed initial departments (category → department lookup table)

```bash
node seed.js
```

This creates the departments referenced in the proposal's routing algorithm (Maintenance Section, Hostel Administration, IT Department, General Administration), each with a list of complaint categories they handle. Edit `seed.js` to match your real categories.

## 3. Run

```bash
npm run dev   # nodemon, for local development
npm start     # production
```

Server starts on `http://localhost:5000` by default.

## 4. Authentication

The React Native app authenticates with **Firebase Auth** directly (email/password, phone, etc). On every API request, it sends the Firebase ID token:

```
Authorization: Bearer <firebase-id-token>
```

`middleware/auth.js` verifies this token against Firebase, then looks up (or auto-creates) the matching user in MongoDB and attaches it to `req.user`.

To make someone an admin or department_staff, update their `role` field directly in MongoDB (or build a small admin-only endpoint for it later).

## 5. API Endpoints

### Auth/User
- `GET  /api/users/me` — current user's profile
- `PATCH /api/users/me` — update name, rollNumber, or register fcmToken for push notifications

### Complaints (student)
- `POST /api/complaints` — submit a complaint (multipart/form-data, field `photo` optional). Body: `category`, `description`, `facility`, `location`
- `GET  /api/complaints/mine` — list my complaints with status
- `GET  /api/complaints/:id` — view one complaint
- `POST /api/complaints/:id/feedback` — rate a resolved complaint

### Admin / Department Staff
- `GET   /api/admin/queue?status=Pending,In%20Progress` — department queue, ordered by priority score then submission time
- `GET   /api/admin/stats` — counts by category/status (for identifying recurring issues)
- `PATCH /api/admin/complaints/:id/assign` — assign staff, sets status to "In Progress"
- `PATCH /api/admin/complaints/:id/resolve` — mark "Resolved", notifies student
- `PATCH /api/admin/complaints/:id/reject` — reject with reason, notifies student

### Departments
- `GET  /api/departments` — list departments (for the complaint form's category dropdown)
- `POST /api/departments` — (admin only) create a department + its category list

## 6. Routing & Priority Algorithm

Implemented in `utils/priorityEngine.js`, following section 4.3.3 of the proposal:

1. Complaint category is matched against each Department's `categories` array.
2. A priority score starts at 1 and increases based on keyword matches in the description (`safety`, `fire`, `no power`, `leak`, etc.) and the number of similar unresolved complaints already logged for the same facility.
3. `getDepartmentQueue()` returns each department's complaints sorted by `priorityScore` (desc) then `createdAt` (asc) — higher priority and older complaints surface first, matching Figure 4.1's flowchart.

Tune the keyword weights in `PRIORITY_KEYWORDS` as needed.

## 7. Folder Structure

```
backend/
├── config/         # DB + Firebase Admin init
├── controllers/     # route handler logic
├── middleware/       # auth verification, file upload
├── models/          # Mongoose schemas
├── routes/           # Express routers
├── utils/            # priority engine, notifications
├── uploads/           # complaint photos (gitignored)
├── seed.js
└── server.js
```
