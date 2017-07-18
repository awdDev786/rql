var db=require('../config.js');
var Schema = new db.Schema({
    title: { type: String },
    user:{type:db.Schema.Types.ObjectId ,ref:'User'},
    datasource:{type:String},
    config:{type:String},
    roles:{type:Object},
    rqlUsers:[{type:db.Schema.Types.ObjectId ,ref:'rqlUsers'}]
});
module.exports = db.rql.model('project', Schema);
