const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
    teamName: { type: String },

    email: { type: String, unique: true },
    password: String,

    leaderID: mongoose.SchemaTypes.ObjectId,
    teamMemberIDs: [mongoose.SchemaTypes.ObjectId],

    creationTime: { type: Number, default: Date.now() },
    lastUpdated: { type: Number, default: Date.now() },
});

teamSchema.pre("save", function save(next) {
    const team = this;
    team.lastUpdated = Date.now();
    next();
});

teamSchema.pre("updateOne", function updateOne(next) {
    const team = this;
    team.lastUpdated = Date.now();
    next();
});

module.exports = mongoose.model("e21-teams", teamSchema);
