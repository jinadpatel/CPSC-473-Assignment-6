'use strict';
var express = require('express');
module.exports = function(app) {
	app.get('/', function(req, res) {
		app.use(express.static('public'));
		res.render('index');
	});
};