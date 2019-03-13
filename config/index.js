var uid = require('node-uuid'),
    Promise = require('bluebird'),
    fs = require('fs'),
    path = require('path'),
    underscore = require('underscore');

var resolveEnvPath = function(configPath){
    if(/^(\.|\.\.)/.test(configPath))
        return path.join(path.dirname(require.main.filename), configPath);
    if(/^\$/.test(configPath))
        return process.env[configPath.substring(1)];
    return configPath;
};

var _mongooseManager = (function(){
    return require('mongoose-model-manager').init({
        mongoConnectionUrl: 'mongodb://localhost/24h',
        modelsPath: path.resolve(__dirname, '../models'),
        mongoOptions: {}
    })
})();

var _smtpClient = (function(){
    var smtpTransportPool = require('nodemailer-smtp-pool'),
        nodeMailer = require('nodemailer'),
        tranporter = nodeMailer.createTransport(smtpTransportPool({
            port: 465, //SSL
            host: 'smtp.gmail.com',
            connectionTimeout: 60*1000, //1 minute smtp connection timeout
            socketTimeout: 60*60*1000, //1 hour smtp socket timeout (inactivity)
            secure: true,
            name: 'domain.com', //for smtp server know who is the smtp client (optional)
            auth:{
                user: 'email@gmail.com',
                pass: 'gmailpass'
            },
            maxMessages: Infinity,
            maxConnections: 10,
            debug: false,
            tls:{
                rejectUnauthorized: true //ensure smtp certificate is valid for host
            }
        }));
    return tranporter;
})();


var _sessionDefaults = {
    secret: 'mXxqXRD3RebC2Nn',
    name: '24hk',
    cookie: {
        path: '/',
        httpOnly: false,
        secure: false,
        maxAge: 1000*60*60*3 //3 hours session timeout, each request will refresh 3 hours more (req.session.touch() auto called by express at the end of the request)
    },
    resave: false, //if nothing changes, no save to redis, increase performance
    saveUninitialized: false //if nothing stored, no save to redis, increase performance
};


var Config = {
    host: process.env.IP || '0.0.0.0',
    port: process.env.PORT || 443,
    mongooseManager: _mongooseManager,
    smtpClient: _smtpClient,
    staticCache: {
        maxAge: 86400000, /*Cache for static content, default 1 day*/
        setHeaders: function setHeaders(res, path){
            //static content headers
            res.setHeader('Cache-Control', 'private, must-revalidate, max-age=86400');
        }
    },
    sessionDefaults: _sessionDefaults,
    createSession: function(sessionOptions){
        var session = require('express-session');
        return session(underscore.extend(_sessionDefaults, sessionOptions || {}));
    }
};

module.exports = Config;