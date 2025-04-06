const seedQuiztopia = require('./table-seed/quiztopia-seed');




const runSeeds = async () => {
    try {
  
  
      console.log('Seeding quiztopia Database ...');
      await seedQuiztopia();
      console.log('===========================================✅✅✅✅✅✅✅');
  
   
    } catch (err) {
      console.error('Error running seeds:', err);
    } finally {
      process.exit();
    }
  };
  
  runSeeds();
  