const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
  language: {
    type: String,
    required: true,
  },
  type: {
    type: String,
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
  },
  questionText: {
    type: String,
    required: true,
  },
  correctAnswer: {
    type: String,
    required: true,
  },
  incorrectAnswers: [
    {
      type: String,
      required: true,
    },
  ],
});

const QuestionModel = mongoose.model("Question", QuestionSchema);

module.exports = QuestionModel;
