var fs = require('fs');
var Promise = require('bluebird');

const maxRequestSize = 16000000;

var Utils = {
	middlewares: {
		requireAuthenticated: function (req, res, next) {
			if (!Utils.isAuthenticated(req)) {
				res.status(403).end();
				return;
			}
			next();
		},
		requireUnauthenticated: function (req, res, next) {
			if (Utils.isAuthenticated(req)) {
				res.status(409).end();
				return;
			}
			next();
		},
		requestSizeRestriction: function (req, res, next) {
			if (req.headers['content-length'] > maxRequestSize) {
				res.status(413).end();
				return;
			}
			next();
		},
		configurableSizeRestriction: function(maxReqSize, req, res, next){
			maxReqSize = maxReqSize | maxRequestSize;
			if (req.headers['content-length'] > maxReqSize) {
				res.status(413).end();
				return;
			}
			next();
		}
	},
	removeNonActiveAccountsTask: function () {
		setInterval(function () {
			var lastDate = new Date();
			lastDate.setDate(lastDate.getDate() - 2);
			global.Models.Customers.remove({lastLoggedIn: {"$lt": lastDate}, active: false}, function (err) {
				if (err)
					console.err('Error removing non active accounts.');
			});
		}, 2 * 24 * 60 * 60 * 1000);
	},
	isAuthenticated: function (req) {
		return req.isAuthenticated == true || req.isAuthenticated();
	},
	__verificationTemplate__: (function () {
		return Promise.all([
			new Promise(function (resolve, reject) {
				fs.readFile('email_templates/registration_email.html', function (err, data) {
					if (err) reject(err);
					resolve(data);
				});
			}),
			new Promise(function (resolve, reject) {
				fs.readFile('email_templates/registration_email.txt', function (err, data) {
					if (err) reject(err);
					resolve(data);
				});
			})
		]).spread(function (dataHtml, dataTxt) {
			return global.Config.smtpClient.templateSender({
				subject: 'Activate your 24h App Account!',
				text: dataTxt,
				html: dataHtml
			}, {
				from: 'email@gmail.com'
			});
		});
	})(),
	sendVerificationMail: function (email, verificationCode) {
		return new Promise(function (resolve, reject) {
			Utils.__verificationTemplate__.then(function (templateSender) {
				templateSender({
					to: email
				}, {
					MAILBANNERURL: 'http://domain.com/img/24happ.png', //TODO
					URL: 'domain.com',
					ACTIVATIONURL: 'http://localhost/service/activate/' + verificationCode
				}, function (err, info) {
					if (err)
						reject(err);
					else
						resolve(info)
				})
			}).caught(reject);
		});
	},
	sendMail: function (options) {
		return new Promise(function (resolve, reject) { //TODO
			global.Config.smtpClient.sendMail(options, function (err, info) {
				if (err) {
					console.error('Error sending mail');
					console.error(err);
					return reject(err);
				}
				console.log('Mail sended to ' + options.to);
				console.log(info);
				resolve(info);
			});
		});
	},
	deleteNullObjectProperties: function (obj) {
	var propNames = Object.getOwnPropertyNames(obj);
	for (var i = 0; i < propNames.length; i++) {
		var propName = propNames[i];
		if (obj[propName] === null || obj[propName] === undefined) {
			delete obj[propName];
		}
	}
}
};

module.exports = Utils;