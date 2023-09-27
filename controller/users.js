const User = require("../models/users");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { v4: uuidv4 } = require("uuid");
const jwt_secret = process.env.JWT_SECRET;
const bcrypt = require("bcrypt");


// Function to register a new user
const register = async (email, password) => {
  const uniqueUserId = uuidv4();
  console.log("registering");
  try {
    // Check if the email is already in use
    const existingUser = await User.findOne({ Email: email });
    if (existingUser) {
      return { ok: false, message: "Email is already registered" };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("hashed password", hashedPassword);
    const newUser = {
      UUI: uniqueUserId,
      Email: email,
      Password: hashedPassword,
    };

    // Create a new user in the database
    let user = await User.create(newUser);
    return { ok: true, message: "User created successfully" };
  } catch (err) {
    console.error("Registration error:", err);
    return { ok: false, message: "Registration failed" };
  }
};


// Function to handle user login
const login = async (req, res) => {

  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ ok: false, message: "Email and password are required" });
  }
  if (!validator.isEmail(email)) {
    return res.json({ ok: false, message: "Invalid email" });
  }

  try {
    const user = await User.findOne({ Email: email });

    if (!user) {
      // If the user does not exist, you can choose to handle this case as needed
      let reg = await register(email, password);
      if (reg.ok) {
        return res.json({ ok: true, message: "Registration successful" });
      }
    }

    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, user.Password);

    if (passwordMatch) {
      // Passwords match, generate a JWT token, update flags, and respond accordingly
      const token = jwt.sign(user.toJSON(), jwt_secret, { expiresIn: "1h" });
      // Update the MagicLinkExpired flag (if needed)
      await User.findOneAndUpdate({ Email: email }, { MagicLinkExpired: true });

      return res.json({ ok: true, message: "Welcome back", token, email });
    } else {
      // Passwords do not match
      return res.json({ ok: false, message: "Incorrect password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.json({ ok: false, message: "Login failed" });
  }
};

// Function to verify a JWT token
const verify_token = (req, res) => {
  const token = req.headers.authorization;
  jwt.verify(token, jwt_secret, (err, succ) => {
    if (err) {
      res.json({ ok: false, message: "Something went wrong" });
    } else {
      res.json({ ok: true, succ });
    }
  });
};

// Function to get user details based on the JWT token
const getuser = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, jwt_secret);
    const user = await User.findOne({ UUI: decoded.UUI });

    if (user) {
      res.json({ ok: true, user });
    } else {
      res.json({ ok: false, message: "User Not Found" });
    }
  } catch (error) {
    res.status(500).json({ ok: false, message: "Something went wrong" });
  }
};

// Function to update user profile
const updateProfile = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, jwt_secret);
    const { name, languageToLearn, languageFamiliarity } = req.body;

    // Update the user's profile data in the database
    const updatedUser = await User.findOneAndUpdate(
      { UUI: decoded.UUI },
      {
        Name: name,
        languageToLearn,
        languageFamiliarity,
      },
      { new: true }
    );

    res.json({ ok: true, user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Profile update failed" });
  }
};

const resetProgress = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, jwt_secret);
    const user = await User.findOne({ UUI: decoded.UUI });

    if (!user) {
      res.status(404).json({ ok: false, message: "User not found" });
    }
    user.AttemptedQuestions = [];
    user.PointsScored = 0;
    user.totalQuestions = [];

    // Save the updated user object
    const reset = await user.save();

    res.json({ ok: true, user: reset });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Reset failed" });
  }
};


const leaderboard = async(req, res) => {
  try {
    const users = await User.find({})
      .sort({ PointsScored: -1 })
      .select("Name PointsScored totalQuestions")
      .exec();

    res.status(200).json({ success: true, leaderboard: users });
  } catch (error) {
    res.status(500).json({ success: false, error: "Something went wrong" });
  }
}

module.exports = { login, verify_token, getuser, updateProfile, resetProgress, leaderboard };
