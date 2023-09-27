const User = require("../models/users");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { v4: uuidv4 } = require("uuid");
const { send_magic_link } = require("./email");
const jwt_secret = process.env.JWT_SECRET;
const newMagicLink = uuidv4();

// Function to register a new user
const register = async (email) => {
  const uniqueUserId = uuidv4();
  console.log("registering")
  try {
    const newUser = {
      UUI: uniqueUserId,
      Email: email,
      MagicLink: newMagicLink,
    };

    // Create a new user in the database
    let user = await User.create(newUser);
    // Send a magic link to the user's email
    let sendEmail = send_magic_link(email, user.MagicLink, "signup");
    return { ok: true, message: "User created successfully" };
  } catch (err) {
    console.log(err)
    return { ok: false, message: err };
  }
};

// Function to handle user login
const login = async (req, res) => {
  console.log("running login")
  const { email, magicLink = "" } = req.body;
  if (!email) {
    return res.json({ ok: false, message: "Email is required" });
  }
  if (!validator.isEmail(email)) {
    return res.json({ ok: false, message: "Invalid email" });
  }

  console.log("3")

  try {
    const user = await User.findOne({ Email: email });
    console.log("4")
    if (!user) {
      // If the user does not exist, register them
      let reg = await register(email);
      res.send({
        ok: true,
        message:
          "Your account has been created, click the link in email to sign in 👻",
      });
    } else if (!magicLink) {
      try {
        console.log("if no magic link")
        // If the magic link is not provided, update the user's magic link
        console.log(user)
        const user = await User.findOneAndUpdate(
          { Email: email },
          { MagicLink: newMagicLink, MagicLinkExpired: false }
        );
        console.log(user,"user after magic generated")
        send_magic_link(email, user.MagicLink);
        res.send({ ok: true, message: "Hit the link in email to sign in" });
      } catch (err) {
        res.send({ ok: false, message: "Something went wrong" });
      }
    } else if (user.MagicLink == magicLink && user.MagicLinkExpired === false) {
      console.log("if Magic present and matches")
      // If the magic link matches and is not expired, generate a JWT token
      const token = jwt.sign(user.toJSON(), jwt_secret, { expiresIn: "1h" });
      // Update the MagicLinkExpired flag
      await User.findOneAndUpdate({ Email: email }, { MagicLinkExpired: true });
      res.json({ ok: true, message: "Welcome back", token, email });
    } else return res.json({ ok: false, message: "Magic link expired! Please Try Again." });
  } catch (error) {
    res.json({ ok: false, error });
    console.log(error);
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
