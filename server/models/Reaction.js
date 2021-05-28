const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reactionSchema = Schema(
  {
    body: { type: String, unique: false, default: "" },
    type: ["Like", "Heart", "Care", "Laugh", "Angry", "Sad"],
    owner: {
      ref: "User",
      required: true,
      type: Schema.Types.ObjectId,
    },
    post: {
      ref: "Post",
      required: true,
      type: Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  },
);

const Reaction = mongoose.model("Reaction", reactionSchema);
module.exports = Reaction;
