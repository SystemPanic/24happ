var modelName = 'Reports';

var Model = {
    dependsOn: [],
    loadModel: function (mongoose) {
        var modelSchema = mongoose.Schema({
            user: { type: String, required: true }, //The name of user that makes the report (not registered)
            message: { type: String, required: true},
            email: { type: mongoose.SchemaTypes.Email }, //Not required
            date: { type: Date, required: true, default: Date.now },
            type: { type: Number, required: true}
        }, { collection: modelName });

        return mongoose.model(modelName, modelSchema);
    }
};

module.exports = Model;