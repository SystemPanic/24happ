var modelName = 'Machines';

var Model = {
    dependsOn: ['Reports', 'Customers'],
    loadModel: function (mongoose) {
        var modelSchema = mongoose.Schema({
            name: { type: String, required: true },

            type: { type: Number, required: true },
            features: { type: [Number], required: true },
            productTypes: { type: [Number], required: true },
            phoneNumber: {
                type: String,
                validate: {
                    validator: function(v) {
                        return /^\+?[0-9]{9,20}$/.test(v);
                    },
                    message: '{VALUE} is not a valid phone number!'
                },
                required: true
            },
            photo: { type: String },

            dir: { type: String, required: true },
            loc: {
                type: { type: String, required: true, default: "Point"},
                coordinates: { type:[Number], required: true}
            },
            location: {
                continentCode: { type: String, required: true },
                countryCode: { type: String, required: true },
                city: { type: String, required: true },
                pc: { type: Number, required: true }
            },
            lastUpdated: { type: Date, required: true, default: Date.now },
            comments: { type: Array },
            reports: { type: [mongoose.model('Reports').schema] },
            validated: { type: Boolean, required: true, default: false },
            customer: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Customers' }
        }, { collection: modelName });

        modelSchema.index({loc: "2dsphere"});
        modelSchema.index({features: 1});
        modelSchema.index({productTypes: 1});
        modelSchema.index({type: 1});
        modelSchema.index({author: 1});

        modelSchema.statics.findByFilters = function(filters, callback){
            var query;
            if(filters.polygon) {

                query = this.find().where('loc').whithin(filters.polygon);

                if(filters.features && filters.features.length > 0){
                    query = query.where('features').in(filters.features);
                }

                if(filters.productTypes && filters.productTypes.length > 0){
                    query = query.where('productTypes').in(filters.productTypes);
                }

                if(filters.type){
                    query = query.where('type').equals(filters.type);
                }

                query.exec(callback);

            }else{
                callback(new Error('Invalid filters'));
            }
        };

        return mongoose.model(modelName, modelSchema);
    }
};

module.exports = Model;