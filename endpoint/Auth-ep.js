const jwt = require("jsonwebtoken");
const { log } = require("console");
const authDao = require("../dao/Auth-dao");
const bcrypt = require("bcryptjs");




exports.createPlantCareUser = async (req, res) => {
    try {

      const {
        email,
        password,
        role,
        userName
      } = req.body;

      const userData = {
        email,
        userName,
        role,
        password
      };
  
      console.log('User inserting data :',userData);
      const result = await authDao.createPlantCareUser(userData);
  
      console.log("PlantCare user created successfully");
      return res.status(201).json({
        message: result.message, 
        id: result.userId, 
    
      
      });
    } catch (error) {
      if (error.message === "Phone number or NIC number already exists") {
        // Handle validation error for duplicate phoneNumber or NICnumber
        return res.status(400).json({ error: error.message });
      }
  
      console.error("Error creating PlantCare user:", error);
      return res
        .status(500)
        .json({ error: "An error occurred while creating PlantCare user" });
    }
  };



  