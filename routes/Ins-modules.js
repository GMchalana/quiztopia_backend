const express = require("express");
const modulesEP = require("../endpoint/Ins-modules-ep");
const db = require("../startup/database");

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
    '/questions/:moduleId/:type', 
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




router.post('/submit-rating', async (req, res) => {
    try {
        const { moduleId, userId, numOfStars } = req.body;
        
        // Check if required fields are present
        if (!moduleId || !userId || !numOfStars) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        // Insert rating into the moduleratings table
        const query = 'INSERT INTO moduleratings (moduleId, userId, numOfStars) VALUES (?, ?, ?)';
        const params = [moduleId, userId, numOfStars];
        
        // Depending on your database library, you might need one of these:
        // Option 1: If your db.query returns a promise directly
        // const result = await db.query(query, params);
        
        // Option 2: If your db.query uses callback style
        const result = await new Promise((resolve, reject) => {
            db.query(query, params, (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        });
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error submitting rating:', error);
        res.status(500).json({ success: false, error: 'Failed to submit rating' });
    }
});






module.exports = router;