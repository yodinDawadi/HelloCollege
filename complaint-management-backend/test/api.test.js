process.env.USE_MONGODB = "false";
process.env.JWT_SECRET = "test-secret";
const test = require("node:test");
const assert = require("node:assert/strict");
const { app, memory } = require("../src/app");
const http = require("http");

let server, base, studentToken, adminToken, complaintId;
function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      base + path,
      {
        method,
        headers: {
          "content-type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
      },
      (r) => {
        let d = "";
        r.on("data", (c) => (d += c));
        r.on("end", () =>
          resolve({ status: r.statusCode, body: d ? JSON.parse(d) : {} }),
        );
      },
    );
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

test.before(async () => {
  memory.users.length =
    memory.complaints.length =
    memory.notifications.length =
      0;
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => server.close());

test("register student and admin", async () => {
  let r = await request("POST", "/api/auth/register", {
    name: "Test Student",
    email: "student@example.com",
    password: "secret123",
    rollNumber: "CCT-001",
  });
  assert.equal(r.status, 201);
  studentToken = r.body.token;
  r = await request("POST", "/api/auth/register", {
    name: "Test Admin",
    email: "admin@example.com",
    password: "secret123",
    role: "admin",
  });
  assert.equal(r.status, 201);
  adminToken = r.body.token;
});
test("student submits routed and prioritized complaint", async () => {
  const r = await request(
    "POST",
    "/api/complaints",
    {
      category: "electricity",
      description: "No power and exposed wire in classroom; safety issue",
      location: "Block A, Room 3",
    },
    studentToken,
  );
  assert.equal(r.status, 201);
  assert.equal(r.body.complaint.department, "Maintenance Section");
  assert.equal(r.body.complaint.priority.level, "critical");
  complaintId = r.body.complaint.id;
});
test("student sees own complaint", async () => {
  const r = await request("GET", "/api/complaints", null, studentToken);
  assert.equal(r.status, 200);
  assert.equal(r.body.complaints.length, 1);
});
test("admin updates status and student receives notification", async () => {
  let r = await request(
    "PATCH",
    `/api/complaints/${complaintId}/status`,
    { status: "resolved", note: "Repaired by maintenance" },
    adminToken,
  );
  assert.equal(r.status, 200);
  assert.equal(r.body.complaint.status, "resolved");
  r = await request("GET", "/api/notifications", null, studentToken);
  assert.equal(r.status, 200);
  assert.equal(r.body.notifications.length, 1);
});
