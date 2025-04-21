// controllers/moduleController.js
const moduleDAO = require('../dao/StAnswers-dao');

exports.submitAnswers = async (req, res) => {
  try {
    const { userId, moduleId, answers } = req.body;

    if (!userId || !moduleId || !answers) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    await moduleDAO.saveStudentAnswersWithAttempt(userId, moduleId, answers);

    res.status(200).json({ message: 'Answers submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
