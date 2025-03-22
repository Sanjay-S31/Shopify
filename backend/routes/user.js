const express = require("express");
const route = express.Router();

const requireAuth = require('../middleware/requireAuth')

const {
  loginUser,
  signupUser,
  addProductId,
} = require("../controllers/userController");

//login
route.post("/login", loginUser);

//signup
route.post("/signup", signupUser);

route.use(requireAuth);

route.put("/addProductId", addProductId);

module.exports = route;
