const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
// const { ObjectId: ProjectID } = mongoose.SchemaTypes;

const teamUpMentor = new mongoose.Schema({
    name: { type: String },
    email: { type: String, lowercase: true },
    password: { type: String },
    contact: { type: String },
    designation: { type: String },
    avatarURL: { type: String },
    projects: [{ type: mongoose.SchemaTypes.ObjectId }],

    creationTime: { type: Number, default: Date.now() },
    lastUpdated: { type: Number, default: Date.now() },
});

teamUpMentor.pre("save", function save(next) {
    const mentor = this;
    mentor.lastUpdated = Date.now();
    next();
});

teamUpMentor.pre("updateOne", function updateOne(next) {
    const mentor = this;
    mentor.lastUpdated = Date.now();
    next();
});

module.exports = mongoose.model("teamUpMentors", teamUpMentor);
