const express = require("express");

const AuthEP = require("../endpoint/Auth-ep");
// const authMiddleware = require("../middlewares/authMiddleware");




const router = express.Router();


router.post(
    "/sign-up",
   
    AuthEP.createPlantCareUser
  );


  router.post("/login", AuthEP.login);









module.exports = router;

  