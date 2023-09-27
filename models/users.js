const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    UUI: {
      type: String,
      required: true,
      unique: true,
    },
    Name: {
      type: String,
      required: false,
      unique: false,
      default: "Anonymous",
    },
    Email: {
      type: String,
      required: true,
      unique: true,
    },
    Password: {
      type: String,
      required: true,
    },
    languageToLearn: {
      type: String,
      required: true,
      default: "English",
    },
    languageFamiliarity: {
      type: String,
      enum: ["beginner", "intermediate", "expert"],
      default: "beginner",
    },
    AttemptedQuestions: {
      type: [String],
      default: [],
    }
    ,
    totalQuestions: {
      type: [String],
      default: [],
    },
    PointsScored: {
      type: Number,
      default: 0,
    }
  },
  { strictQuery: false }
);

const Users = mongoose.model("Users", UserSchema);
module.exports = Users;
