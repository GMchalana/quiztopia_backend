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