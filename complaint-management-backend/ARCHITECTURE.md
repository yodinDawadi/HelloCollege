# Backend Architecture

The backend follows a layered structure so each file has one clear responsibility.

```text
src/
├── config/                  # Environment and application configuration
│   └── env.js
├── db/                      # Database connection and demo memory store
│   └── index.js
├── models.js                # Mongoose schemas
├── repositories/             # Database queries; no HTTP logic
│   ├── userRepository.js
│   ├── complaintRepository.js
│   └── notificationRepository.js
├── services/                 # Business rules and use cases
│   ├── authService.js
│   ├── complaintService.js
│   └── notificationService.js
├── controllers/              # Request/response handling
│   ├── authController.js
│   ├── complaintController.js
│   └── otherControllers.js
├── routes/                   # URL definitions and middleware wiring
│   ├── authRoutes.js
│   ├── complaintRoutes.js
│   └── systemRoutes.js
├── middleware/               # Cross-cutting HTTP behavior
│   ├── auth.js
│   └── common.js
├── validators/               # Zod request schemas
│   └── schemas.js
├── utils/                    # Shared helper functions
│   └── helpers.js
├── rules.js                  # Complaint category and priority algorithm
├── app.js                    # Express app composition
└── server.js                 # Process startup
```

## Request flow

A request follows this path:

```text
Route → Middleware → Controller → Service → Repository → Database
                                      ↓
                                  Response
```

For example, `POST /api/complaints` is defined in `routes/complaintRoutes.js`, validated and authenticated by middleware, received by `complaintController.create`, processed by `complaintService.createComplaint`, and persisted through `complaintRepository.create`.

## Where to add future features

- Add a new endpoint in `src/routes/`.
- Add request validation in `src/validators/schemas.js`.
- Add business logic in the relevant `src/services/` file.
- Add database queries in `src/repositories/`.
- Add response handling in `src/controllers/`.
- Add a new Mongoose collection in `src/models.js` only when a new database entity is required.

Do not put database queries directly in routes or controllers. Do not put `req`/`res` logic in services.
