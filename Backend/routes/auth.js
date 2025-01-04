// DynamoDB

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk");

const router = express.Router();

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.DYNAMODB_TABLE;

// User signup route
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user exists
    const params = {
      TableName: USERS_TABLE,
      Key: { 

        email: email, // Partition Key
        // name: name,   // Sort key
       },
    };
    const existingUser = await dynamoDb.get(params).promise();
    if (existingUser.Item) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Hash password and save new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { name, email, password: hashedPassword };

    const putParams = {
      TableName: USERS_TABLE,
      Item: newUser,
    };
    await dynamoDb.put(putParams).promise();

    res.status(201).json({ success: true, message: "Signup successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// User login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Retrieve user from DynamoDB
    const params = {
      TableName: USERS_TABLE,
      Key: { 
       
        email: email,
        // name: name,  // Partition Key

       },
    };
    const user = await dynamoDb.get(params).promise();

    if (!user.Item) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.Item.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.Item.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ success: true, message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

module.exports = router;
