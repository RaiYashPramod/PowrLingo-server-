const { v4: uuidv4 } = require("uuid");
const Battle = require("../models/battles");
const jwt = require("jsonwebtoken");
const jwt_secret = process.env.JWT_SECRET;
const User = require("../models/users");
const Question = require("../models/questions");

// helper functions
const getuser = async (token) => {
  const decoded = jwt.verify(token, jwt_secret);
  const user = await User.findOne({ UUI: decoded.UUI });
  if (user) {
    return { ok: true, user };
  } else {
    return { ok: false, message: "User Not Found" };
  }
};

const getBattle = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const verifiedUser = await getuser(token);
    if (!verifiedUser.ok) {
      return res.status(401).json({ message: "Please Login!" });
    }
    const userId = verifiedUser.user._id;
    const battleId = req.params.id;
    const battle = await Battle.findOne({ battleId: battleId });
    if (!battle) {
      return res.status(404).json({ message: "Battle not found" });
    }
    if (!battle.participants.includes(userId)) {
      return res
        .status(401)
        .json({ message: "You are not a participant of this battle" });
    } else {
      return res.status(200).json(battle);
    }
  } catch (error) {
    return res.status(500).json({ message: "Error getting battle" });
  }
};

const onGoingBattle = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const verifiedUser = await getuser(token);
    if (!verifiedUser.ok) {
      return res.status(401).json({ message: "Please Login!" });
    }
    const userId = verifiedUser.user._id;
    const battle = await Battle.findOne({
      participants: userId,
    });

    if (battle?.status === "Ongoing") {
      return res.status(200).json(battle);
    } else {
      return res
        .status(404)
        .json({ message: "No Ongoing Battle at this Moment!" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error getting battle" });
  }
};


const create = async (req, res) => {
  try {
    const battleId = uuidv4(); // Generate a unique battleId
    const numOfQuestions = req.body.numOfQuestions;
    const language = req.body.language;
    const token = req.headers.authorization;
    const verifiedUser = await getuser(token);

    if (!verifiedUser.ok) {
      return res.status(401).json({ message: "HMM!! Something Seems OFF!" });
    }

    const userId = verifiedUser.user._id;

    // Check if the battleId generated is unique
    const existingBattle = await Battle.findOne({ battleId: battleId });
    if (existingBattle) {
      // If battleId is not unique, generate a new one
      return res
        .status(500)
        .json({ message: "Error creating battle room. Please try again." });
    }

    const alreadyInBattle = await Battle.findOne({
      participants: userId,
    });

    if (alreadyInBattle) {
      return res.status(400).json({ message: "You are already in a battle" });
    }

    const newBattle = {
      battleId: battleId,
      participants: [userId],
      numOfQuestions: numOfQuestions,
      language: language,
      challenger: userId,
    };

    let battle = await Battle.create(newBattle);

    // const battleURL = `www.powrlingo.vercel.app/battle/join/${battleId}`
    const battleURL = battleId;
    return res.status(201).json(battleURL);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creating battle room" });
  }
};

const join = async (req, res) => {
  try {
    const battleId = req.params.id;
    const token = req.headers.authorization;
    const verifiedUser = await getuser(token);
    if (!verifiedUser.ok) {
      return res.status(401).json({ message: "HMM!! Something Seems OFF!" });
    }
    const userId = verifiedUser.user._id;

    const battle = await Battle.findOne({ battleId: battleId });
    if (!battle) {
      return res.status(404).json({ message: "Battle not found" });
    }
    if (battle.challenger.equals(userId)) {
      return res.status(400).json({ message: "You cannot join your own battle" });
    }

    const updatedBattle = await Battle.findOneAndUpdate(
      {
        battleId: battleId,
        status: "Waiting for opponent",
        participants: { $not: { $size: 2 } },
      },
      { $push: { participants: userId }, status: "Ongoing" },
      { new: true }
    );

    if (!updatedBattle) {
      return res.status(400).json({ message: "Unable to join battle" });
    }

    return res.status(200).json(updatedBattle);
  } catch (error) {
    console.error("Error joining the battle:", error);
    return res.status(500).json({ message: "Error joining the battle" });
  }
};

const changeTurn = async (req, res) => {
  const  battleId  = req.params.id;
  const { challenger } = req.body;
  try {
    const battle = await Battle.findOne({ battleId: battleId });
    if (!battle) {
      return res.status(404).json({ message: "Battle not found" });
    }

    const updatedTurn = await Battle.findOneAndUpdate(
      { battleId: battleId },
      { challenger: challenger },
      { new: true }
    )

    res.status(200).json({ meessage: 'Player turn has been updated successfully', updatedTurn });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
}

const fetchQuestions = async (req, res) => {
  try {
    const battleId = req.params.id;
    const battle = await Battle.findOne({ battleId: battleId });

    if (!battle) {
      return res.status(404).json({ message: "Battle not found" });
    }

    const language = battle.language;

    const questions = await Question.find({ language: language });

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No questions found for the specified language",
      });
    }

    const shuffledQuestions = shuffleArray(questions)


    const randomQuestions = shuffledQuestions.slice(0, battle.numOfQuestions)
    console.log(randomQuestions);
    res.status(200).json({succcess: true, message: 'Questions fetched successfully', randomQuestions})


  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch the questions" });
  }
}

//helperfunctions
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const submitAnswer = async() => {
  
}
module.exports = { getBattle, create, join, onGoingBattle, changeTurn, fetchQuestions };
