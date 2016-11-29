var mongoose = require("mongoose");

mongoose.connect('mongodb://localhost/triviaGame');

var triviaGameSchema = new mongoose.Schema({
    question: String,
    answer: String
});


var triviaGameDB = mongoose.model('triviaGame', triviaGameSchema);

module.exports = triviaGameDB;
