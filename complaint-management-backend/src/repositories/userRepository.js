const { User } = require("../models");
const { memory, useMongo } = require("../db");
const { id, getId } = require("../utils/helpers");

async function findByEmail(email) {
  return useMongo
    ? User.findOne({ email })
    : memory.users.find((user) => user.email === email);
}
async function findById(userId) {
  return useMongo
    ? User.findById(userId)
    : memory.users.find((user) => user.id === userId);
}
async function create(data) {
  const user = useMongo
    ? await User.create(data)
    : { ...data, id: id(), createdAt: new Date(), updatedAt: new Date() };
  if (!useMongo) memory.users.push(user);
  return user;
}
module.exports = { findByEmail, findById, create, getId };
