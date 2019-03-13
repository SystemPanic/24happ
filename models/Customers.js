var modelName = 'Customers';
var passportLocalMongoose = require('passport-local-mongoose');
var uid = require('node-uuid');
var Model = {
    dependsOn: [],
    loadModel: function (mongoose) {
        var modelSchema = mongoose.Schema({
            user: { type: String, required: true },
            lastLoggedIn: { type: Date, required: true, default: Date.now },
            name: { type: String, required: true },
            surname: { type: String, required: true },
            phoneNumber: {
                type: String,
                validate: {
                    validator: function(v) {
                        return /^\+?[0-9]{9,20}$/.test(v);
                    },
                    message: '{VALUE} is not a valid phone number!'
                }
            },
            email: { type: mongoose.SchemaTypes.Email, required: true },
            active: { type: Boolean, required: true, default: false },
            verifCode: { type: String, unique: true, required: true, default: uid.v4 },
        }, { collection: modelName });


        modelSchema.index({user: 1, password: 1});
        modelSchema.index({email: 1, password: 1});

        modelSchema.plugin(passportLocalMongoose, {
            usernameField: 'user',
            selectFields: '_id user email name surname active salt hash',
            lastLoginField: 'lastLoggedIn'
        });

        /*overrides passport-local-mongoose to check active users*/
        modelSchema.statics.authenticate = function(){
            var self = this;
            return function(username, password, cb) {
                self.findByUsername(username, function(err, user) {
                    if (err)
                        return cb(err);
                    if(!user)
                        return cb(null, false, { message: 'Incorrect username'});
                    //check user is active
                    var _user = user.toObject();
                    if(!_user.active)
                        return cb(null, false, { message: 'Inactive user'})
                    return user.authenticate(password, cb);
                });
            };
        };

        return mongoose.model(modelName, modelSchema);
    }
};

module.exports = Model;