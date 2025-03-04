const express = require('express');
const router = express.Router();
const User = require('../models/user-modal'); // "user-modal" ki jagah "user-model" hona chahiye agar aapka model filename ye hai
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
require('dotenv').config();

// SIGNUP ROUTE
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate Input
        if (!username || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use" });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create New User
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "Signup successful! Please log in." });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// SIGNIN ROUTE
router.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate Input
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        console.log(user)
        // Compare Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Password Invalid email or password" });
        }

        // Generate JWT Token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(200).json({ message: "Login successful", token, id:user._id, username: user.username });
    } catch (error) {
        console.error("Signin Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

router.get('/user/:id', async (req,res) => {
    try {
        const id = req.params.id;
        if(!id){
            res.json({msg:"All Fields Requires"})
        }

        const user = await User.findById(id)
        if(!user){
            res.status(400).send("User Does Not Exists.")
        }
        res.status(200).json(user)
    } catch (error) {
        console.log(error)
    }
})

module.exports = router;
