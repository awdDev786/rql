var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.rql = mongoose.createConnection('mongodb://localhost/RQL');
mongoose.gql = mongoose.createConnection('mongodb://localhost/graphql');
module.exports = mongoose;
