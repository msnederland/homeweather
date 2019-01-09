module.exports = function(app, passport){

// Load dependencies
var express = require('express'),
    router = express.Router(),
    http = require('http');

const mongoose = require('mongoose');

// Load models
const User = require('../../models/user');

app.use(passport.authenticate('bearer', { session: false }));

app.get('/api/users/stations', function(req, res, next) {

	var user = {
		apiKey: req.user.apiKey
	}
	
	User.findOne({apiKey: user.apiKey})
	.exec()
	.then(stations => {
		console.log(stations);
		res.status(200).send(stations)
	})
	.catch(err => {
		console.log(err);
		res.status(400).send(err);
	})

});

app.get('/api/users/stations/:stationName', function(req, res, next) {

	var user = {
		apiKey: req.user.apiKey
	}
	
	User.find({apiKey: user.apiKey}, {stations: 1})
	.exec()
	.then(stations => {
		console.log(stations);
		res.status(200).send(stations)
	})
	.catch(err => {
		console.log(err);
		res.status(400).send(err);
	})

});

app.get('/api/users/stations/:stationName/measures', function(req, res, next) {

	var user = {
		apiKey: req.user.apiKey
	}
	
	User.find({apiKey: user.apiKey}, {stations: 1})
	.exec()
	.then(stations => {
		console.log(stations);
		res.status(200).send(stations)
	})
	.catch(err => {
		console.log(err);
		res.status(400).send(err);
	})

});

app.post('/api/users/stations', function(req, res, next) {

    var user = {
    	apiKey: req.user.apiKey
    }

	var station = {
		mac: req.body.mac,
		stationName: req.body.stationName
	}

	User.findOne({apiKey: user.apiKey, 'stations.mac': station.mac })
	.exec()
	.then(result => {
		if(result) {
			res.status(400).send("found station, so no way dude!");
		} else if(!result) {
			User.findOneAndUpdate({apiKey: user.apiKey}, {$push: {'stations': station }})
			.exec()
			.then(result =>{
				if(result) {
					res.status(200).send("no station found, soo ok... I'l add it!")
				} else if(!result) {
					res.status(400).send("API Key invalid")
				}
			})
			.catch(err =>{
				console.log(err);
			res.status(400).send(err)
			})
		}
	})
	.catch(err =>{
		console.log(err);
		res.status(400).send(err)
	})
});

app.post('/api/users/stations/:stationName/measures', function(req, res, next) {

    var user = {
    	apiKey: req.user.apiKey
    }

	var station = {
			mac: req.body.mac,
			stationName: req.params.stationName,
			measures: req.body.measures,
			temperature: req.body.measures.temperature,
			humidity: req.body.measures.humidity
	}

	User.findOneAndUpdate({apiKey: user.apiKey, 'stations.stationName': station.stationName }, {$push: {'stations.$.measures': station.measures  }, $set: {'stations.$.temperature': station.temperature, 'stations.$.humidity': station.humidity}})
	.exec()
	.then(result => {
		if(result) {
			res.status(200).send("Updated measures");
		} else if(!result) {
			res.status(400).send("Station not found!")
		}
	})
	.catch(err =>{
		console.log(err);
		res.status(400).send(err)
	})
});

// DELETE requests
app.delete('/api/users/stations', function(req,res,next){

	var user = {
    	apiKey: req.user.apiKey
    }

	User.update({apiKey: user.apiKey}, {$unset: {'stations': []}}, {multi:true})
	.exec()
	.then(result => {
		if(result) {
			res.status(200).send(result);
		} else if(!result) {
			res.status(204).send("204 No Content")
		}
	})
	.catch(err =>{
		res.status(500).send("500 Internal Server Error")
	})

})

app.delete('/api/users/stations/:stationName', function(req,res,next){

	var user = {
    	apiKey: req.user.apiKey
    }

	var station = {
			stationName: req.params.stationName,
	}

	User.update({'stations.stationName': station.stationName, apiKey: user.apiKey}, {$pull: {stations: {'stationName': station.stationName}}})
	.exec()
	.then(result => {
		if(result) {
			res.status(200).send(result);
		} else if(!result) {
			res.status(204).send("204 No Content")
		}
	})
	.catch(err =>{
		res.status(500).send("500 Internal Server Error")
	})

})

};

