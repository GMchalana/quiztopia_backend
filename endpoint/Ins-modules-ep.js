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




  // exports.getQuizQuestions = async (req, res) => {
  //   const { moduleId, type } = req.params;
  
  //   try {
  //     const mcQuestions = await modulesDao.getMcQuestionsByModuleId(moduleId);
      
  
  //     // Combine and sort by questionIndex
  //     const allQuestions = [...mcQuestions].sort(
  //       (a, b) => a.questionIndex - b.questionIndex
  //     );
  
  //     res.status(200).json({ moduleId, questions: allQuestions });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ error: 'Failed to fetch quiz questions ❌' });
  //   }
  // };


  exports.getQuizQuestions = async (req, res) => {
    const { moduleId, type } = req.params;
    
    try {
      let questions = [];
      
      // Get questions based on the type parameter
      if (type === 'auto') {
        const mcQuestions = await modulesDao.getMcQuestionsByModuleId(moduleId);

        questions = [...mcQuestions];
      } 
      else if (type === 'manual') {
        questions = await modulesDao.getManualGradedQuestionsByModuleId(moduleId);
      }
      // else {
      //   // If no type specified or 'all', get both types
      //   const mcQuestions = await modulesDao.getMcQuestionsByModuleId(moduleId);
      //   const tfQuestions = await modulesDao.getTfQuestionsByModuleId(moduleId);
      //   const manualQuestions = await modulesDao.getManualGradedQuestionsByModuleId(moduleId);
      //   questions = [...mcQuestions, ...tfQuestions, ...manualQuestions];
      // }
      
      // Sort all questions by questionIndex
      const sortedQuestions = questions.sort((a, b) => a.questionIndex - b.questionIndex);
      
      res.status(200).json({ moduleId, questions: sortedQuestions });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch quiz questions ❌' });
    }
  };
  




  exports.deleteModule = async (req, res) => {
    const { moduleId } = req.params;
  
    try {
      const result = await modulesDao.deleteModuleById(moduleId);
      res.status(200).json({ message: 'Module deleted successfully ✅', result });
    } catch (error) {
      console.error('Error deleting module ❌:', error);
      res.status(500).json({ error: 'Failed to delete module' });
    }
  };



  exports.storeManualGradedQuestions = async (req, res) => {
    const { moduleName, timeEstimate, questions } = req.body;
  
    try {
        const response = await modulesDao.storeManualGradedQuestions( moduleName, timeEstimate, questions);
        res.status(200).json({ message: 'Manual graded questions saved successfully ✅', moduleId: response });
      } catch (error) {
        console.error('Error saving manual graded questions:', error);
        res.status(500).json({ error: 'Failed to save manual graded questions ❌' });
      }
  };











  // controllers/moduleController.js
  const db = require("../startup/database");

exports.createManualGradedModule = async (req, res) => {
  const { moduleName, timeEstimate, questions } = req.body;
  
  try {
    // Start transaction
    await db.beginTransaction();

    // 1. Create the module
    const [moduleResult] = await db.query(
      'INSERT INTO module (moduleName, numOfQuestions, estimationTime, deleteStatus) VALUES (?, ?, ?, ?)',
      [moduleName, questions.length, timeEstimate, false]
    );
    
    const moduleId = moduleResult.insertId;

    // 2. Create the questions
    for (let i = 0; i < questions.length; i++) {
      const { question, sampleAnswer } = questions[i];
      await db.query(
        'INSERT INTO manualgradedquestions (moduleId, questionIndex, question, sampleAnswer) VALUES (?, ?, ?, ?)',
        [moduleId, i + 1, question, sampleAnswer]
      );
    }

    // Commit transaction
    await db.commit();

    res.status(201).json({
      success: true,
      message: 'Manual graded module created successfully',
      moduleId
    });
  } catch (error) {
    // Rollback transaction if error occurs
    await db.rollback();
    console.error('Error creating manual graded module:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create manual graded module',
      error: error.message
    });
  }
};
  