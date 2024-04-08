//write the boilerplate code for defining a  schema in mongoose
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const battleSchema = new Schema({
  battleId: {type: String, required: true, unique: true},
  participants: [{type: Schema.Types.ObjectId, ref: 'Users'}],
  numOfQuestions: {
    type: Number,
    required: true,
  },
  questionsAnswered: {
    type: Number,
    default: 0,
  },
  winner: {type: Schema.Types.ObjectId, ref: 'Users'},
  userScores: [{user: {type: Schema.Types.ObjectId, ref: 'Users'}, correctAnswer: Number}],
  challenger: {type: Schema.Types.ObjectId, ref: 'Users'},
  status: {type: String, default: 'Waiting for opponent'},
  createdAt: {type: Date, default: Date.now},
});

const Battle = mongoose.model('Battle', battleSchema);
module.exports = Battle;