const express = require("express");
const route = express.Router();

const requireAuth = require('../middleware/requireAuth')

const {
  loginUser,
  signupUser,
  addProductId,
  addLikedProduct,
  getLikedProducts,
  getUserProfile,
  editUserProfile,
  changePassword
} = require("../controllers/userController");

//login
route.post("/login", loginUser);

//signup
route.post("/signup", signupUser);

route.use(requireAuth);

route.put("/addProductId", addProductId);

route.put("/addLikedProduct", addLikedProduct);

route.get('/likedProducts', getLikedProducts);

route.get("/getUserProfile", getUserProfile);

route.put("/editUserProfile", editUserProfile);

route.put("/changePassword", changePassword);

module.exports = route;
