const express = require("express");
const modulesEP = require("../endpoint/Ins-modules-ep");

const router = express.Router();




router.get(
    '/get-all-modules', 
    modulesEP.getAllModules
);







module.exports = router;