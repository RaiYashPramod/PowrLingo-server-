const { v4: uuidv4 } = require("uuid");
const Battle = require("../models/battles");
const jwt = require('jsonwebtoken');
const jwt_secret = process.env.JWT_SECRET;
const User = require("../models/users");


const getuser = async (req) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, jwt_secret);
    const user = await User.findOne({ UUI: decoded.UUI });

    if (user) {
      return { ok: true,  user };
    } else {
      return { ok: false, message: "User Not Found" };
    }
  } catch (error) {
    return { ok: false, message: "Something went wrong" };
  }
};


// const create = async(req, res) => {
//   try {
//     const battleId = uuidv4();
//     const numOfQuestions = req.body.numOfQuestions;
//     const verifiedUser = await getuser(req);
//     if (!verifiedUser.ok) {
//       return res.status(401).json({ message: "HMM!! Something Seems OFF!" });
//     }
//     const userId = verifiedUser.user._id

//     const newBattle = {
//       battleId: battleId,
//       participants: [userId],
//       numOfQuestions: numOfQuestions,
//       challenger: userId,
//     }
//     let battle = await Battle.create(newBattle);
//     console.log(battle);

//     const battleURL = `www.powrlingo.vercel.app/battle/join/${battleId}`
//     return res.status(201).json(battleURL);
//   } catch (error) {
//     console.log(error);
//     if (error.name === "ValidationError") {
//       return res.status(400).json({ message: "Invalid data provided for battle creation" });
//     } 
//     else {
//       return res.status(500).json({ message: "Error creating battle room" });
//     }
//   }
// }

const create = async(req, res) => {
  try {
    const battleId = uuidv4(); // Generate a unique battleId
    const numOfQuestions = req.body.numOfQuestions;
    const verifiedUser = await getuser(req);
    
    if (!verifiedUser.ok) {
      return res.status(401).json({ message: "HMM!! Something Seems OFF!" });
    }
    
    const userId = verifiedUser.user._id;

    // Check if the battleId generated is unique
    const existingBattle = await Battle.findOne({ battleId: battleId });
    if (existingBattle) {
      // If battleId is not unique, generate a new one
      return res.status(500).json({ message: "Error creating battle room. Please try again." });
    }

    const newBattle = {
      battleId: battleId,
      participants: [userId],
      numOfQuestions: numOfQuestions,
      challenger: userId,
    };

    let battle = await Battle.create(newBattle);
    console.log(battle);

    const battleURL = `www.powrlingo.vercel.app/battle/join/${battleId}`
    return res.status(201).json(battleURL);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creating battle room" });
  }
}


const join = async (req, res) => {
  try {
    const battleId = req.params.id;
    const verifiedUser = await getuser(req)
    if (!verifiedUser) {
      return res.status(401).json({ message: "HMM!! Something Seems OFF!" });
    }
    
    const userId = verifiedUser.user._id
    
    const battle = await Battle.findOne({ battleId: battleId });
    
    
    if (!battle) {
      return res.status(404).json({ message: "Battle not found" });
    }
    
    if (battle.challenger.toString() === userId.toString()) {
      return res.status(400).json({ message: "User who created the battle cannot join" });
    }

    if (battle.participants.length >= 2) {
      return res.status(400).json({ message: "Battle already has two participants" });
    }

    battle.participants.push(userId);

    await battle.save();

    return res.status(200).json(battle);
  } catch (error) {
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    } else if (error.name === "CastError") {
      console.log(error);
      return res.status(400).json({ message: "Invalid battle ID" });
    } else {
      // Handle other errors
      console.log(error);
      return res.status(500).json({ message: "Error joining the battle" });
    }
  }
};


module.exports = { create, join };