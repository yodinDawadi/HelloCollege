const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");
const userRepository = require("../repositories/userRepository");
const { publicUser } = require("../utils/helpers");

async function register(data) {
  const email = data.email.toLowerCase();
  if (await userRepository.findByEmail(email)) {
    const error = new Error("Email already registered");
    error.status = 409;
    throw error;
  }
  const user = await userRepository.create({
    name: data.name,
    email,
    passwordHash: await bcrypt.hash(data.password, 12),
    rollNumber: data.rollNumber,
    role: data.role || "student",
    department: data.department,
  });
  return createSession(user);
}
async function login({ email, password }) {
  const user = await userRepository.findByEmail(email.toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }
  return createSession(user);
}
function createSession(user) {
  return {
    user: publicUser(user),
    token: jwt.sign(
      { sub: userRepository.getId(user), role: user.role },
      jwtSecret,
      { expiresIn: "7d" },
    ),
  };
}
module.exports = { register, login };
