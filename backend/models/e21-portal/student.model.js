const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    name: String,
    class: Number,
    phone: String,
    schoolName: String,
    schoolCity: String,
    schoolState: String,
    email: { type: String, unique: true },

    creationTime: { type: Number, default: Date.now() },
    lastUpdated: { type: Number, default: Date.now() },
});

studentSchema.pre("save", function save(next) {
    const team = this;
    team.lastUpdated = Date.now();
    next();
});

studentSchema.pre("updateOne", function updateOne(next) {
    const team = this;
    team.lastUpdated = Date.now();
    next();
});

module.exports = mongoose.model("e21-students", studentSchema);
