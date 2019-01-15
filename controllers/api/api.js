module.exports = function(app, passport){

// Load dependencies
var express = require('express'),
    router = express.Router(),
    http = require('http');

const mongoose = require('mongoose');

// Load models
const User = require('../../models/user');

app.use(passport.authenticate('bearer', { session: false }));

app.get('/api/stations', function(req, res, next) {

	const user = {
		apiKey: req.user.apiKey
	}

	const query = {
		apiKey: user.apiKey
	}

	const options = {
		stations: 1
	}
	
	User.find(query, options)
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

app.get('/api/stations/:stationName', function(req, res, next) {

	var user = {
		apiKey: req.user.apiKey
	}

	const query = {
		apiKey: user.apiKey,
		'stations.stationName': req.params.stationName
	}

	const options = {
		'stations.$': 1
	}
	
	User.findOne(query, options)
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

app.get('/api/stations/:stationName/measures', function(req, res, next) {

	var user = {
		apiKey: req.user.apiKey
	}

	const query = {
		apiKey: user.apiKey,
		'stations.stationName': req.params.stationName
	}

	
	const options = {
		'stations.$.measures': 1,
	}
	
	
	User.findOne(query, options)
	.exec()
	.then(stations => {		
		res.status(200).send(stations)
	})
	.catch(err => {
		console.log(err);
		res.status(400).send(err);
	})

});

app.get('/api/stations/:stationName/measures/temperature', function(req, res, next) {

	var user = {
		apiKey: req.user.apiKey
	}

	const query = {
		apiKey: user.apiKey,
		'stations.stationName': req.params.stationName
	}

	const options = {
		'stations.temperature': 1
	}
	
	User.find(query, options)
	.exec()
	.then(stations => {		
		res.status(200).send(stations)
	})
	.catch(err => {
		console.log(err);
		res.status(400).send(err);
	})

});

app.get('/api/stations/:stationName/measures/humidity', function(req, res, next) {

	var user = {
		apiKey: req.user.apiKey
	}

	const query = {
		apiKey: user.apiKey,
		'stations.stationName': req.params.stationName
	}

	const options = {
		'stations.humidity': 1
	}
	
	User.find(query, options)
	.exec()
	.then(stations => {		
		res.status(200).send(stations)
	})
	.catch(err => {
		console.log(err);
		res.status(400).send(err);
	})

});

app.post('/api/stations', function(req, res, next) {

    var user = {
    	apiKey: req.user.apiKey
    }

	var station = {
		mac: req.body.mac,
		stationName: req.body.stationName
	}

	const query = {
		apiKey: req.user.apiKey	 
	} 

    const elemMatch = {
		stations: { $elemMatch: {$or: [
			{	'stationName': station.stationName},
			{	'mac': station.mac}
			]}	
		}
	}

	User.findOne(query, elemMatch)
	.exec()
	.then(result => {
		if(result.stations.length  > 0) {
			console.log(result)
			res.status(400).send(result);
		} else if(result.stations.length == 0) {
			User.findOneAndUpdate({apiKey: user.apiKey}, {$push: {'stations': station }})
			.exec()
			.then(result =>{
				if(result) {
					res.status(200).send(result)
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

app.post('/api/stations/:stationName/measures', function(req, res, next) {

    var now = new Date()

	const station = {
		mac: req.body.mac,
		stationName: req.params.stationName,
		measures: {
			date: now,
			temperature: req.body.temperature,
			humidity: req.body.humidity
		}
	}

	const query = {
		apiKey: req.user.apiKey
	}

	const elemMatch = {
		stations: { $elemMatch:
			{	'stationName': station.stationName,
				'mac': station.mac
			}
		}
	}

	const setDoc = { 
		$push: {
			'stations.$.measures': station.measures
		}, 
		$set: { 
			'stations.$.lastUpdated': now,
			'stations.$.syncReadings': true,
			'stations.$.firstReadings': true,
			'stations.$.latestTemperature': station.measures.temperature,
			'stations.$.latestHumidity': station.measures.humidity
		}
	}

	User.findOne(query, elemMatch)
	.exec()
	.then(result => {
		console.log(result);
		if(result.stations.length > 0) {
			User.findOneAndUpdate({apiKey: query.apiKey, 'stations.stationName': station.stationName}, setDoc)
			.exec()
			.then(result => {
				res.status(200).send("Updated measures");
			})
			.catch(err =>{
				console.log(err);
				res.status(400).send(err)
			})
		} else if(result.stations.length == 0) {
			res.status(400).send("Station not found!")
		} else {
			res.status(400).send("Some error updating measures")
		}
	})
	.catch(err =>{
		console.log(err);
		res.status(400).send(err)
	})
});

app.post('/api/stations/:stationName/measures/temperature', function(req, res, next) {

    var now = new Date()

	const station = {
		mac: req.body.mac,
		stationName: req.params.stationName,
		temperature: {
			date: now,
			reading: req.body.temperature
		}
	}

	const query = {
		apiKey: req.user.apiKey, 
		'stations.stationName': station.stationName,
		'stations.mac': station.mac 
	}

	const setDoc = { 
		$push: {
			'stations.$.temperature': station.temperature
		}, 
		$set: {
			'stations.$.latestTemperature': station.temperature.reading, 
			'stations.$.lastUpdated': now,
			'stations.$.syncReadings': false,
			'stations.$.firstReadings': true
		}
	}

	User.findOneAndUpdate(query, setDoc)
	.exec()
	.then(result => {
		if(result) {
			res.status(200).send("Updated temperature");
		} else if(!result) {
			res.status(400).send("Station not found!")
		}
	})
	.catch(err =>{
		console.log(err);
		res.status(400).send(err)
	})
});


app.post('/api/stations/:stationName/measures/humidity', function(req, res, next) {

    var now = new Date()

	const station = {
		mac: req.body.mac,
		stationName: req.params.stationName,
		humidity: {
			date: now,
			temperature: req.body.humidity
		}
	}

	const query = {
		apiKey: req.user.apiKey, 
		'stations.stationName': station.stationName,
		'stations.mac': station.mac 
	}

	const setDoc = { 
		$push: {
			'stations.$.humidity': station.temperature
		}, 
		$set: { 
			'stations.$.lastUpdated': now,
			'stations.$.syncReadings': false
		}
	}

	User.findOneAndUpdate(query, setDoc)
	.exec()
	.then(result => {
		if(result) {
			res.status(200).send("Updated humidity");
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
app.delete('/api/stations', function(req,res,next){

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

app.delete('/api/stations/:stationName', function(req,res,next){

	var user = {
    	apiKey: req.user.apiKey
    }

	var station = {
			stationName: req.params.stationName,
	}

	User.update({apiKey: user.apiKey, 'stations.stationName': station.stationName}, {$pull: {stations: {'stationName': station.stationName}}})
	.exec()
	.then(result => {
		console.log(result);
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

