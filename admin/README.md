# Campus Complaint Management System — Admin Panel

Structured React + Vite + Tailwind CSS admin panel for the Campus Complaint Management System backend.

## Project structure

```text
src/
├── api/
│   ├── auth.api.js
│   ├── client.js
│   ├── complaints.api.js
│   ├── dashboard.api.js
│   └── index.js
│
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.jsx
│   ├── common/
│   │   ├── Badge.jsx
│   │   ├── EmptyState.jsx
│   │   ├── ErrorState.jsx
│   │   ├── Loading.jsx
│   │   └── StatCard.jsx
│   └── layout/
│       ├── AdminLayout.jsx
│       ├── Sidebar.jsx
│       └── Topbar.jsx
│
├── context/
│   └── AuthContext.jsx
│
├── pages/
│   ├── auth/
│   │   └── LoginPage.jsx
│   ├── dashboard/
│   │   └── DashboardPage.jsx
│   └── complaints/
│       ├── ComplaintsPage.jsx
│       └── ComplaintDetailsPage.jsx
│
├── styles/
│   └── index.css
│
├── utils/
│   └── formatters.js
│
├── App.jsx
└── main.jsx
```

## Backend routes connected

- POST `/api/auth/login`
- GET `/api/auth/me`
- GET `/api/admin/dashboard`
- GET `/api/admin/complaints`
- GET `/api/complaints/:id`
- GET `/api/categories`
- PATCH `/api/admin/complaints/:id/assign`
- PATCH `/api/admin/complaints/:id/status`

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Set the backend URL:

```env
VITE_API_BASE_URL=http://localhost:5000
```

The API client automatically sends:

```text
Authorization: Bearer <JWT_TOKEN>
```

## Important

The supplied backend report documents the endpoints and database fields but does not include complete JSON examples for every response. The frontend therefore supports several common response wrappers.

The assignment screen currently accepts a user ID because the documented assignment endpoint accepts `assignedTo`. If the backend has a user/admin listing endpoint, replace the text input with a searchable user selector.
