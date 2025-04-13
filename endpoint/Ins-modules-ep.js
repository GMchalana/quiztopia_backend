const { log } = require("console");
const modulesDao = require("../dao/Ins-modules-dao");


exports.getAllModules = async (req, res) => {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);
    console.log("Request method:", req.method);
    try {
      const modules = await modulesDao.getAllModules();
      res.status(200).json(modules);
    } catch (err) {
      console.error('Error fetching module list:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };





exports.createQuiz = async (req, res) => {
    try {
      const { quizName, timeEstimate, questions } = req.body;
  
      const moduleId = await modulesDao.createModule(quizName, questions.length, timeEstimate);
  
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const index = i;
  
        if (q.type === 'multiple-choice') {
          const mcqId = await modulesDao.createMcQuestion(moduleId, index, q.question);
          for (let j = 0; j < q.options.length; j++) {
            const answer = q.options[j];
            const isCorrect = j === q.correctAnswer;
            await modulesDao.createMcqAnswer(mcqId, answer, isCorrect);
          }
        } else if (q.type === 'true-false') {
          const isTrue = q.correctAnswer === 0; // Assuming 0 => True, 1 => False
          await modulesDao.createTfQuestion(moduleId, index, q.question, isTrue);
        }
      }
  
      res.status(201).json({ message: 'Quiz stored successfully ✅' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error saving quiz ❌' });
    }
  };




  exports.getQuizQuestions = async (req, res) => {
    const { moduleId } = req.params;
  
    try {
      const mcQuestions = await modulesDao.getMcQuestionsByModuleId(moduleId);
      const tfQuestions = await modulesDao.getTfQuestionsByModuleId(moduleId);
  
      // Combine and sort by questionIndex
      const allQuestions = [...mcQuestions, ...tfQuestions].sort(
        (a, b) => a.questionIndex - b.questionIndex
      );
  
      res.status(200).json({ moduleId, questions: allQuestions });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch quiz questions ❌' });
    }
  };
  