const { createUsersTable } = require('../tables/quiztopia');



const seedQuiztopia = async () => {
    try {
      const messagecreateUsersTable = await createUsersTable();
      console.log(messagecreateUsersTable);
  
      
      
    } catch (err) {
      console.error('Error seeding seedPlantCare:', err);
    }
  };
  
  module.exports = seedQuiztopia;
  