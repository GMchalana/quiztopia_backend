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
















  exports.login = async (req, res) => {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);
  
    try {
      // Validate request body
      // await ValidateSchema.loginAdminSchema.validateAsync(req.body);
  
      const { email, password } = req.body;
  
      // Fetch user and permissions from the database
      const [user] = await authDao.login(email);
  
      if (!user) {
        return res.status(401).json({ error: "User not found." });
      }
  
      // const verify_password = bcrypt.compareSync(password, user.password);
  
      if (password != user.password) {
        return res.status(401).json({ error: "Wrong password." });
      }
  
      // Fetch permissions based on the user's role

  
      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "5h" }
      );
  
      // Construct response data
      const data = {
        token,
        userId: user.id,
        role: user.role,
        userName: user.userName,
        expiresIn: 18000,
      };
  
      res.json(data);
    } catch (err) {
      console.error("Error during login:", err);
  
      if (err.isJoi) {
        // Validation error
        return res
          .status(400)
          .json({ error: "Invalid input data", details: err.details });
      }
  
      // For any other unexpected errors, keep the 500 status
      res.status(500).json({ error: "An internal server error occurred." });
    }
  };



  