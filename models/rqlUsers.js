var db=require('../config.js');
var Schema = new db.Schema({
    username: { type: String },
    password:{type:String},
    role:{type:String},
    status:{type:Boolean},
    project_id:{type:db.Schema.Types.ObjectId ,ref:'project'}
});
module.exports = db.rql.model('rqlUsers', Schema);
