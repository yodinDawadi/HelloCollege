const authService = require("../services/authService");
const { publicUser } = require("../utils/helpers");
async function register(req, res, next) {
  try {
    res.status(201).json(await authService.register(req.body));
  } catch (error) {
    next(error);
  }
}
async function login(req, res, next) {
  try {
    res.json(await authService.login(req.body));
  } catch (error) {
    next(error);
  }
}
function me(req, res) {
  res.json({ user: publicUser(req.user) });
}
module.exports = { register, login, me };
