var db=require('../config.js');
var Schema = new db.Schema({
    text: { type: String },
    project_id:{type:db.Schema.Types.ObjectId ,ref:'project'}
});
module.exports = db.rql.model('schemaModel', Schema);
