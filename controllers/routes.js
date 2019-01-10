module.exports = function(app, passport) {

const mongoose = require('mongoose');

// Load models
const User = require('../models/user');

// normal routes ===============================================================
    
    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('./pages/index.ejs', {title: "Home Weather", user: req.user});
    });
    
    app.get('/index.html.var', function(req, res) {
        res.render('./pages/index.ejs', {title: "Home Weather", user: req.user});
    });
					
    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('./pages/profile.ejs', {
            user : req.user,
            title: "Profile page"
        });
    });

    app.get('/stations', isLoggedIn, function(req, res) {
        
        var user = {
        apiKey: req.user.apiKey
        }

        User.findOne({apiKey: user.apiKey})
        .exec()
        .then(stations => {
            console.log(stations)
            res.render('./pages/stations.ejs', {user: req.user, stations: stations.stations, title: "Stations page"});
        })
        .catch(err => {
            console.log(err);
         res.status(500).json({error: err});
        });

    });

    app.get('/stations/:station', isLoggedIn, function(req, res) {
        
        var user = {
        apiKey: req.user.apiKey
        }

        var station = req.params.station

        User.findOne({apiKey: user.apiKey, 'stations.stationName': station }, {'stations.$': 1})
        .exec()
        .then(station => {
            res.render('./pages/station.ejs', {user: req.user, station: station, title: "Stations page"});
        })
        .catch(err => {
            console.log(err);
         res.status(500).json({error: err});
        });

    });

    app.delete('/stations/:station', isLoggedIn, function(req, res) {

        var user = {
        apiKey: req.user.apiKey
        }

        var station = req.params.station
        var redirect = "/stations/"

        User.update({apiKey: user.apiKey, 'stations.stationName': station}, {$pull: {stations: {'stationName': station}}})
        .exec()
        .then(station => {
            console.log(station)
            res.status(200).send(redirect);
        })
        .catch(err => {
         res.send(400);
        });

    });    

    app.delete('/stations/:station/measures', isLoggedIn, function(req, res) {
        
        var user = {
        apiKey: req.user.apiKey
        }

        var station = req.params.station
        var redirect = "/stations/" + station

        User.update({apiKey: user.apiKey, 'stations.stationName': station }, {$unset: {'stations.$.measures': []}}, {multi:true})
        .exec()
        .then(station => {
            res.status(200).send(redirect);
        })
        .catch(err => {
         res.send(400);
        });

    });

    /*
    app.delete('/stations/:station', isLoggedIn, function(req, res) {
        
        var user = {
        apiKey: req.user.apiKey
        }

        var station = req.params.station
        var redirect = "/stations/" + station

        User.update({apiKey: user.apiKey, 'stations.stationName': station }, {$unset: {'stations.$.measures': []}}, {multi:true})
        .exec()
        .then(station => {
            res.status(200).send(redirect);
        })
        .catch(err => {
         res.send(400);
        });

    })
    */


    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('./pages/login.ejs', { message: req.flash('loginMessage'), title: "Login page", user: req.user });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/stations', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('./pages/signup.ejs', { message: req.flash('signupMessage'), title: "Signup page", user: req.user });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['public_profile', 'email'] }));

        // handle the callback after facebook has authenticated the user
        app.get('/auth/facebook/callback',
            passport.authenticate('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

        // handle the callback after twitter has authenticated the user
        app.get('/auth/twitter/callback',
            passport.authenticate('twitter', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));


    // google ---------------------------------

        // send to google to do the authentication
        app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

        // the callback after google has authenticated the user
        app.get('/auth/google/callback',
            passport.authenticate('google', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

    // locally --------------------------------
        app.get('/connect/local', function(req, res) {
            res.render('./pages/connect-local.ejs', { message: req.flash('loginMessage'), title: "Connect Local", user: req.user });
        });
        app.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/connect/facebook', passport.authorize('facebook', { scope : ['public_profile', 'email'] }));

        // handle the callback after facebook has authorized the user
        app.get('/connect/facebook/callback',
            passport.authorize('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

        // handle the callback after twitter has authorized the user
        app.get('/connect/twitter/callback',
            passport.authorize('twitter', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));


    // google ---------------------------------

        // send to google to do the authentication
        app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

        // the callback after google has authorized the user
        app.get('/connect/google/callback',
            passport.authorize('google', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // facebook -------------------------------
    app.get('/unlink/facebook', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // twitter --------------------------------
    app.get('/unlink/twitter', isLoggedIn, function(req, res) {
        var user           = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', isLoggedIn, function(req, res) {
        var user          = req.user;
        user.google.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });


};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
