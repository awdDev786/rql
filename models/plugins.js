var db=require('../config.js');
var Schema = new db.Schema({
    title: { type: String },
    code:{type:String}
});
module.exports = db.rql.model('Plugins', Schema);
