const Question = require("../models/questions");
const User = require("../models/users");
const jwt = require("jsonwebtoken");
const jwt_secret = process.env.JWT_SECRET;

const addQuestions = async (req, res) => {
  try {
    const newQuestion = new Question(req.body);
    const savedQuestion = await newQuestion.save();
    res.json({
      success: true,
      message: "Question added successfully",
      question: savedQuestion,
    });
  } catch (error) {
    // console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to add the question" });
  }
};

const getQuestions = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, jwt_secret);

    // Get the user's AttemptedQuestions array
    const user = await User.findOne({ UUI: decoded.UUI });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const attemptedQuestions = user.AttemptedQuestions;


    console.log(user.languageToLearn)
    const questions = await Question.find({
      language: user.languageToLearn,
      _id: { $nin: attemptedQuestions },
    });
    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No questions found for the specified language",
      });
    }

    res.status(200).json({
      success: true,
      message: "Questions fetched successfully",
      questions,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch the questions" });
  }
};

const answerQuestion = async (req, res) => {
  try {
    const { questionId, questionLanguage, isCorrect, questionDifficulty } =
      req.body;
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, jwt_secret);

    const updateQuery = {
      $push: {
        AttemptedQuestions: questionId,
        totalQuestions: questionLanguage,
      },
    };

    if (isCorrect) {
      let pointsIncrement = 0; // Initialize to 0 initially

      if (questionDifficulty === "easy" || questionDifficulty === "Easy") {
        pointsIncrement = 1;
      } else if (
        questionDifficulty === "medium" ||
        questionDifficulty === "Medium"
      ) {
        pointsIncrement = 3;
      } else if (
        questionDifficulty === "hard" ||
        questionDifficulty === "Hard"
      ) {
        pointsIncrement = 5;
      }

      updateQuery.$inc = { PointsScored: pointsIncrement };
    }

    const userUpdated = await User.findOneAndUpdate(
      { UUI: decoded.UUI },
      updateQuery,
      { new: true }
    );

    if (!userUpdated) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    res.status(200).json({ ok: true, user: userUpdated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: "Something went wrong" });
  }
};

module.exports = { addQuestions, getQuestions, answerQuestion };
