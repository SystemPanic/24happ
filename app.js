var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var mongoose = require('mongoose');
var Promise = require('bluebird');

require("nifty-mongoose-types").loadTypes(mongoose);

global.Models = {};
global.Config = require('./config');
global.Utils = require('./utils');


var appPromise = global.Config.mongooseManager.then(function(result){
    global.Models = result.models;
    var app = express();

    global.Utils.removeNonActiveAccountsTask();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    //app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    //session
    app.use(global.Config.createSession());
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(global.Models.Customers.createStrategy());
    passport.serializeUser(Models.Customers.serializeUser());
    passport.deserializeUser(Models.Customers.deserializeUser());


    app.use(cookieParser(global.Config.sessionDefaults.secret));
    app.use(express.static(path.join(__dirname, 'public')));


    app.use('/customers', require('./routes/customers'));
    app.use('/service', require('./routes/service'));

// catch 404 and forward to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

// error handlers
    app.use(function globalErrorHandler(err, req, res, next){
        if(err){
            if(!res.statusCode || res.statusCode == 200)
                res.status(err.statusCode || 500);
            console.error(err.stack);
            return res.json({error: err.msg});
        }
        if(!res.statusCode)
            res.status(404).end();
    });
    return app;
});



module.exports = appPromise;
