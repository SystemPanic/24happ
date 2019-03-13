var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
/* GET search listing. */
router.post('/search', function(req, res, next) {
    var filters = req.body;
    global.Models.Machines.findByFilters(filters, function cb(err, data){
        if(err){
            res.status(500).send({status:500, message: err.msg, type:'internal'});
        }else{
            res.json(data);
        }
    });
});

router.get('/controlPanel', global.Utils.middlewares.requireAuthenticated, function(req, res, next){
    res.json({ok: true});
});

router.get('/activate/:verificationCode', function(req, res, next) {
    if(!req.params.verificationCode)
        res.status(500).send({status:500, message: err.msg, type:'internal'});
    else{
        global.Models.Customers.update({active: false, verifCode: req.params.verificationCode}, {active: true}, {upsert: false}, function(err, updatedCount){
            if(err){
                return res.status(500).send({status:500, message: err.msg, type:'internal'});
            }
            if(updatedCount.n == 0){
                return res.status(404).send({status:404, message: err.msg, type:'internal'});
            }
            res.redirect('/signin.html?activation=1');
        });
    }
});

router.post('/comment/:machineID', global.Utils.middlewares.requestSizeRestriction , function(req, res, next){
    var machineID = req.params.machineID;
    if(req.body.alias && req.body.message && machineID){
        var comment = {
            alias: req.body.alias,
            message: req.body.message,
            date: Date.now()
        };

        global.Models.Machines.update({_id: mongoose.Types.ObjectId(machineID)}, {$push: {'comments': comment}}).then(function(err, raw){
            if(err)
                return res.status(500).send({status:500, message: err.msg, type:'internal'});
            res.json({ok : true});
        });
    }else{
        res.status(400).send({status: 400, message: "Content error"});
    }

    //TODO: Save adding date, comment number (e.g.: #56 I think like you, #17 I do not) (autoincrements) and author

});

router.post('/report/comment', function(){
    //JSON Object that contains related comment/machine and a comment.

    //TODO: Check
    //If there are both, comment and machine fields, then it's about a comment, if not, it is about machine.

    //TODO: Save to DB.
});

router.post('/report/machine', function(){
    //JSON Object that contains related comment/machine and a comment.

    //TODO: Check
    //If there are both, comment and machine fields, then it's about a comment, if not, it is about machine.

    //TODO: Save to DB.
});

//FUTURE Like comments
//router.post('/like', function(req, res, next){
    //JSON Object that contains ObjectID of the Machine, comment id that refers to


    //TODO: Check if cookies has already liked.

    //TODO: If user did not liked yet, the field "likes" of the comments gets incremented and its username added to the array of the field "likedBy"
//});



module.exports = router;
