const express = require("express");
const modulesEP = require("../endpoint/Ins-modules-ep");

const router = express.Router();




router.get(
    '/get-all-modules', 
    modulesEP.getAllModules
);


router.post(
    '/quizzes', 
    modulesEP.createQuiz
);


router.get(
    '/questions/:moduleId', 
    modulesEP.getQuizQuestions
);


router.delete(
    '/delete-module/:moduleId', 
    modulesEP.deleteModule
);

router.post(
    '/store-manual-questions', 
    modulesEP.storeManualGradedQuestions
);







module.exports = router;