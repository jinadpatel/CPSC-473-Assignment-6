/*{
    "node": true,
    "camelcase": true,
    "indent": 4,
    "undef": true,
    "quotmark": "single",
    "maxlen": 80,
    "trailing": true
    "curly": true,
    "eqeqeq": true,
    "forin": true,
    "immed": true,
    "latedef": true,
    "newcap": true,
    "nonew": true,
    "unused": true,
    "strict": true
}*/

var express = require('express'),
	app = express(),
	http = require('http').Server(app),
	parser = require("body-parser"),
	MongoClient = require('mongodb').MongoClient,
	redis = require('redis'),
	mongoose = require('mongoose'),
	client = redis.createClient(),
	assert = require('assert'),
	io = require('socket.io')(http);
client.set("right", 0);
client.set("wrong", 0);
var jsonParser = parser.json({
	type: 'application/json'
});
var router = express.Router();
app.use(parser.urlencoded({
	extended: true
}));
app.use(parser.json());
app.use("/", express.static("views"));
var url = 'mongodb://localhost/triviaGame';
mongoose.connect(url);
mongoose.set('debug', true);
var triviaSchema = new mongoose.Schema({
	question: String,
	answer: String
});
var collectionName = 'questionBank';
var triviaDB = mongoose.model('triviaGame', triviaSchema, collectionName);
var connectionArr = [];
var userNameArr = [];
io.sockets.on('connection', function(socket) {
	connectionArr.push(socket);
	console.log(connectionArr.length + 'sockets connected');
	socket.on('play', function(name) {
		console.log(name);
		userNameArr.push(name);
		console.log(name + ' is connected');
		io.sockets.emit('play', name);
	});
	socket.on('score', function(data) {
		console.log("Inside score...")
		console.log(data.questionId);
		console.log(data.givenAns);
		var user = data.currentUser;
		console.log(user);
		var flag;
		var possible = data.givenAns;
		var id = data.questionId;
		var actual = data.actualAns;
		var correct;
		if (actual == possible) {
			flag = 1;
			client.incr("right", function(err, reply) {});
		}
		if (actual != possible) {
			flag = 0;
			client.incr("wrong", function(err, reply) {});
		}
		var Right;
		var Wrong;
		client.get("right", function(err, reply) {
			Right = reply;
			console.log("Right : " + Right);
			client.get("wrong", function(err, reply) {
				Wrong = reply;
				console.log("Wrong : " + Wrong);
				var data = {
					"right": Right,
					"wrong": Wrong,
					"flag": flag
				};
				io.sockets.emit('score', data);
			});
		});
	});
	getQuestion = function(question) {
		io.sockets.emit('newQue', question);
		console.log('inside getQuestion.....');
	}
	socket.on('disconnect', function(data) {
		connectionArr.pop(socket);
		console.log(connectionArr.length + 'sockets disconnected');
	});
});
app.get('/question', function(req, res) {
	var totalQue;
	triviaDB.find({}, '_id question answer', function(err, documents) {
		if (err) {
			console.log('error' + err);
			res.json({
				message: err
			});
		} else {
			var randomQuestion = documents[Math.floor(Math.random() * documents.length)];
			console.log(randomQuestion);
			res.json({
				newQuestion: randomQuestion
			});
			getQuestion(randomQuestion);
		}
	});
});
app.post('/question', function(req, res) {
	var question = req.body.question;
	var answer = req.body.answer;
	var insertDocument = function(db, callback) {
		db.collection('questionBank').insert({
			"question": question,
			"answer": answer
		});
		var data = db.collection('questionBank').find().toArray(function(err, documents) {
			var randomQuestion = documents[Math.floor(Math.random() * documents.length)];
			console.log(randomQuestion);
			res.json({
				newQuestion: randomQuestion
			});
			getQuestion(randomQuestion);
		});
	};
	// For assert we refered to: 
	//1. http://stackoverflow.com/questions/28129223/node-js-assert-module-in-mongodb-driver-documentation
	//2. https://libraries.io/npm/mongodb/2.0.24 	
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		insertDocument(db, function() {
			db.close();
		});
	});
});
require('./routes/index')(app);
http.listen(3000, function() {
	console.log('server is listening on port 3000');
});