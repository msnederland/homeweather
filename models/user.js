// Load dependencies
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var uniqueValidator = require('mongoose-unique-validator');

// Define station schema
const stationSchema = new mongoose.Schema({
    mac: {type: String, required: true, index: {unique: true}},
    stationName: {type: String, required: true, index: {unique: true}},
    syncReadings: Boolean,
    firstReadings: {type: Boolean, default: false},
    latestTemperature: Number,
    latestHumidity: Number,
    temperature: [{
        date: Date,
        reading: {type: Number, default: ""},
        humidity: Number
    }],
    humidity:[{
        date: Date,
        reading: {type: Number, default: ""},
        humidity: Number
    }],
    measures: [{
        date: Date,
        temperature: Number,
        humidity: Number
    }],
    lastUpdated: Date
});

// Define user schema
var userSchema = mongoose.Schema({

    local            : {
        email        : String,
        password     : String
    },
    facebook         : {
        id           : String,
        token        : String,
        name         : String,
        email        : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    apiKey: String,
    stations : [stationSchema]

},  {
        usePushEach: true 
    }
);


// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
