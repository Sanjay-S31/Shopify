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
  changePassword,
  forgotPassword,
  getRecommendedProducts,
} = require("../controllers/userController");

// login
route.post("/login", loginUser);

// forgot password
route.post("/forgotPassword", forgotPassword)

// signup
route.post("/signup", signupUser);

route.use(requireAuth);

route.put("/addProductId", addProductId);

route.put("/addLikedProduct", addLikedProduct);

route.get('/likedProducts', getLikedProducts);

route.get("/getUserProfile", getUserProfile);

route.put("/editUserProfile", editUserProfile);

route.put("/changePassword", changePassword);

route.get('/recommendation',getRecommendedProducts);

module.exports = route;
