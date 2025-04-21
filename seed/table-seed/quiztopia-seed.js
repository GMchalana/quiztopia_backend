const { createUsersTable } = require('../tables/quiztopia');
const { createModuleTable } = require('../tables/quiztopia');
const { createMcQuestionsTable } = require('../tables/quiztopia');
const { createMcqAnswersTable } = require('../tables/quiztopia');
const { createTfQuestionsTable } = require('../tables/quiztopia');
const { createManualGradedQuestionsTable } = require('../tables/quiztopia');
const { createModuleRatingsTable } = require('../tables/quiztopia');
const { createStudentAnswerTable } = require('../tables/quiztopia');
const { createQuizattemptTable } = require('../tables/quiztopia');



const seedQuiztopia = async () => {
    try {
      const messagecreateUsersTable = await createUsersTable();
      console.log(messagecreateUsersTable);

      const messagecreateModuleTable= await createModuleTable();
      console.log(messagecreateModuleTable);
  
      const messagecreateMcQuestionsTable = await createMcQuestionsTable();
      console.log(messagecreateMcQuestionsTable);
  
      const messagecreateMcqAnswersTable = await createMcqAnswersTable();
      console.log(messagecreateMcqAnswersTable);
  
      const messagecreateTfQuestionsTable = await createTfQuestionsTable();
      console.log(messagecreateTfQuestionsTable);

      const messagecreateManualGradedQuestionsTable = await createManualGradedQuestionsTable();
      console.log(messagecreateManualGradedQuestionsTable);

      const messagecreateModuleRatingsTable = await createModuleRatingsTable();
      console.log(messagecreateModuleRatingsTable);

      const messagecreateStudentAnswerTable = await createStudentAnswerTable();
      console.log(messagecreateManualGradedQuestionsTable);

      const messagecreateQuizattemptTable = await createQuizattemptTable();
      console.log(messagecreateQuizattemptTable);
  
  
      
      
    } catch (err) {
      console.error('Error seeding seedPlantCare:', err);
    }
  };
  
  module.exports = seedQuiztopia;
  