/*Final Schema*/
const fs = require('fs-extra')
const mkdirp = require("mkdirp");
const path = require('path');
const _ = require('lodash');
const async=require('async');
module.exports = {
    schema: function getSchema(Entity, attributes, otm, mtm, url, roles, u, next1) {
        var role = [];
        var otherroles = [];
        if(roles && roles.length>0){
        for (var i = 0; i < roles[Entity].length; i++) {
            if (roles[Entity][i]['_roles']) {
                role.push(roles[Entity][i]['_roles']);
            }
        }
    }
        //if we have roles defined against this entity
        if (role.length > 0) {
            //role based implementation
            var a = 0;
            function loop(a) {
                //if current role is in roles list and checking if role assigned to project or not
                if (a < role.length) {
                    var ind = Object.keys(role[a]).indexOf(u); //getting current role's rights ignoring others
                    if (ind !== -1 && fs.existsSync("./" + url + "/" + u)) {
                        var rights = role[a][u]; //curent role's rights
                        if (Object.keys(rights).length > 0) {
                            getRights(rights, attributes, function(c, r, u, d) {
                                getCustomTypes(c, r, u, d, function(resp) {
                                    if (a == role.length - 1) {
                                        next1(1)
                                    } else {
                                        a = a + 1;
                                        loop(a);
                                    }
                                })
                            });
                        } else {
                            getTypes(attributes, function(response) {
                                if (response == 1) {
                                    a = a + 1;
                                    loop(a);
                                } else {
                                    next1(0)
                                }
                            });
                        }
                    }                
             else {
                if (ind == -1 && fs.existsSync("./" + url + "/" + u)) {
                    getTypes(attributes, function(response) {
                        if (response == 1) {
                            a = a + 1;
                            loop(a);
                        } else {
                            console.log("error in rights");
                            next1(0)
                        }
                    });
                } else {
                    next1({ message: "Role '" + u + "' Not Exists in Project.Add to proceed" })
                }
            }
            if (a == role.length - 1) {} else {
                a = a + 1;
                loop(a);
            }
        } else {
            next1(1)
        }
    }
    loop(a)
}
else {
    getTypes(attributes, function(response) {
        if (response == 1) {
            next1(1)
        } else(
            next1(0))
    });
}

function getSch(gqm_types, gq_types, gqu_types, gqd_types,gqarg_types, next3) {

    var relation_links = "";
    var query_fields = "";
    var populations = "";
    var resolver_function = "";
    var argument = "";
    var upargs="";
    var links = "var graphql=require('graphql')" + "\n" +
        "var " + Entity + "Type=require('../Queries/" + Entity + "Type')" + "\n" +
        "var " + Entity + "Model=require('../../Models/" + Entity + "')" + "\n" +
        "var async=require('async');" + "\n";

    /*One To Many*/
    if (otm[Entity]) {
        _.forEach(otm[Entity], function(value, key) {
            relation_links = relation_links + "var " + value + "Type" + "=require('./" + value + "Type.js')" + "\n";
            gq_types = gq_types + value + ":{type:new graphql.GraphQLList(" + value + "Type." + value + "Type)}," + "\n";
            gqm_types = gqm_types + value + ":{type:new graphql.GraphQLList(" + value + "Type." + value + "InputType)}," + "\n";
            populations = populations + "populate('" + value + "')." + "\n";
            resolver_function = resolver_function + value + ": function(callback) {" + value + "Type.resolver.create(args." + value + ").then(function(res){return res;}).then(function(res){callback(null, res);})}," + "\n";
            argument = argument + "(!results." + value + "||results." + value + ".length==0)?delete args['" + value + "']:args." + value + "=results." + value +";"+ "\n";
            upargs=upargs+value+"Model.findOne({_id:args."+value+"}).exec(function(err,record){if(!err){record."+Entity+".push(model._id);record.save()}});"+"\n";
            links = links + "var " + value + "Type=require('../Queries/" + value + "Type')" + "\n";
            links = links + "var " + value + "Model=require('../../Models/" + value + "')" + "\n";

        });
    }
    /*Many To Many*/
    if (mtm) {
        _.forEach(mtm, function(val, key) {
            var index = val.indexOf(Entity);
            if (index !== -1) {
                var value = (index == 0) ? val[1] : val[0];
                relation_links = relation_links + "var " + value + "Type" + "=require('./" + value + "Type.js')" + "\n";
                gq_types = gq_types + value + ":{type:new graphql.GraphQLList(" + value + "Type." + value + "Type)}," + "\n";
                gqm_types = gqm_types + value + ":{type:new graphql.GraphQLList(" + value + "Type." + value + "InputType)}," + "\n";
                populations = populations + "populate('" + value + "').";
                resolver_function = resolver_function + value + ": function(callback) {" + value + "Type.resolver.create(args." + value + ").then(function(res){return res;}).then(function(res){callback(null, res);})}," + "\n";
                argument = argument + "(!results." + value + "||results." + value + ".length==0)?delete args['" + value + "']:args." + value + "=results." + value + "\n";
                upargs=upargs+value+"Model.findOne({_id:args."+value+"}).exec(function(err,record){if(!err){record."+Entity+".push(model._id);record.save()}})"+"\n";
            
                links = links + "var " + value + "Type=require('../Queries/" + value + "Type')" + "\n";
                links = links + "var " + value + "Model=require('../../Models/" + value + "')" + "\n";

            }
        });
    }
    /*Check for 2 way association {teacher:['office']}*/
    _.forEach(Object.keys(otm), function(o, key) {
        _.forEach(otm[o], function(c, k) {
            if (c == Entity) {
                gq_types = gq_types + o + ":{type:" + o + "Type." + o + "Type}," + "\n";
                gqm_types = gqm_types + o + ":{type:" + o + "Type." + o + "InputType}," + "\n";
                relation_links = relation_links + "var " + o + "Type" + "=require('./" + o + "Type.js')" + "\n";
                populations = populations + "populate('" + o + "').";
                resolver_function = resolver_function + o + ": function(callback) {" + o + "Type.resolver.create(args." + o + ").then(function(res){return res;}).then(function(res){callback(null, res);})}," + "\n";
                argument = argument + "(!results." + o + "||results." + o + ".length==0)?delete args['" + o + "']:args." + o + "=results." + o + "\n";
                upargs=upargs+o+"Model.findOne({_id:args."+o+"}).exec(function(err,record){if(!err){record."+Entity+".push(model._id);record.save()}})"+"\n";
            
                links = links + "var " + o + "Type=require('../Queries/" + o + "Type')" + "\n";
                links = links + "var " + o + "Model=require('../../Models/" + o + "')" + "\n";

            }
        })
    })

    /*user query fields(e.g users,user,link)*/
    query_fields = query_fields + "const " + Entity + "Fields={" + "\n" +
        "link:{" + "\n" +
        "type: ConType," + "\n" +
        "resolve: () => entity" + "\n" +
        "}," + "\n" +
        Entity + "s :{" + "\n" +
        "type: new graphql.GraphQLList(" + Entity + "Type)," + "\n" +
        "resolve: () => {" + "\n" +
        "return new Promise((resolve, reject) => {" + "\n" +
        Entity + "Model.find()." +
        populations + "\n" +
        "exec((err, models) => {" + "\n" +
        "if (err) {reject(err);}" + "\n" +
        "else {" + "\n" +
        "resolve(models);" + "\n" +
        "};" + "\n" +

        "});" + "\n" +
        "});" + "\n" +
        "}" + "\n" +
        "}," + "\n" +
        Entity + " :{" + "\n" +
        "type:new graphql.GraphQLList(" + Entity + "Type)," + "\n" +
        "args:{" + "\n" +
        "id:{type: graphql.GraphQLID}," + "\n" +
        "offset:{type: graphql.GraphQLInt}," + "\n" +
        "limit:{type: graphql.GraphQLInt}," + "\n" +
        gqarg_types + "\n" +
        "}," + "\n" +
        "resolve: (obj,args) => {" + "\n" +
        "return new Promise((resolve, reject) => {" + "\n" +
        "var sort = args.sort ? args.sort : '';" + "\n" +
            "delete args['sort'];" + "\n" +
            "var offset = args.offset ? args.offset : '';" + "\n" +
            "delete args['offset'];" + "\n" +
            "var limit = args.limit ? args.limit : '';" + "\n" +
            "delete args['limit'];" + "\n" +

        Entity + "Model.find(args)" + "\n" +
        ".sort(sort)"+ "\n" +
                ".skip(offset)"+ "\n" +
                ".limit(limit)"+ "\n" +
        populations + "\n" +
        "exec((err, model) => {" + "\n" +
        "if (err) {reject(err);}" + "\n" +
        "else {" + "\n" +
        "resolve(model);" + "\n" +
        "};" + "\n" +

        "});" + "\n" +
        "});" + "\n" +
        "}" + "\n" +
        "}" + "\n" +
        "}" + "\n";
    /*Connection Query Code*/
    var connection_Query = "class Entity {}" + "\n" +
        "let entity = new Entity();" + "\n" +
        "let nodeDefs = nodeDefinitions(" + "\n" +
        "(globalId) => {" + "\n" +
        "let {type} = fromGlobalId(globalId);" + "\n" +
        "if (type === 'Entity') {" + "\n" +
        "return entity" + "\n" +
        "}" + "\n" +
        "return null;" + "\n" +
        "}," + "\n" +
        "(obj) => {" + "\n" +
        "if (obj instanceof Entity) {" + "\n" +
        "return " + Entity + "Type;" + "\n" +
        "}" + "\n" +
        "return null;" + "\n" +
        "}" + "\n" +
        ");" + "\n" +
        "let Connection = connectionDefinitions({" + "\n" +
        "name: '" + Entity + "Connection'," + "\n" +
        "nodeType: " + Entity + "Type" + "\n" +
        "});" + "\n" +
        /*Using that connection type to format data according to connections*/
        "let ConType = new graphql.GraphQLObjectType({" + "\n" +
        "name: '" + Entity.capitalize() + "Con'," + "\n" +
        "fields: () => ({" + "\n" +
        "id: globalIdField('" + Entity + "')," + "\n" +
        "links: {" + "\n" +
        "type: Connection.connectionType," + "\n" +
        "args: {" + "\n" +
        "offset:{type:graphql.GraphQLInt}," + "\n" +
        "limit:{type:graphql.GraphQLInt}" + "\n" +
        "}," + "\n" +
        "resolve: (_, args) => {" + "\n" +
        "return connectionFromPromisedArray(" + "\n" +
        Entity + "Model.find()." + "\n" +
        populations + "\n" +
        "sort({createdAt: -1})" + "\n" +
        ".limit(args.first)" + "\n" +
        ".skip(args.offset)," + "\n" +
        "args" + "\n" +
        ");" + "\n" +
        "}" + "\n" +
        "}" + "\n" +
        "})" + "\n" +
        "});" + "\n"
        /*connection mutation*/
    relation_links + "\n" +

        "let LinkMutation = mutationWithClientMutationId({" + "\n" +
        "name: 'CreateLink" + Entity + "'," + "\n" +

        "inputFields: {" + "\n" +
        gqm_types + "\n" +
        "}," + "\n" +
        "outputFields: {" + "\n" +
        "linkEdge: {" + "\n" +
        "type: Connection.edgeType" + "\n" +
        "}," + "\n" +
        Entity + ": {" + "\n" +
        "type: ConType," + "\n" +
        "resolve: () => entity" + "\n" +
        "}" + "\n" +
        "}," + "\n" +
        "mutateAndGetPayload: (args) => {" + "\n" +
        "return new Promise((resolve, reject) => {" + "\n" +
        "var new" + Entity + " = new " + Entity + "Model(args);" + "\n" +
        "new" + Entity + ".save(function(err, model) {" + "\n" +
        "if (err) {" + "\n" +
        "console.log(err);" + "\n" +
        "} else {" + "\n" +
        "resolve(model);" + "\n" +
        "}" + "\n" +
        "});" + "\n" +
        "})" + "\n" +
        "}" + "\n" +
        "});" + "\n";

    /*Type file*/
    var gqcode = "var graphql=require('graphql');" + "\n" +
        "var _=require('lodash');" + "\n" +
        "var {" + "\n" +
        "globalIdField," + "\n" +
        "fromGlobalId," + "\n" +
        "nodeDefinitions," + "\n" +
        "connectionDefinitions," + "\n" +
        "connectionArgs," + "\n" +
        "connectionFromPromisedArray," + "\n" +
        "mutationWithClientMutationId" + "\n" +
        "}=require('graphql-relay')" + "\n" +
        "var " + Entity + "Model=require('../../Models/" + Entity + ".js');" + "\n" +
        "const " + Entity + "Type=new graphql.GraphQLObjectType({" + "\n" +
        "name:'" + Entity + "'," + "\n" +
        "fields :()=>{" + "\n" +
        relation_links + "\n" +
        "return{" + "\n" +
        "_id:{type:graphql.GraphQLID}," + "\n" +
        gq_types + "\n" +
        "};" + "\n" +
        "}" + "\n" +
        "});" + "\n" +
        connection_Query + "\n" +
        query_fields + "\n" +
        "const " + Entity + "InputType = new graphql.GraphQLInputObjectType({" + "\n" +
        "name: '" + Entity + "input'," + "\n" +
        "fields: () => {" + "\n" +
        relation_links + "\n" +
        "return {" + "\n" +
        "_id: {" + "\n" +
        "type: graphql.GraphQLID" + "\n" +
        "}," + "\n" +
        gqm_types +
        "}" + "\n" +
        " }" + "\n" +
        "});" + "\n" +
        "const resolver = {" + "\n" +
        "create: (obj) => {" + "\n" +
        "return new Promise((resolve, reject) => {" + "\n" +
        "var idz = [];" + "\n" +
        "if(obj){" + "\n" +
        "if (obj.length && obj.length > 0) {" + "\n" +
        "_.each(obj, function(item, k) {" + "\n" +
        "var new" + Entity + " = new " + Entity + "Model(item);" + "\n" +
        "new" + Entity + ".save(function(err, model) {" + "\n" +
        "if (err) {" + "\n" +
        "reject(err)" + "\n" +
        "} else {" + "\n" +
        "idz.push(model._id);" + "\n" +
        "if (k == obj.length - 1) {" + "\n" +
        "resolve(idz);" + "\n" +
        "}" + "\n" +
        "}" + "\n" +
        "});" + "\n" +
        "});" + "\n" +
        "}" + "\n" +
        " else {" + "\n" +
        "var new" + Entity + " = new " + Entity + "Model(obj);" + "\n" +
        "new" + Entity + ".save(function(err, model) {" + "\n" +
        "if (err) {" + "\n" +
        "reject(err)" + "\n" +
        "} else {" + "\n" +
        "resolve(model._id)" + "\n" +
        "}" + "\n" +
        "});" + "\n" +
        "}" + "\n" +
        "}" + "\n" +
        "else {" + "\n" +
        "resolve(idz)" + "\n" +
        "}" + "\n" +
        "})" + "\n" +
        "}" + "\n" +
        "}" + "\n" +
        "module.exports={" + Entity + "Fields," + Entity + "Type," + Entity + "InputType,resolver}"
    mkdirp(path.join(process.cwd(), "./" + url + "/" + u + "/Queries/"), function(err) {
        if (err) {
            return console.error(err);
        } else {
            var pathcn = "./" + url + "/" + u + "/Queries/" + Entity + "Type.js";
            fs.writeFile(pathcn, gqcode, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    next3(1)
                        /**********************/
                    var addMutation =
                        "const add = {" + "\n" +
                        "type: " + Entity + "Type." + Entity + "Type," + "\n" +
                        "args: {" + "\n" +
                        gqm_types + "\n" +
                        "}," + "\n" +
                        "resolve: (obj, args, vars) => {" + "\n" +
                        "return new Promise((resolve, reject) => {" + "\n" +
                        "async.parallel({" + "\n" +
                        resolver_function + "\n" +
                        "},function(err, results) {" + "\n" +
                        argument + "\n" +
                        "var new" + Entity + " = new " + Entity + "Model(args);" + "\n" +
                        "new" + Entity + ".save(function(err, model) {" + "\n" +
                        "if (err) {" + "\n" +
                        "console.log(err);" + "\n" +
                        "}" + "\n" +
                        "else {" + "\n" +
                        upargs+ "\n" +
                        "resolve(model);" + "\n" +
                        "}" + "\n" +
                        "});" + "\n" +
                        "});" + "\n" +
                        "})" + "\n" +
                        "}" + "\n" +
                        "};" + "\n";
                    //update mutation
                    var updateMutation =
                        "const update = {" + "\n" +
                        "type: " + Entity + "Type." + Entity + "Type," + "\n" +
                        "args: {" + "\n" +
                        "_id:{type:graphql.GraphQLID}," + "\n" +
                        gqu_types + "\n" +
                        "}," + "\n" +
                        "resolve: (obj, args, vars) => {" + "\n" +
                        "return new Promise((resolve, reject) => {" + "\n" +
                        Entity + "Model.findById({" + "\n" +
                        "_id: args._id" + "\n" +
                        "}, (err, model) => {" + "\n" +
                        "if (err) reject(err)" + "\n" +
                        "else {" + "\n";
                    _.forEach(attributes, function(value, key) {
                        updateMutation = updateMutation + "model." + value.name + "=args." + value.name + "," + "\n"
                    })
                    updateMutation = updateMutation + "model.save(function(err, edited) {" + "\n" +
                        "if (err) throw err;" + "\n" +
                        "else resolve(edited)" + "\n" +
                        "});" + "\n" +
                        "}" + "\n" +
                        "})" + "\n" +
                        "})" + "\n" +
                        "}" + "\n" +
                        "};" + "\n";
                    const delMutation =
                        //Delete Mutation
                        "const del = {" + "\n" +
                        "type: " + Entity + "Type." + Entity + "Type," + "\n" +
                        "args: {" + "\n" +
                        "_id: {" + "\n" +
                        "type: graphql.GraphQLID" + "\n" +
                        " }" + "\n" +
                        "}," + "\n" +
                        "resolve:(source, args)=> {" + "\n" +
                        " return new Promise((resolve, reject) => {" + "\n" +
                        Entity + "Model.findById({" + "\n" +
                        " _id: args._id" + "\n" +
                        "}, (err, model) => {" + "\n" +
                        "if (err) reject(err)" + "\n" +
                        "else model.remove(function(err, deleted) {" + "\n" +
                        "if (err) throw err;" + "\n" +
                        "else resolve(deleted)" + "\n" +
                        "});" + "\n" +
                        "})" + "\n" +
                        "})" + "\n" +
                        "}" + "\n" +
                        "}" + "\n";
                    if (gqm_types) {
                        var addmut = links + "\n" +
                            addMutation + "\n" +
                            "module.exports = {add}" + "\n";
                        mkdirp(path.join(process.cwd(), "./" + url + "/" + u + "/Mutations/"), function(err) {
                            if (err) {
                                return console.error(err);
                            } else {
                                var pathcn = "./" + url + "/" + u + "/Mutations/Add" + Entity + "Mutation.js";
                                fs.writeFile(pathcn, addmut, function(err) {
                                    if (err) {
                                        console.log(err);
                                    } else {

                                    }
                                });
                            }
                        });
                    }
                    if (gqu_types) {
                        var upmut = links + "\n" +
                            updateMutation + "\n" +
                            "module.exports = {update}" + "\n";
                        mkdirp(path.join(process.cwd(), "./" + url + "/" + u + "/Mutations/"), function(err) {
                            if (err) {
                                return console.error(err);
                            } else {
                                var pathcn = "./" + url + "/" + u + "/Mutations/Update" + Entity + "Mutation.js";
                                fs.writeFile(pathcn, upmut);
                            }
                        });
                    }
                    if (gqd_types) {
                        var dmut = links + "\n" +
                            delMutation + "\n" +
                            "module.exports = {del}" + "\n";
                        mkdirp(path.join(process.cwd(), "./" + url + "/" + u + "/Mutations/"), function(err) {
                            if (err) {
                                return console.error(err);
                            } else {
                                var pathcn = "./" + url + "/" + u + "/Mutations/Del" + Entity + "Mutation.js";
                                fs.writeFile(pathcn, dmut);
                            }
                        });
                    }
                    //next(1)
                    /**********************/
                }
            });
        }
    });
}

function getTypes(attrib, next4) {
    var gq_types = "";
    var gqm_types = "";
    var gqarg_types="";
    /*attributes model,query and mutation*/
    for (var a = 0; a < attrib.length; a++) {
        gq_types = gq_types + attrib[a].name + ":{type:graphql." + ((attrib[a].type == 'Int') ? 'GraphQLInt' : ((attributes[a].type == 'String') ? 'GraphQLString' : ((attrib[a].type == 'Float') ? 'GraphQLFloat' : 'GraphQLBoolean'))) + "},"
        gqarg_types = gqarg_types + attrib[a].name + ":{type:graphql." + ((attrib[a].type == 'Int') ? 'GraphQLInt' : ((attributes[a].type == 'String') ? 'GraphQLString' : ((attrib[a].type == 'Float') ? 'GraphQLFloat' : 'GraphQLBoolean'))) + "},"
        gqm_types = gqm_types + attrib[a].name + ":{type:graphql." + ((attrib[a].type == 'Int') ? 'GraphQLInt' : ((attributes[a].type == 'String') ? 'GraphQLString' : ((attrib[a].type == 'Float') ? 'GraphQLFloat' : 'GraphQLBoolean'))) + "},"
        if (a == attrib.length - 1) {
            getSch(gqm_types, gq_types, gqm_types, gqm_types,gqarg_types, function(res) {
                if (res == 1) {
                    next4(1)
                } else {
                    next4(0)
                }
            });
        }
    };

}

function getCustomTypes(c, r, u, d, next2) {
    var gq_types = "";
    var gqm_types = "";
    var gqu_types = "";
    var gqd_types = "";
    var gqarg_types="";
    if (c && c.length > 0) {
        _.forEach(c, function(v, k) {
            gqm_types = gqm_types + v.name + ":{type:graphql." + ((v.type == 'Int') ? 'GraphQLInt' : ((v.type == 'String') ? 'GraphQLString' : ((v == 'Float') ? 'GraphQLFloat' : 'GraphQLBoolean'))) + "},"
        });

    }
    if (r && r.length > 0) {
        _.forEach(r, function(v, k) {
            gq_types = gq_types + v.name + ":{type:graphql." + ((v.type == 'Int') ? 'GraphQLInt' : ((v.type == 'String') ? 'GraphQLString' : ((v == 'Float') ? 'GraphQLFloat' : 'GraphQLBoolean'))) + "},"
            gqarg_types = gqarg_types + v.name + ":{type:graphql." + ((v.type == 'Int') ? 'GraphQLInt' : ((v.type == 'String') ? 'GraphQLString' : ((v == 'Float') ? 'GraphQLFloat' : 'GraphQLBoolean'))) + "},"
        });
    }
    if (u && u.length > 0) {
        _.forEach(u, function(v, k) {
            gqu_types = gqu_types + v.name + ":{type:graphql." + ((v.type == 'Int') ? 'GraphQLInt' : ((v.type == 'String') ? 'GraphQLString' : ((v == 'Float') ? 'GraphQLFloat' : 'GraphQLBoolean'))) + "},"
        });

    }
    if (d && d.length > 0) {
        _.forEach(d, function(v, k) {
            gqd_types = gqd_types + v.name + ":{type:graphql." + ((v.type == 'Int') ? 'GraphQLInt' : ((v.type == 'String') ? 'GraphQLString' : ((v == 'Float') ? 'GraphQLFloat' : 'GraphQLBoolean'))) + "},"
        });

    }
    getSch(gqm_types, gq_types, gqu_types, gqd_types,gqarg_types,
        function(res) {
            if (res == 1) {
                next2(1)
            } else {
                next2(0)
            }
        });
}
}
}

function getRights(r, a, next) {
    //console.log(r);
    //console.log(a);
    var C_atts = [];
    var R_atts = [];
    var U_atts = [];
    var D_atts = [];
    _.forEach(a, function(v, k) {
        if (r['c'] && r['c'].indexOf(v.name) !== -1) {
            C_atts.push(v);
        }
        if (r['r'] && r['r'].indexOf(v.name) !== -1) {
            R_atts.push(v);
        }
        if (r['u'] && r['u'].indexOf(v.name) !== -1) {
            U_atts.push(v);
        }
        if (r['d'] && r['d'].indexOf(v.name) !== -1) {
            D_atts.push(v);
        }
        if (k == a.length - 1) {
            next(C_atts, R_atts, U_atts, D_atts);
        }
    });

}
