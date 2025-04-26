const express = require("express");

const answerReviewEP = require("../endpoint/AnswerReview-ep");
const router = express.Router();



router.get(
    '/get-all-attemps-for-ins/:moduleId', 
    answerReviewEP.getStudentAttempts
);


router.get(
    '/get-all-attemps-for-ins-manual/:moduleId', 
    answerReviewEP.getManualStudentAttempts
);


router.get(
    '/get-manual-selected-attempt/:attemptId', 
    answerReviewEP.getManualAttemptDetails
);

router.post(
    '/update-iscorrect-manual/:attemptId', 
    answerReviewEP.updateManualGrades
);


module.exports = router;
