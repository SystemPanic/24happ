var express = require('express');
var router = express.Router();
var passport = require('passport');
var formidable = require('formidable');
var fs = require('fs');

const maxPictureSize = 1024 * 1024 * 2;

router.route('/signup').post(function registerUser(req, res, next){

    var user = new global.Models.Customers({
        user: req.body.user,
        email : req.body.email,
        name: req.body.name,
        surname: req.body.surname,
        phoneNumber: req.body.phoneNumber
    });


    global.Models.Customers.register(user, req.body.password, function(err, user) {
        if (err || !user) {
            console.error(err);
            res.status(500).send({status:500, message: 'Register failed.', type:'internal'});
        }
        global.Utils.sendVerificationMail(user.email, user.verifCode).then(function(info){
            console.log(info);
            res.json({ok: true});
        }).caught(function(err){
            if(err)
                console.error(err.stack);
            res.status(500).send({status:500, message: 'Error verifying email.', type:'internal'});
        });
    });
});

router.route('/signin').post(global.Utils.middlewares.requireUnauthenticated, passport.authenticate('local'), function(req, res, next){
    if(global.Utils.isAuthenticated(req)){
        res.json({ok: true});
    }else{
        res.status(500).send({status:500, message: 'Error signin.', type:'internal'});
    }
});

router.route('/logout').get(global.Utils.middlewares.requireAuthenticated, function(req, res, next){
   if(req.session){
       req.session.destroy(function(err){
           res.status(200).end();
       });
   }
});

router.route('/machine').post(global.Utils.middlewares.requireAuthenticated, function(req, res, next){
	var machine = new global.Models.Machines({
		name: req.body.name,
		type: req.body.type,
		features: req.body.features,
		productTypes: req.body.productTypes,
		phoneNumber: req.body.phoneNumber,
		dir: req.body.dir,
		loc: {
			coordinates:req.body.loc.coordinates
		},
		location: {
			continentCode: req.body.location.continentCode,
			countryCode: req.body.location.countryCode,
			city: req.body.location.city,
			pc: req.body.location.pc
		},
		comments: [],
		reports: [],
		customer: req.user._id
	});

	machine.save(function(err){
		if(err)
			return res.status(500).send({status:500, message: 'Error saving machine to database', type:'internal'});
		else
			return res.status(200).end();
	});
});

router.route('/machinePicture/:machineID')
	.put(global.Utils.middlewares.requireAuthenticated, global.Utils.middlewares.configurableSizeRestriction.bind(null, maxPictureSize), function (req, res, next) {
		var form = new formidable.IncomingForm();
		form.uploadDir = __dirname + '/../public/uploads';
		form.keepExtensions = true;
		form.parse(req, function(err, fields, files) {
			if (err)
				return res.status(500).send({status:500, message: 'Error uploading file', type:'internal'});

			var path = files.file.path.substring(files.file.path.indexOf('uploads'));
			global.Models.Machines.findOneAndUpdate({'_id': req.params.machineID, 'customer': req.user._id}, {$set:{photo: path}}, {new: false}, function(err, oldMachine){
				if(err || !oldMachine) {
					fs.unlink(files.file.path);
					return res.status(500).send({status: 500, message: 'Error saving file to machine', type: 'internal'});
				}
				if(oldMachine.photo)
					fs.unlink(__dirname + '/../public/' + oldMachine.photo);
				res.status(200).end();
			});
		});
		form.parse(req);
	})
	.delete(global.Utils.middlewares.requireAuthenticated, function (req, res, next) {
		global.Models.Machines.findOneAndUpdate({'_id': req.params.machineID, 'customer': req.user._id}, {$unset:{photo: ""}}, function(err, modifiedMachine){
			if(err)
				return res.status(500).send({status:500, message: 'Server internal error while updating database', type:'internal'});
			else if (!modifiedMachine)
				return res.status(400).send({status:400, message: 'Machine not found or customer is not owner', type:'client'});
			res.status(200).end();
		});
	});

//check_out Verificar
router.route('/machine/:machineID')
    //Delete
    .delete(global.Utils.middlewares.requireAuthenticated, function(req, res, next){
        global.Models.Machines.findOneAndRemove({'_id': req.params.machineID, 'customer': req.user._id}, function (err, machine) {
            if(err)
            	return res.status(500).send({status:500, message: 'Server internal error while querying database', type:'internal'});
        	else if (!machine)
				return res.status(400).send({status:400, message: 'Machine not found or customer is not owner', type:'client'});
			res.status(200).end();
        });

    })
    //Edit
    .put(global.Utils.middlewares.requireAuthenticated, function(req, res, next){
        //Check if edit would happen on editable fields.
		var machine = {
			name: req.body.name,
			type: req.body.type,
			features: req.body.features,
			productTypes: req.body.productTypes,
			phoneNumber: req.body.phoneNumber,
			dir: req.body.dir,
			loc: {
				coordinates:req.body.loc.coordinates
			}
		};

		global.Utils.deleteNullObjectProperties(machine);

		//Perform update by finding machine and checking if the owner is the person logged in.
		global.Models.Machines.updateOne({'_id': req.params.machineID, customer: req.user._id}, {$set:machine}, function(err, updatedMachine){
			if(err)
				return res.status(500).send({status:500, message: 'Server internal error while querying database', type:'internal'});
			if(!updatedMachine)
				return res.status(400).send({status:400, message: 'Machine not found or customer is not owner', type:'client'});
		});
    });

//Get a JSON list of all the customer's machines
router.route('/machines').get(global.Utils.middlewares.requireAuthenticated, function(req, res, next){
	global.Models.Machines.find({'customer': req.user._id}, function(err, result){
		if(err)
			return res.status(500).send({status: 500, message: 'Error while querying to database. Try again', type: 'internal'});
		return res.status(200).send(result);
	});
});

module.exports = router;